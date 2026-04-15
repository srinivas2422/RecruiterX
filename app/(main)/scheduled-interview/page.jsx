"use client";
import { useUser } from "@/app/provider";
import { supabase } from "@/services/supabaseClient";
import React, { useEffect, useState } from "react";
import InterviewCard from "../dashboard/_components/InterviewCard";
import { Video } from "lucide-react";

function ScheduledInterview() {
  const { user } = useUser();

  const [interviewList, setInterviewList] = useState();

  useEffect(() => {
    user && GetInterviewList();
  }, [user]);

  const GetInterviewList = async () => {
    const result = await supabase
      .from("Interviews")
      .select("created_at,jobPosition,duration,interview_id,interview-feedback(userEmail)")
      .eq("userEmail", user?.email)
      .order("id", { ascending: false });

    console.log(result);
    setInterviewList(result.data);
  };

  return (
    <div className="mt-5">
      <h2 className="font-bold text-2xl">
        Interview List with candidate Feedback
      </h2>
      {interviewList?.length == 0 && (
        <div className="p-5 flex flex-col gap-3 items-center bg-white rounded-lg mt-10">
          <Video className="h-10 w-10 text-primary" />
          <h2>You don't have any interview created!</h2>
          <button className="bg-blue-500 text-white px-4 py-2 rounded">
            + Create New Interview
          </button>
        </div>
      )}
      {interviewList && (
        <div className="grid grid-cols-2 mt-5 xl:grid-cols-3 gap-5">
          {interviewList?.map((interview, index) => (
            <InterviewCard
              interview={interview}
              key={index}
              viewDetail={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ScheduledInterview;
