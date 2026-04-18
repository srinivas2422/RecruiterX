"use client";
import { InterviewDataContext } from "@/context/InterviewDataContext";
import { Timer, Mic, Phone, Loader2Icon } from "lucide-react";
import Image from "next/image";
import React, { useContext, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";
import axios from "axios";
import { supabase } from "@/services/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import * as faceapi from "@vladmandic/face-api";

function StartInterview() {
  const { interviewInfo } = useContext(InterviewDataContext);
  const [conversation, setConversation] = useState([]);
  const conversationRef = useRef([]);
  const { interview_id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState();
  const vapiRef = useRef(null);
  const callStartedRef = useRef(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const lastSpeechTime = useRef(null);
  const [emotion, setEmotion] = useState(null);
  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const speakingTimeout = useRef(null);
  const [speechConfidence, setSpeechConfidence] = useState(null);
  const [eyeContactScore, setEyeContactScore] = useState(null);
  const [headStability, setHeadStability] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const prevNoseX = useRef(null);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const questionEndTime = useRef(null);
  const faceMeshStarted = useRef(false);
  const isProcessing = useRef(false);
  const canvasRef = useRef(null);
  const userSpeechStart = useRef(null);
  const lastChunkTime = useRef(null);
  const pauseTime = useRef(0);
  const liveTranscript = useRef("");
  const isUserSpeaking = useRef(false);
  const [confidenceTimeline, setConfidenceTimeline] = useState([]);
  const confidenceRef = useRef([]);
  const isDetecting = useRef(false);
  const confidenceValueRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  // ✅ FIX 1: Use a ref so detectEmotion always reads fresh value (no stale closure)
  const modelsLoadedRef = useRef(false);

  const formatTime = (sec) => {
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  useEffect(() => {
    if (window.FaceMesh) return;

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";
    script.async = true;

    script.onload = () => {
      console.log("FaceMesh Loaded");
    };

    document.body.appendChild(script);
  }, []);

  // ✅ FIX 3: Track stream and stop camera tracks on unmount
  useEffect(() => {
    let stream = null;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.onloadeddata = () => {
            videoRef.current.play();
            startFaceTracking();
          };
        }
      } catch (err) {
        console.log("Camera error:", err);
      }
    }

    startCamera();

    // ✅ Stop all camera tracks when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startFaceTracking = () => {
    if (faceMeshStarted.current) return;
    faceMeshStarted.current = true;

    if (!window.FaceMesh || !videoRef.current) return;

    const faceMesh = new window.FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (
        !results.multiFaceLandmarks ||
        results.multiFaceLandmarks.length === 0
      ) {
        setEyeContactScore(null);
        setHeadStability(null);
        setConfidence(null);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        return;
      }

      const landmarks = results.multiFaceLandmarks[0];

      // 👀 Eye Contact
      const leftEye = landmarks[33];
      const rightEye = landmarks[263];
      const nose = landmarks[1];

      if (!leftEye || !rightEye || !nose) {
        setEyeContactScore(null);
        setHeadStability(null);
        setConfidence(null);
        return;
      }
      const faceCenter = (leftEye.x + rightEye.x) / 2;
      const eyeAlignment = Math.abs(faceCenter - nose.x);
      const eyeScore = Math.max(0, 1 - eyeAlignment * 30);

      // 🤕 Head Movement
      let stability = 1;
      if (prevNoseX.current !== null) {
        const movementX = Math.abs(nose.x - prevNoseX.current?.x ?? 0);
        const movementY = Math.abs(nose.y - prevNoseX.current?.y ?? 0);

        const movement = movementX + movementY;
        stability = Math.max(0, 1 - movement * 25);
      }
      prevNoseX.current = { x: nose.x, y: nose.y };

      // 🔥 SMOOTHING
      const smooth = (prev, curr) =>
        prev === null ? curr : prev * 0.8 + curr * 0.2;

      setEyeContactScore((prev) => smooth(prev, eyeScore));
      setHeadStability((prev) => smooth(prev, stability));

      // 🎯 DRAW FACE BOX
      const xs = landmarks.map((p) => p.x);
      const ys = landmarks.map((p) => p.y);

      const minX = Math.min(...xs) * canvas.width;
      const maxX = Math.max(...xs) * canvas.width;
      const minY = Math.min(...ys) * canvas.height;
      const maxY = Math.max(...ys) * canvas.height;
      const size = Math.max(maxX - minX, maxY - minY);
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 3;
      ctx.strokeRect(minX, minY, size, size);
    });

    let lastTime = 0;

    const detect = async (time) => {
      if (!videoRef.current || !canvasRef.current) return;

      if (time - lastTime < 100) {
        requestAnimationFrame(detect);
        return;
      }

      lastTime = time;

      if (videoRef.current.readyState !== 4 || isProcessing.current) {
        requestAnimationFrame(detect);
        return;
      }

      isProcessing.current = true;

      try {
        await faceMesh.send({ image: videoRef.current });
      } catch (e) {
        console.log("FaceMesh error prevented:", e);
      }

      isProcessing.current = false;

      requestAnimationFrame(detect);
    };

    detect();
  };

  // ✅ FIX 2: Cancellation flag prevents setState on unmounted component
  useEffect(() => {
    let cancelled = false;

    const loadModels = async () => {
      try {
        await faceapi.tf.setBackend("webgl");
        await faceapi.tf.ready();

        const MODEL_URL = "/models";
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

        // ✅ Only update state if component is still mounted
        if (!cancelled) {
          console.log("Models loaded ✅");
          modelsLoadedRef.current = true; // ✅ FIX 1: also update ref
          setModelsLoaded(true);
        }
      } catch (err) {
        console.error("Model load error:", err);
      }
    };

    loadModels();

    // ✅ Cleanup: cancel any pending setState
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!modelsLoaded) return;

    const interval = setInterval(() => {
      detectEmotion();
    }, 1000);

    return () => clearInterval(interval);
  }, [modelsLoaded]);

  const detectEmotion = async () => {
    if (
      !videoRef.current ||
      isDetecting.current ||
      !modelsLoadedRef.current || // ✅ FIX 1: use ref instead of state (no stale closure)
      videoRef.current.readyState < 2 ||
      videoRef.current.videoWidth === 0
    )
      return;

    isDetecting.current = true;

    try {
      const detection = await faceapi
        .detectSingleFace(
          videoRef.current,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 224,
            scoreThreshold: 0.3,
          }),
        )
        .withFaceExpressions();

      if (detection?.expressions) {
        const maxEmotion = Object.entries(detection.expressions).reduce(
          (a, b) => (a[1] > b[1] ? a : b),
        )[0];
        setEmotion(maxEmotion);
      } else {
        setEmotion(null);
      }
    } catch (err) {
      console.error("Emotion error:", err);
    }

    isDetecting.current = false;
  };

  useEffect(() => {
    if (eyeContactScore === null || headStability === null) {
      setConfidence(null);
      return;
    }

    const emotionScoreMap = {
      happy: 1,
      neutral: 0.7,
      surprised: 0.6,
      sad: 0.3,
      angry: 0.2,
      fearful: 0.2,
      disgusted: 0.2,
    };

    const emotionScore = emotionScoreMap[emotion] || 0.5;
    const speechScore =
      activeSpeaker === "user" ? (speechConfidence ?? 0.5) : 0.5;
    const speakingBoost = activeSpeaker === "user" ? 0.1 : 0;

    const score =
      eyeContactScore * 0.3 +
      headStability * 0.2 +
      emotionScore * 0.2 +
      speechScore * 0.3 +
      speakingBoost;

    setConfidence(score.toFixed(2));
  }, [
    eyeContactScore,
    headStability,
    emotion,
    speechConfidence,
    activeSpeaker,
  ]);

  useEffect(() => {
    confidenceValueRef.current = confidence;
  }, [confidence]);

  useEffect(() => {
    console.log("Confidence updated:", confidence);
  }, [confidence]);

  // ✅ Create Vapi ONLY once
  useEffect(() => {
    if (vapiRef.current) return;
    vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);

    const vapi = vapiRef.current;

    const handleMessage = (message) => {
      console.log(message);
      if (message.type === "conversation-update" && message.conversation) {
        setConversation((prev) => {
          conversationRef.current = message.conversation;
          return message.conversation;
        });
      }

      const now = Date.now();

      if (message.type === "speech-update") {
        if (message.role === "assistant" && message.status === "stopped") {
          setIsUserTurn(true);
          questionEndTime.current = now;
          lastSpeechTime.current = null;
          pauseTime.current = 0;
          liveTranscript.current = "";
          console.log("AI stopped → user turn");
        }

        if (message.role === "user" && message.status === "started") {
          isUserSpeaking.current = true;

          if (isUserTurn && lastSpeechTime.current === null) {
            const delay = (now - questionEndTime.current) / 1000;
            lastSpeechTime.current = delay;
            console.log("Delay:", delay);
          }

          userSpeechStart.current = now;
          lastChunkTime.current = now;
        }

        if (message.role === "user" && message.status === "stopped") {
          isUserSpeaking.current = false;
          console.log("User stopped");
          setIsUserTurn(false);
        }
      }

      if (message.type === "transcript" && message.role === "user") {
        if (!isUserSpeaking.current) return;

        setActiveSpeaker("user");

        if (lastChunkTime.current) {
          const gap = (now - lastChunkTime.current) / 1000;
          if (gap > 0.7) {
            pauseTime.current += gap;
            console.log("Pause:", gap);
          }
        }

        lastChunkTime.current = now;
        liveTranscript.current = message.transcript;

        const score = calculateLiveScore({
          text: liveTranscript.current,
          delay: lastSpeechTime.current || 0,
          pauseTime: pauseTime.current,
        });

        setSpeechConfidence(score);
      }

      if (message.type === "transcript" && message.role === "assistant") {
        setActiveSpeaker("ai");
      }

      clearTimeout(speakingTimeout.current);
      speakingTimeout.current = setTimeout(() => {
        setActiveSpeaker(null);
      }, 1000);
    };

    vapi.on("call-start", () => {
      console.log("Call has started.");
      toast("Call Connected...");

      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          const newSec = prev + 1;
          const currentConfidence = confidenceValueRef.current;

          console.log("CONF:", currentConfidence);

          if (currentConfidence !== null) {
            const point = {
              time: new Date().toISOString(),
              second: newSec,
              value: Number(currentConfidence),
            };

            confidenceRef.current.push(point);
            setConfidenceTimeline([...confidenceRef.current]);
          }

          return newSec;
        });
      }, 1000);
    });

    vapi.on("call-end", () => {
      console.log("Call has ended.");
      toast("Interview Ended");
      clearInterval(timerRef.current);
      setActiveSpeaker(null);
      GenerateFeedback();
    });

    vapi.on("message", (msg) => {
      handleMessage(msg);
    });

    vapi.on("error", (err) => console.log("Vapi error:", err));

    return () => {
      vapi.off("message", () => console.log("END"));
      vapi.off("call-start", () => console.log("END"));
      vapi.off("call-end", () => console.log("END"));
      vapi.off("call-error", () => console.log("END"));
      vapi.stop();
      clearInterval(timerRef.current);
      clearTimeout(speakingTimeout.current);
    };
  }, []);

  const calculateLiveScore = ({ text, delay, pauseTime }) => {
    const lowerText = text.toLowerCase().trim();

    const fillers = ["um", "uh", "like", "you know", "hmm", "ah"];
    let fillerCount = 0;

    fillers.forEach((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "g");
      const matches = lowerText.match(regex);
      if (matches) fillerCount += matches.length;
    });

    const words = lowerText.split(" ").filter(Boolean);
    const wordCount = words.length;

    let score = 0.7;

    if (delay > 5) score -= 0.15;
    else if (delay > 3) score -= 0.1;
    else if (delay > 2) score -= 0.05;

    if (pauseTime > 6) score -= 0.2;
    else if (pauseTime > 4) score -= 0.15;
    else if (pauseTime > 2) score -= 0.1;
    else if (pauseTime > 1) score -= 0.05;

    const fillerPenalty = Math.min(fillerCount * 0.04, 0.2);
    score -= fillerPenalty;

    if (wordCount < 3) score -= 0.3;
    else if (wordCount < 6) score -= 0.15;

    const fluency = Math.min(wordCount / 25, 1);
    score += fluency * 0.25;

    if (pauseTime < 1.5 && fillerCount === 0 && wordCount > 8) {
      score += 0.1;
    }

    const uniqueWords = new Set(words);
    const repetitionRatio = uniqueWords.size / wordCount;
    if (repetitionRatio < 0.5) score -= 0.1;

    score = Math.max(0, Math.min(1, score));
    return Number(score.toFixed(2));
  };

  useEffect(() => {
    const questions = interviewInfo?.interviewData?.questionList;

    if (questions?.length > 0 && !callStartedRef.current && vapiRef.current) {
      callStartedRef.current = true;
      startCall();
    }
  }, [interviewInfo]);

  const startCall = async () => {
    const questionList = interviewInfo.interviewData.questionList
      .map((q) => q.question)
      .join(", ");

    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage:
        "Hi " +
        interviewInfo?.userName +
        " , how are you? Ready for your interview on " +
        interviewInfo?.interviewData?.jobPosition,

      // ✅ ADD THIS - required by newer Vapi versions
      voice: {
        provider: "playht",
        voiceId: "jennifer",
      },

      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      model: {
        provider: "openai",
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              `
    You are an AI voice assistant conducting interviews.
Your job is to ask candidates provided interview questions, assess their responses.
Begin the conversation with a friendly introduction, setting a relaxed yet professional tone. Example:
"Hey there! Welcome to your ` +
              interviewInfo?.interviewData?.jobPosition +
              ` interview. Let's get started with a few questions!"
Ask one question at a time and wait for the candidate's response before proceeding. Keep the questions clear and concise. Below are 
the questions ask one by one:
Questions: ` +
              questionList +
              `
If the candidate struggles, offer hints or rephrase the question without giving away the answer. Example:
"Need a hint? Think about how React tracks component updates!"
Provide brief, encouraging feedback after each answer. Example:
"Nice! That's a solid answer."
"Hmm, not quite! Want to try again?"
Keep the conversation natural and engaging—use casual phrases like "Alright, next up..." or "Let's tackle a tricky one!"
After 5–7 questions, wrap up the interview smoothly by summarizing their performance. Example:
"That was great! You handled some tough questions well. Keep sharpening your skills!"
End on a positive note:
"Thanks for chatting! Hope to see you crushing projects soon."
Key Guidelines:
✅ Be friendly, engaging, and witty 🎤  
✅ Keep responses short and natural, like a real conversation  
✅ Adapt based on the candidate's confidence level  
✅ Ensure the interview remains focused on React
        `.trim(),
          },
        ],
      },
    };

    try {
      await vapiRef.current.start(assistantOptions);
    } catch (err) {
      console.log("Start failed:", err);
    }
  };

  const stopInterview = () => {
    vapiRef.current?.stop();
  };

  const calculateAverageConfidence = () => {
    if (!confidenceRef.current || confidenceRef.current.length === 0) return 0;

    const sum = confidenceRef.current.reduce((acc, item) => {
      return acc + (item.value || 0);
    }, 0);

    return Number((sum / confidenceRef.current.length).toFixed(2));
  };

  const GenerateFeedback = async () => {
    console.log("FINAL CONVERSATION:", conversationRef.current);

    const { data: interviewData, error: interviewError } = await supabase
      .from("Interviews")
      .select("jobPosition, jobDescription, type")
      .eq("interview_id", interview_id)
      .single();

    if (interviewError) {
      console.log("Error fetching interview:", interviewError);
      return;
    }
    console.log("Interview Data:", interviewData);

    const result = await axios.post("/api/ai-feedback", {
      conversation: conversationRef.current,
      jobPosition: interviewData.jobPosition,
      jobDescription: interviewData.jobDescription,
      interviewType: interviewData.type,
    });
    console.log(result.data);
    const Content = result.data.content;
    const FINAL_CONTENT = Content.replace("```json", "").replace("```", "");
    console.log(FINAL_CONTENT);

    const feedbackData = JSON.parse(FINAL_CONTENT);
    console.log("FINAL TIMELINE:", confidenceRef.current);

    // =========================
    // 🧠 NEW: FINAL ANALYSIS
    // =========================
    const analysisRes = await axios.post("/api/nlu-analysis", {
      conversation: conversationRef.current,
      jobRole: interviewData.jobPosition,
    });

    const analysis = analysisRes.data;

    console.log("FINAL ANALYSIS:", analysis);

    // =========================
    // 📊 AVERAGE CONFIDENCE
    // =========================
    const avgConfidence = calculateAverageConfidence();

    // ✅ 4. SKILL SCORES (already in your feedback)
    const technical = feedbackData?.feedback?.rating?.technicalSkills || 0;
    const communication = feedbackData?.feedback?.rating?.communication || 0;
    const problemSolving = feedbackData?.feedback?.rating?.problemSolving || 0;
    const experience = feedbackData?.feedback?.rating?.experience || 0;
    const skillScore =
      (technical + communication + problemSolving + experience) / 40;

    const sentimentScore = analysis.sentiment_score || 0;
    const nluScore = analysis.nlu_score || 0;

    // ✅ 5. FINAL HOLISTIC SCORE
    const finalScore =
      avgConfidence * 0.3 +
      sentimentScore * 0.1 +
      nluScore * 0.2 +
      skillScore * 0.4;

    const finalFitScore = Number((finalScore * 10).toFixed(1));

    console.log("FINAL SCORE:", finalFitScore);

    const { data, error } = await supabase
      .from("interview-feedback")
      .insert([
        {
          userName: interviewInfo?.userName,
          userEmail: interviewInfo?.userEmail,
          interview_id: interview_id,
          feedback: feedbackData,
          recommended: feedbackData.feedback.recommendation,
          confidence_timeline: confidenceRef.current,

          avg_confidence: avgConfidence,

          sentiment_score: analysis.sentiment_score,
          nlu_score: analysis.nlu_score,
          intent: analysis.intent,
          detected_skills: analysis.skills_detected,
          final_score: finalFitScore,
        },
      ])
      .select();

    if (error) {
      console.error("Insert error:", error);
    } else {
      console.log("Saved:", data);
    }
    router.replace("/interview/" + interview_id + "/completed");
  };

  return (
    <div className="p-20 lg:px-48 xl:px-56">
      {/* HEADER */}
      <h2 className="font-bold text-xl flex justify-between">
        AI Interview Session
        <span className="flex gap-2 items-center">
          <Timer />
          {formatTime(seconds)}
        </span>
      </h2>

      {/* CARDS */}
      <div className="grid md:grid-cols-2 gap-7 mt-5">
        {/* AI */}
        <div
          className={`relative bg-white h-100 rounded-lg border flex flex-col items-center justify-center transition-all duration-300
          ${activeSpeaker === "ai" ? "scale-105 shadow-[0_0_50px_rgba(56,189,248,0.7)]" : ""}
        `}
        >
          {activeSpeaker === "ai" && (
            <>
              <div className="absolute w-48 h-48 border-4 border-sky-400 rounded-full animate-ping"></div>
              <div className="absolute w-64 h-64 bg-sky-400/20 blur-3xl rounded-full"></div>
            </>
          )}

          <Image
            src="/ai.avif"
            alt="AI"
            width={100}
            height={100}
            className="rounded-full z-10"
          />
          <h2 className="z-10">AI Recruiter</h2>
        </div>

        {/* USER */}
        <div
          className={`relative bg-white h-100 rounded-lg border flex flex-col items-center justify-center transition-all duration-300
          ${activeSpeaker === "user" ? "scale-105" : ""}
        `}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-lg"
          />

          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute top-0 left-0 w-full h-full"
          />

          <h2 className="absolute bottom-2 bg-black/60 text-white px-3 py-1 rounded z-10">
            {interviewInfo?.userName}
          </h2>

          <div className="absolute top-2 left-2 bg-black/60 text-white px-3 py-1 rounded text-xs z-10">
            {eyeContactScore !== null && headStability !== null ? (
              <>
                <p>Eye: {eyeContactScore.toFixed(2)}</p>
                <p>Head: {headStability.toFixed(2)}</p>
                <p>Emotion: {emotion}</p>
                <p>Speech: {speechConfidence?.toFixed(2)}</p>
                <p>Confidence: {confidence}</p>
              </>
            ) : (
              <p>No face detected</p>
            )}
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="flex gap-5 justify-center mt-7">
        <Mic className="h-12 w-12 p-3 bg-gray-500 rounded-full" />

        {!loading ? (
          <Phone
            className="h-12 w-12 p-3 bg-red-500 rounded-full cursor-pointer"
            onClick={() => stopInterview()}
          />
        ) : (
          <Loader2Icon className="animate-spin" />
        )}
      </div>

      <h2 className="text-sm text-gray-400 text-center mt-5">
        Interview in Progress...
      </h2>
    </div>
  );
}

export default StartInterview;
