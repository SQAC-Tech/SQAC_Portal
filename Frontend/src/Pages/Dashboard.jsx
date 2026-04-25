import React from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0f0d16] text-slate-200 p-8 flex flex-col items-center justify-center font-body">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f183ff] to-[#ff6c95]">
          Dashboard Under Construction
        </h1>
        <p className="text-slate-400 text-lg">
          We're building something amazing here. In the meantime, you can access the certificate generator below.
        </p>
        <div className="pt-8">
          <Link 
            to="/dashboard/certificates" 
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#f183ff] to-[#ff6c95] text-white font-bold hover:scale-105 transition-transform inline-block"
          >
            Go to Certificate Generator
          </Link>
        </div>
      </div>
    </div>
  );
}
