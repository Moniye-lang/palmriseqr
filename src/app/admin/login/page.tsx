'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, Lock, User, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import Link from 'next/link';
import PalmriseLogo from '@/components/PalmriseLogo';

function AdminLoginForm() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/admin/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        router.push(redirectTarget);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-auto">
      <div className="card-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200 relative overflow-hidden">
        
        {/* Top Blue & Red Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#1D4ED8] via-[#2563EB] to-[#DC2626]" />

        {/* Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="flex justify-center mb-2">
            <PalmriseLogo size="lg" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Event Management Portal
          </h1>
          <p className="text-xs text-slate-500">
            Sign in with your organizer credentials to access attendee lists, table allocations, and pass controls.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5 mt-6">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-[#DC2626] rounded-xl text-xs font-medium text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white focus:outline-none transition-all text-slate-900 placeholder-slate-400 text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white focus:outline-none transition-all text-slate-900 placeholder-slate-400 text-sm"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Sign In to Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Info */}
        <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50 -mx-8 -mb-8 p-6 text-center text-xs text-slate-500 space-y-1">
          <span className="font-bold text-slate-700">Default Credentials</span>
          <p className="font-mono text-[11px] text-[#1D4ED8]">
            Username: <span className="font-bold">admin</span> &nbsp;·&nbsp; Password: <span className="font-bold">admin123</span>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function AdminLogin() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-6 bg-[#f8fafc] text-slate-900 relative">
      {/* Top bar back link */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Portal
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
          Admin Gate
        </span>
      </div>

      <Suspense fallback={
        <div className="w-full max-w-md mx-auto my-auto py-12 text-center">
          <Loader2 className="w-8 h-8 text-[#1D4ED8] animate-spin mx-auto" />
        </div>
      }>
        <AdminLoginForm />
      </Suspense>

      <div className="text-center text-xs text-slate-400 py-4">
        Palmrise Event Management System · Secure Access Control
      </div>
    </div>
  );
}
