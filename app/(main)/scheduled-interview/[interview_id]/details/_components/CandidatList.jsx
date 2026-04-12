import React from "react";
import moment from "moment";
import CandidateFeedbackDialog from "./CandidateFeedbackDialog";

function CandidatList({ candidateList }) {
  console.log(candidateList)
  return (
    <div className="mt-6">
      <h2 className="font-bold text-lg mt-5">
        Candidates ({candidateList?.length ?? 0})
      </h2>

      {candidateList?.length === 0 && (
        <div className="text-center py-10 text-gray-400 border rounded-xl bg-gray-50">
          No candidates have attempted this interview yet.
        </div>
      )}

      {candidateList?.map((candidate, index) => (
        <div
          key={index}
          className="p-5 flex gap-3 items-center justify-between border border-gray-200 rounded-xl mb-3 bg-white shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div style={{width: 44, height: 44, borderRadius: '50%'}} className="bg-primary flex items-center justify-center font-bold text-white text-lg shrink-0">
  {candidate?.userName?.[0]?.toUpperCase()}
</div>

            <div>
              <h2 className="font-bold text-gray-800">{candidate?.userName}</h2>
              <h2 className="text-sm text-gray-400">
                Completed On: {moment(candidate?.created_at).format('MMM DD, yyyy')}
              </h2>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <div className="text-center">
              <p className="text-xs text-gray-400">Score</p>
              <p className="text-green-600 font-bold text-sm">6/10</p>
            </div>
            <CandidateFeedbackDialog candidate={candidate} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default CandidatList;
