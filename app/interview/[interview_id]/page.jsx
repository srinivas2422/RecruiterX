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
    <div className="px-10 mt-5">
      <div
        className="flex flex-col items-center 
        justify-center border rounded-lg bg-white
        p-7 mb-20"
      >
        <Image
          src={"/logo.png"}
          alt="logo"
          width={200}
          height={100}
          className="w-35"
        />
        <h2 className="mt-3">AI-Powered Interview Platform</h2>
        <Image
          src={"/interview.jpg"}
          alt="interview"
          width={300}
          height={300}
          className="w-70 my-6"
        />
        <h2 className="font-bold text-xl">{interviewData?.jobPosition}</h2>
        <h2 className="flex gap-2 items-center text-gray-500 mt-3">
          {" "}
          <Clock className="h-4 w-4" /> {interviewData?.duration}
        </h2>

        <div className="mt-5">
          <h2>Enter your full name</h2>
          <Input
            placeholder="e.g. Aditya Saketh"
            onChange={(event) => setUserName(event.target.value)}
          />
        </div>

        <div className="mt-5">
          <h2>Enter your Email</h2>
          <Input
            placeholder="e.g. aditya@gmail.com"
            onChange={(event) => setUserEmail(event.target.value)}
          />
        </div>
        <div className="p-3 bg-blue-100 flex gap-4 rounded-xl mt-5">
          <Info className="text-primary" />
          <div>
            <h2 className="font-bold">Before you begin</h2>
            <ul>
              <li className="text-sm text-primary">
                Test your camera and microphone
              </li>
              <li className="text-sm text-primary">
                Ensure you have a stable internet connection
              </li>
              <li className="text-sm text-primary">
                Find a Quiet place for interview
              </li>
            </ul>
          </div>
        </div>
        <Button
          className={"mt-5 font-bold mb-5"}
          disabled={loading || !userName}
          onClick = {() => onJoinInterview()}
        >
          <Video /> {loading && <Loader2Icon/>} Join Interview{" "}
        </Button>
        <div className="mt-5"> </div>
      </div>
    </div>
  );
}

export default Interview;
