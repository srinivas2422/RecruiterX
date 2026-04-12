import { Calendar, Clock } from 'lucide-react'
import React from 'react'
import moment from 'moment'

function InterviewDetailContainer({ interviewDetail }) {
  const questions = typeof interviewDetail?.questionList === 'string'
    ? JSON.parse(interviewDetail?.questionList)
    : interviewDetail?.questionList ?? [];

  return (
    <div className='p-8 bg-white rounded-2xl mt-5 shadow-sm border border-gray-100'>
      <h2 className='text-xl font-bold text-gray-800'>{interviewDetail?.jobPosition}</h2>
      <div className='mt-5 flex items-center justify-between lg:pr-52'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-xs text-gray-400 uppercase tracking-wide'>Duration</h2>
          <h2 className='flex text-sm font-semibold items-center gap-2 text-gray-700'>
            <Clock className='h-4 w-4 text-primary' /> {interviewDetail?.duration}
          </h2>
        </div>

        <div className='flex flex-col gap-1'>
          <h2 className='text-xs text-gray-400 uppercase tracking-wide'>Created On</h2>
          <h2 className='flex text-sm font-semibold items-center gap-2 text-gray-700'>
            <Calendar className='h-4 w-4 text-primary' /> {moment(interviewDetail?.created_at).format('MMM DD, yyyy')}
          </h2>
        </div>

        {interviewDetail?.type && (
          <div className='flex flex-col gap-1'>
            <h2 className='text-xs text-gray-400 uppercase tracking-wide'>Type</h2>
            <h2 className='flex text-sm font-semibold items-center gap-2 text-gray-700'>
              <Clock className='h-4 w-4 text-primary' /> {JSON.parse(interviewDetail?.type)[0]}
            </h2>
          </div>
        )}
      </div>

      <div className='mt-6'>
        <h2 className='font-bold text-gray-800 mb-2'>Job Description</h2>
        <p className='text-sm text-gray-600 leading-7 bg-gray-50 p-2 rounded-lg'>
          {interviewDetail?.jobDescription}
        </p>
      </div>

      <div className='mt-6'>
        <h2 className='font-bold text-gray-800 mb-3'>Interview Questions</h2>
        <div className='grid grid-cols-2 gap-3'>
          {questions.map((item, index) => (
            <div key={index} className='flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-lg p-3'>
              <span className='text-primary font-bold text-sm min-w-5'>{index + 1}.</span>
              <p className='text-sm text-gray-700 leading-5'>{item?.question}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default InterviewDetailContainer