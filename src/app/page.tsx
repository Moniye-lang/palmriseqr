'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import PalmriseLogo from '@/components/PalmriseLogo';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/admin/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-4 p-6">
      <PalmriseLogo size="lg" />
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Loader2 className="w-4 h-4 text-[#1D4ED8] animate-spin" />
        <span>Opening Admin Portal...</span>
      </div>
    </div>
  );
}
