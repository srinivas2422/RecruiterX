"use client";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";
import moment from "moment/moment";
import ConfidenceGraph from "./ConfidenceGraph";

function CandidateFeedbackDialog({ candidate }) {
  const [open, setOpen] = useState(false);
  const feedback = candidate?.feedback?.feedback;

  const avgScore = Math.round(
    (feedback?.rating?.technicalSkills +
      feedback?.rating?.communication +
      feedback?.rating?.problemSolving +
      feedback?.rating?.experience) /
      4,
  );
  console.log(candidate?.confidence_timeline);
  const timeline =
    typeof candidate?.confidence_timeline === "string"
      ? JSON.parse(candidate.confidence_timeline)
      : candidate?.confidence_timeline;

  const uniqueTimeline = Object.values(
    (timeline || []).reduce((acc, curr) => {
      acc[curr.second] = curr;
      return acc;
    }, {}),
  );

  return (
    <>
      <Button
        variant="outline"
        className="text-primary border-primary hover:bg-primary hover:text-white transition-colors"
        onClick={() => setOpen(true)}
      >
        View Report
      </Button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center px-6"
            style={{ zIndex: 9999 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setOpen(false)}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="my-5 font-bold text-lg text-gray-800">
                  Feedback
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-5">
                {/* Candidate Info */}
                <div className="flex justify-between items-center bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div
                      style={{ width: 52, height: 52, borderRadius: "50%" }}
                      className="bg-primary flex items-center justify-center font-bold text-white text-xl shrink-0"
                    >
                      {candidate?.userName?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-bold text-gray-800">
                        {candidate?.userName}
                      </h2>
                      <p className="text-sm text-gray-400">
                        {candidate?.userEmail}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Completed:{" "}
                        {moment(candidate?.created_at).format("MMM DD, yyyy")}
                      </p>
                    </div>
                  </div>
                  <div className="text-center bg-white rounded-xl px-4 py-2 shadow-sm border">
                    <p className="text-xs text-gray-400 mb-1">Score</p>
                    <p className="text-green-600 font-bold text-2xl">
                      {avgScore}/10
                    </p>
                  </div>
                </div>

                {/* Skills Assessment */}
                <div className="mt-5">
                  <h2 className="font-bold text-gray-800 mb-3">
                    Skills Assessment
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        label: "Technical Skills",
                        value: feedback?.rating?.technicalSkills,
                      },
                      {
                        label: "Communication",
                        value: feedback?.rating?.communication,
                      },
                      {
                        label: "Problem Solving",
                        value: feedback?.rating?.problemSolving,
                      },
                      {
                        label: "Experience",
                        value: feedback?.rating?.experience,
                      },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 font-medium">
                            {label}
                          </span>
                          <span className="font-bold text-primary">
                            {value}/10
                          </span>
                        </div>
                        <Progress value={value * 10} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ width: "100%", height: 350 }}>
                  <ConfidenceGraph data={uniqueTimeline} />
                </div>

                {/* Performance Summary */}
                <div className="mt-5">
                  <h2 className="font-bold text-gray-800 mb-2">
                    Performance Summary
                  </h2>
                  <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-700 leading-6 border border-gray-100">
                    {typeof feedback?.summary === "string" ? (
                      <p>{feedback?.summary}</p>
                    ) : Array.isArray(feedback?.summary) ? (
                      feedback.summary.map((item, index) => (
                        <p key={index} className="mb-1">
                          {item}
                        </p>
                      ))
                    ) : (
                      <p>{JSON.stringify(feedback?.summary)}</p>
                    )}
                  </div>
                </div>

                {/* Strengths */}
                {feedback?.strengths?.length > 0 && (
                  <div className="mt-5">
                    <h2 className="font-bold text-gray-800 mb-2">Strengths</h2>
                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                      <ul className="list-disc pl-5 space-y-1 text-sm text-green-700">
                        {feedback.strengths.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Weaknesses */}
                {feedback?.weaknesses?.length > 0 && (
                  <div className="mt-5">
                    <h2 className="font-bold text-gray-800 mb-2">Weaknesses</h2>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                      <ul className="list-disc pl-5 space-y-1 text-sm text-red-700">
                        {feedback.weaknesses.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {feedback?.missingSkills?.length > 0 && (
                  <div className="mt-5">
                    <h2 className="font-bold text-gray-800 mb-2">
                      Missing Skills
                    </h2>
                    <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4">
                      <ul className="list-disc pl-5 space-y-1 text-sm text-yellow-700">
                        {feedback.missingSkills.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Recommendation */}
                <div
                  className={`p-4 mt-4 flex items-center justify-between rounded-xl ${feedback?.recommendation === "NO" ? "bg-red-50  border-red-200" : "bg-green-50 border-green-200"}`}
                >
                  <div className="mr-4">
                    <h2
                      className={`font-bold text-sm ${feedback?.recommendation === "NO" ? "text-red-700" : "text-green-700"}`}
                    >
                      Recommendation Msg:
                    </h2>
                    <p
                      className={`text-sm mt-1 ${feedback?.recommendation === "NO" ? "text-red-500" : "text-green-500"}`}
                    >
                      {feedback?.recommendationMsg}
                    </p>
                  </div>
                  <Button
                    className={`shrink-0 ${feedback?.recommendation === "NO" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                  >
                    Send Msg
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export default CandidateFeedbackDialog;
