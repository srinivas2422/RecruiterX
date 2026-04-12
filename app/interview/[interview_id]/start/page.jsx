"use client";
import { InterviewDataContext } from "@/context/InterviewDataContext";
import { Timer, Mic, Phone, Loader2Icon } from "lucide-react";
import Image from "next/image";
import React, { useContext, useEffect, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import AlertConfirmation from "./_components/AlertConfirmation";
import { toast } from "sonner";
import axios from "axios";
import { supabase } from "@/services/supabaseClient";
import { useParams, useRouter } from "next/navigation";

function StartInterview() {
  const { interviewInfo } = useContext(InterviewDataContext);
  const [conversation, setConversation] = useState();
  const { interview_id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState();
  const vapiRef = useRef(null);
  const callStartedRef = useRef(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  const [activeSpeaker, setActiveSpeaker] = useState(null);
  const speakingTimeout = useRef(null);

  const [eyeContactScore, setEyeContactScore] = useState(null);
  const [headStability, setHeadStability] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const prevNoseX = useRef(null);

  const faceMeshStarted = useRef(false);
  const isProcessing = useRef(false);
  const canvasRef = useRef(null);

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

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          videoRef.current.onloadeddata = () => {
            videoRef.current.play();
            startFaceTracking(); // ✅ start here
          };
        }
      } catch (err) {
        console.log("Camera error:", err);
      }
    }

    startCamera();
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
        // ✅ 10 FPS
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

  useEffect(() => {
    if (eyeContactScore === null || headStability === null) {
      setConfidence(null);
      return;
    }

    const speakingBoost = activeSpeaker === "user" ? 0.2 : 0;

    const score =
      eyeContactScore * 0.5 +
      headStability * 0.3 +
      speakingBoost;

    setConfidence(score.toFixed(2));
  }, [eyeContactScore, headStability, activeSpeaker]);

  // ✅ Create Vapi ONLY once
  useEffect(() => {
    if (vapiRef.current) return;
    vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);

    const vapi = vapiRef.current;

    const handleMessage = (message) => {
      console.log("Message:", message);
      if (message?.conversation) {
        const convoString = JSON.stringify(message.conversation);
        console.log("Conversation string:", convoString);
        setConversation(convoString);
      }
      if (message?.role === "assistant") {
        setActiveSpeaker("ai");
      }

      if (message?.role === "user") {
        setActiveSpeaker("user");
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
        setSeconds((prev) => prev + 1);
      }, 1000);
    });

    vapi.on("call-end", () => {
      console.log("Call has ended.");
      toast("Interview Ended");
      clearInterval(timerRef.current);
      setActiveSpeaker(null);
      GenerateFeedback();
    });

    vapi.on("message", handleMessage);

    vapi.on("error", (err) => console.log("Vapi error:", err));

    return () => {
      vapi.off("message", handleMessage);
      vapi.off("call-start", () => console.log("END"));
      vapi.off("call-end", () => console.log("END"));
      vapi.off("call-error", () => console.log("END"));
      vapi.stop();
      clearInterval(timerRef.current);
      clearTimeout(speakingTimeout.current);
    };
  }, []);

  // ✅ Start call safely
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
Ask one question at a time and wait for the candidate’s response before proceeding. Keep the questions clear and concise. Below are 
the questions ask one by one:
Questions: ` +
              questionList +
              `
If the candidate struggles, offer hints or rephrase the question without giving away the answer. Example:
"Need a hint? Think about how React tracks component updates!"
Provide brief, encouraging feedback after each answer. Example:
"Nice! That’s a solid answer."
"Hmm, not quite! Want to try again?"
Keep the conversation natural and engaging—use casual phrases like "Alright, next up..." or "Let’s tackle a tricky one!"
After 5–7 questions, wrap up the interview smoothly by summarizing their performance. Example:
"That was great! You handled some tough questions well. Keep sharpening your skills!"
End on a positive note:
"Thanks for chatting! Hope to see you crushing projects soon."
Key Guidelines:
✅ Be friendly, engaging, and witty 🎤  
✅ Keep responses short and natural, like a real conversation  
✅ Adapt based on the candidate’s confidence level  
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

  const GenerateFeedback = async () => {
    const result = await axios.post("/api/ai-feedback", {
      conversation: conversation,
    });

    console.log(result?.data);
    const Content = result.data.content;
    const FINAL_CONTENT = Content.replace("```json", "").replace("```", "");
    console.log(FINAL_CONTENT);

    //Save to Database

    const { data, error } = await supabase
      .from("interview-feedback")
      .insert([
        {
          userName: interviewInfo?.userName,
          userEmail: interviewInfo?.userEmail,
          interview_id: interview_id,
          feedback: JSON.parse(FINAL_CONTENT),
          recommended: false,
        },
      ])
      .select();
    console.log(data);
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
          ${activeSpeaker === "user" ? "scale-105 shadow-[0_0_50px_rgba(59,130,246,0.7)]" : ""}
        `}
        >
          {activeSpeaker === "user" && (
            <>
              <div className="absolute w-48 h-48 border-4 border-blue-500 rounded-full animate-ping"></div>
              <div className="absolute w-64 h-64 bg-blue-400/20 blur-3xl rounded-full"></div>
            </>
          )}

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
