import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Copy, List, Mail, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

function InterviewLink({ interview_id, formData }) {

    const url = process.env.NEXT_PUBLIC_HOST_URL + "/" + interview_id;

    const GetInterviewUrl = () => {
        return url;
    }
    const onCopyLink = async () => {
        await navigator.clipboard.writeText(url);
        toast("Link Copied");
    };

    return (
        <div className="flex items-center justify-center flex-col  mt-10">
            <div className="rounded-full bg-gradient-to-tr from-green-400 to-emerald-500 p-5 shadow-lg shadow-green-500/30 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg"
               className="h-12 w-12 text-white"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor">
            <path strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7" />
          </svg>
        </div>
            <h2 className="font-bold text-lg mt-4">
                Your AI Interview is Ready!
            </h2>

            <p className="mt-3 ">
                Share this link with your candidates to start the interview process
            </p>

            <div className="w-full p-7 mt-7 rounded-lg bg-white">
                <div className="flex justify-between items-center mt-2">
                    <h2 className="font-bold">Interview Link</h2>
                    <span className="p-1 px-2 text-primary bg-blue-50 rounded-4xl">
                        Valid for 30 days
                    </span>
                </div>

                <div className="mt-5 flex gap-3 items-center">
                    <Input value={GetInterviewUrl()} disabled={true} />
                    <Button onClick={() => onCopyLink()}>
                        <Copy />
                        Copy Link
                    </Button>
                </div>

                <hr className="my-5" />

                <div className="flex gap-5 my-3">
                    <h2 className="text-sm text-gray-500 flex gap-2 items-center">
                        <Clock className="h-4 w-4" />
                        {formData?.duration}
                    </h2>

                    <h2 className="text-sm text-gray-500 flex gap-2 items-center">
                        <List className="h-4 w-4" />
                        10 Questions
                    </h2>

                </div>
            </div>

            <div className="mt-7 bg-white p-5 rounded-lg w-full">
                <h2 className="font-bold">Share via</h2>

                <div className="flex gap-7 mt-2 justify-between">
                    <Button variant={'outline'} >
                        <Mail />
                        Email
                    </Button>

                    <Button variant={'outline'} >
                        <Mail  />
                        Slack
                    </Button>

                    <Button variant={'outline'} >
                        <Mail  />
                        WhatsApp
                    </Button>
                </div>
            </div>

            <div className="flex w-full gap-5 justify-between mt-7">
                <Link href="/dashboard">
                    <Button variant={'outline'}>
                        <ArrowLeft />
                        Back to Dashboard
                    </Button>
                </Link>

                <Link href="/dashboard/create-interview">
                    <Button>
                        <Plus />
                        Create New Interview
                    </Button>
                </Link>
            </div>

        </div>
    );
}

export default InterviewLink;