"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Info, Loader2Icon, Video } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useContext, useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";
import { toast } from "sonner";
import { InterviewDataContext } from "@/context/InterviewDataContext";

function Interview() {
  const { interview_id } = useParams();
  console.log(interview_id);
  const [interviewData, setInterviewData] = useState();
  const [userName, setUserName] = useState();
  const [userEmail, setUserEmail] = useState();
  const [loading, setLoading] = useState(false);
  const { interviewInfo, setInterviewInfo } = useContext(InterviewDataContext);
  const router = useRouter();

  useEffect(() => {
    interview_id && GetInterviewDetails();
  }, [interview_id]);

  const GetInterviewDetails = async () => {
    setLoading(true);
    try {
      let { data: Interviews, error } = await supabase
        .from("Interviews")
        .select("jobPosition,jobDescription,duration,type")
        .eq("interview_id", interview_id);
      setInterviewData(Interviews[0]);
      setLoading(false);
      if (Interviews?.length == 0) {
        toast("Incorrect Interview Link");
        return;
      }
    } catch (e) {
      setLoading(false);
      toast("Incorrect Interview Link");
    }
  };
  
  console.log(interviewData)
  const onJoinInterview = async () => {
    setLoading(true);
    let { data: Interviews, error } = await supabase
      .from("Interviews")
      .select("*")
      .eq("interview_id", interview_id);

    setInterviewInfo({
        userName : userName,
        userEmail : userEmail,
        interviewData : Interviews[0]
    });
    router.push('/interview/'+interview_id+'/start');
    setLoading(false);
  };


  console.log(interviewInfo);
  return (
    <div className="px-6 md:px-10 mt-10 flex justify-center">
  <div
    className="w-full max-w-2xl flex flex-col items-center 
    border border-slate-200 rounded-3xl 
    bg-white/80 backdrop-blur-xl
    shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]
    p-8 md:p-10 mb-20 transition-all"
  >
    {/* Logo */}
    <Image
      src={"/logo.png"}
      alt="logo"
      width={200}
      height={100}
      className="w-32 mb-2"
    />

    <h2 className="mt-2 text-sm text-slate-500 tracking-wide">
      AI-Powered Interview Platform
    </h2>

    {/* Illustration */}
    <Image
      src={"/interview.jpg"}
      alt="interview"
      width={300}
      height={300}
      className="w-64 my-6 rounded-2xl shadow-md"
    />

    {/* Job Title */}
    <h2 className="font-extrabold text-2xl text-slate-900 tracking-tight">
      {interviewData?.jobPosition}
    </h2>

    <h2 className="flex gap-2 items-center text-slate-500 mt-2 text-sm">
      <Clock className="h-4 w-4" />
      {interviewData?.duration}
    </h2>

    {/* Inputs */}
    <div className="mt-6 w-full space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-1">
          Enter your full name
        </h2>
        <Input
          placeholder="e.g. Aditya Saketh"
          className="h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-sky-500"
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-1">
          Enter your Email
        </h2>
        <Input
          placeholder="e.g. aditya@gmail.com"
          className="h-11 rounded-xl focus-visible:ring-2 focus-visible:ring-sky-500"
          onChange={(e) => setUserEmail(e.target.value)}
        />
      </div>
    </div>

    {/* Info Box */}
    <div className="p-4 bg-linear-to-r from-blue-50 to-sky-100 
      flex gap-4 rounded-2xl mt-6 border border-blue-100 shadow-sm">
      
      <Info className="text-blue-600 mt-1" />
      
      <div>
        <h2 className="font-bold text-blue-700 mb-1">
          Before you begin
        </h2>
        <ul className="space-y-1">
          <li className="text-sm text-blue-600">
            Test your camera and microphone
          </li>
          <li className="text-sm text-blue-600">
            Ensure you have a stable internet connection
          </li>
          <li className="text-sm text-blue-600">
            Find a Quiet place for interview
          </li>
        </ul>
      </div>
    </div>

    {/* Button */}
    <Button
      className="mt-8 w-full h-12 rounded-xl font-bold text-base 
      shadow-lg shadow-sky-500/20 
      hover:scale-[1.02] active:scale-95 transition-all"
      disabled={loading || !userName}
      onClick={onJoinInterview}
    >
      <Video className="mr-2" />
      {loading && <Loader2Icon className="animate-spin mr-2" />}
      Join Interview
    </Button>
  </div>
</div>
  );
}

export default Interview;
