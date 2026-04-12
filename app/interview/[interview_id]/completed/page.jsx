import React from 'react';
import { Home, ArrowRight } from 'lucide-react';

const InterviewComplete = () => {
  return (
    <div className="bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white font-sans antialiased flex flex-col min-h-screen">

      {/* Main Content */}
      <main className="flex grow flex-col items-center justify-center space-y-10 py-16 px-4">

        {/* Glow Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/20 blur-[140px] rounded-full -z-10"></div>

        {/* Success Icon */}
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

        {/* Heading */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center tracking-tight">
          Interview Complete!
        </h1>

        {/* Subheading */}
        <p className="text-lg text-gray-300 text-center max-w-xl leading-relaxed">
          Thank you for participating in the AI-driven interview with RecruiterX
        </p>

        

        {/* Next Steps */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-xl w-full max-w-xl space-y-5 hover:shadow-2xl transition">

          <div className="flex items-center justify-center rounded-full bg-white/10 w-14 h-14 mx-auto shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg"
                 className="h-6 w-6 text-blue-400"
                 fill="none"
                 viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 19l9-7-9-7-9 7 9 7z" />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-center">
            What’s Next?
          </h2>

          <p className="text-gray-300 text-center leading-relaxed">
            The recruiter will review your interview responses and will contact you soon regarding the next steps.
          </p>

          <p className="text-gray-400 text-sm text-center flex items-center justify-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg"
                 className="h-4 w-4"
                 fill="none"
                 viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3" />
            </svg>
            Response within 2–3 business days
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-4">

          <button className="bg-white/10 backdrop-blur-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/20 rounded-xl py-3 px-6 flex items-center gap-2 transition-all duration-300 hover:scale-105">
            <Home className="h-5 w-5" />
            <span>Return to Homepage</span>
          </button>

          <button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl py-3 px-6 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <span>View Other Opportunities</span>
            <ArrowRight className="h-5 w-5" />
          </button>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur-xl border-t border-white/10 text-gray-400 text-center py-4">
        <p>&copy; 2023 Alcruiter. All rights reserved.</p>
      </footer>

    </div>
  );
};

export default InterviewComplete;