"use client";
import { InterviewDataContext } from "@/context/InterviewDataContext";
import { Mic, Phone, Timer } from "lucide-react";
import Image from "next/image";
import React, { useContext } from "react";

function StartInterview() {
  const { interviewInfo } = useContext(InterviewDataContext);

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 lg:px-32 xl:px-40">
      {/* HEADER */}
      <div className="bg-white rounded-xl border px-6 py-4 flex justify-between items-center">
        <h2 className="font-bold text-lg">AI Interview Session</h2>
        <span className="flex gap-2 items-center text-gray-600">
          <Timer className="h-4 w-4" />
          00:00:00
        </span>
      </div>

      {/* VIDEO CONTAINERS */}
      <div className="flex gap-6 mt-6">
        {/* AI BOX */}
        <div className="flex-1 bg-white h-100 rounded-xl border flex flex-col gap-3 items-center justify-center">
          <Image
            src="/ai.avif"
            alt="AI"
            width={80}
            height={80}
            className="rounded-full object-cover"
          />
          <h2 className="font-medium">AI Recruiter</h2>
        </div>

        {/* USER BOX */}
        <div className="flex-1 bg-white h-100 rounded-xl border flex flex-col gap-3 items-center justify-center">
          <h2 className="text-2xl bg-primary text-white p-4 rounded-full px-6">
            {interviewInfo?.userName?.[0]}
          </h2>
          <h2 className="font-medium">{interviewInfo?.userName}</h2>
        </div>
      </div>
      <div className="flex items-center gap-5 justify-center mt-7">
        <Mic className="h-12 w-12 p-3 bg-gray-500 rounded-full cursor-pointer"/>
        <Phone className="h-12 w-12 p-3 bg-red-500  rounded-full"/>
      </div>
      <h2 className="text-sm text-gray-400 text-center mt-5">Interview in Progress...</h2>
    </div>
  );
}

export default StartInterview;
