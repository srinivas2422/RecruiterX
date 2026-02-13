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
  const {interview_id} = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState();
  const vapiRef = useRef(null);
  const callStartedRef = useRef(false);

  // ✅ Create Vapi ONLY once
  useEffect(() => {
    if (vapiRef.current) return;
    vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY);

    const vapi = vapiRef.current;

    const handleMessage = (message) => {
      console.log('Message:', message);
      if (message?.conversation) {
        const convoString = JSON.stringify(message.conversation);
        console.log('Conversation string:', convoString);
        setConversation(convoString);
      }
    };

    vapi.on("call-start", () => {
      console.log("Call has started.");
      toast("Call Connected...");
    });

    vapi.on("call-end", () => {
      console.log("Call has ended.");
      toast("Interview Ended");
      GenerateFeedback();
    });

    vapi.on("message", handleMessage);

    vapi.on("error", (err) => console.log("Vapi error:", err));

    return () => {
      vapi.off("message", handleMessage);
      vapi.off('call-start', ()=> console.log("END"));
      vapi.off('call-end', ()=> console.log("END"));
      vapi.off('call-error', ()=> console.log("END"));
      vapi.stop();
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
      .insert([{ userName: interviewInfo?.userName, 
        userEmail: interviewInfo?.userEmail,
        interview_id: interview_id,
        feedback: JSON.parse(FINAL_CONTENT),
        recommended: false
       }])
      .select();
      console.log(data);
      router.replace('/interview/'+interview_id+'/completed');
  };
  return (
    <div className="p-20 lg:px-48 xl:px-56">
      <h2 className="font-bold text-xl flex justify-between">
        AI Interview Session
        <span className="flex gap-2 items-center">
          <Timer />
          00:00:00
        </span>
      </h2>

      <div className="grid md:grid-cols-2 gap-7 mt-5">
        <div className="bg-white h-100 rounded-lg border flex flex-col items-center justify-center">
          <Image
            src="/ai.avif"
            alt="AI"
            width={100}
            height={100}
            className="rounded-full"
          />
          <h2>AI Recruiter</h2>
        </div>

        <div className="bg-white h-100 rounded-lg border flex flex-col items-center justify-center">
          <h2 className="text-2xl bg-primary text-white p-3 rounded-full">
            {interviewInfo?.userName?.[0]}
          </h2>
          <h2>{interviewInfo?.userName}</h2>
        </div>
      </div>

      <div className="flex gap-5 justify-center mt-7">
        <Mic className="h-12 w-12 p-3 bg-gray-500 rounded-full" />

        {/* <AlertConfirmation stopInterview={stopInterview}> */}
        {!loading ? <Phone className="h-12 w-12 p-3 bg-red-500 rounded-full" 
            onClick={() => stopInterview()}
        /> : <Loader2Icon className="animate-spin"/>}
          
        {/* </AlertConfirmation> */}
      </div>

      <h2 className="text-sm text-gray-400 text-center mt-5">
        Interview in Progress...
      </h2>
    </div>
  );
}

export default StartInterview;
