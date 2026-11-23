import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import PalmriseLogo from '@/components/PalmriseLogo';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col items-center justify-center p-6 selection:bg-blue-100">
      <div className="card-white rounded-3xl p-8 sm:p-10 max-w-md w-full text-center space-y-6 shadow-xl border border-slate-200">
        
        <PalmriseLogo size="md" className="justify-center mb-2" />

        <div className="w-16 h-16 rounded-full bg-red-50 text-[#DC2626] border-2 border-red-200 flex items-center justify-center mx-auto">
          <AlertCircle className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626] bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
            Error 404
          </span>
          <h1 className="text-2xl font-black text-slate-900">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            The event page, pass link, or resource you are looking for doesn't exist, was moved, or the link contains a typo.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/"
            className="w-full py-3.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Palmrise Portal</span>
          </Link>
        </div>

      </div>

      <p className="text-center text-xs text-slate-400 mt-6">
        Palmrise Event Management System
      </p>
    </div>
  );
}
