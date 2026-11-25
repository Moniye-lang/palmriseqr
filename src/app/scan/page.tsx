'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Html5Qrcode } from 'html5-qrcode';
import {
  ShieldCheck,
  Camera,
  Loader2,
  CheckCircle2,
  XCircle,
  LogOut,
  RefreshCw,
  QrCode,
  ArrowLeft,
  Search,
  Volume2,
  VolumeX,
  AlertTriangle,
  UserCheck,
  Building2,
  KeyRound
} from 'lucide-react';
import Link from 'next/link';
import PalmriseLogo from '@/components/PalmriseLogo';

export default function Scanner() {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'checking' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<{ message: string; name?: string; mainGuestName?: string; tableNumber?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [checkinStats, setCheckinStats] = useState<{ checkedIn: number; total: number } | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const router = useRouter();

  // Audio chimes
  const playBeep = (isSuccess: boolean) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.setValueAtTime(164.81, audioCtx.currentTime + 0.15); // E3
        gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  };

  const fetchStats = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('/api/invite', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.invites)) {
        const total = data.invites.length;
        const checkedIn = data.invites.filter((i: any) => i.used).length;
        setCheckinStats({ checkedIn, total });
      }
    } catch (e) {
      // quiet fail
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/admin/login?redirect=/scan');
    } else {
      setIsAdmin(true);
      fetchStats();
    }
    return () => {
      stopScanner();
    };
  }, [router]);

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Failed to stop scanner:', err);
      }
    }
  };

  const startScanner = async () => {
    setErrorMessage(null);
    setStatus('scanning');
    try {
      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;
      const config = { fps: 12, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        onScanSuccess,
        undefined
      );
    } catch (err: any) {
      console.error('Scanner start error:', err);
      setStatus('error');
      const errStr = err.toString().toLowerCase();
      if (errStr.includes('notallowederror') || errStr.includes('permission')) {
        setErrorMessage('Camera permission denied. Please tap the camera icon in your browser address bar and allow access, then try again.');
      } else if (errStr.includes('notfounderror') || errStr.includes('no camera')) {
        setErrorMessage('No camera detected on this device. Use the Manual Token Entry below to verify the guest pass instead.');
      } else if (errStr.includes('notreadableerror') || errStr.includes('in use') || errStr.includes('busy') || errStr.includes('abort')) {
        setErrorMessage('Camera is currently in use by another application. Close other apps using the camera (e.g. a video call), then tap "Try Again".');
      } else {
        setErrorMessage('Could not start camera scanner. Use the Manual Token Entry below to verify the guest pass token directly.');
      }
    }
  };

  const verifyToken = async (scannedToken: string) => {
    setStatus('checking');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: scannedToken }),
      });
      const data = await res.json();
      if (data.success) {
        playBeep(true);
        setStatus('success');
        setResult({
          message: data.message || 'Check-in Confirmed!',
          name: data.name,
          mainGuestName: data.mainGuestName,
        });
        fetchStats();
      } else {
        playBeep(false);
        setStatus('error');
        setResult({
          message: data.message,
          name: data.name,
          mainGuestName: data.mainGuestName,
        });
        setErrorMessage(data.message);
      }
    } catch (err) {
      playBeep(false);
      setStatus('error');
      setErrorMessage('Network connection error while validating pass.');
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    await stopScanner();
    // Parse URL if the QR contains full link
    let token = decodedText.trim();
    if (token.includes('/invite/')) {
      const parts = token.split('/invite/');
      token = parts[parts.length - 1].split('?')[0];
    }
    await verifyToken(token);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    verifyToken(manualToken.trim());
    setManualToken('');
  };

  const reset = () => {
    setStatus('idle');
    setResult(null);
    setErrorMessage(null);
  };

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 p-4 sm:p-6 flex flex-col items-center justify-between relative selection:bg-blue-100">
      
      {/* ── TOP NAV BAR ──────────────────────────────────────────────── */}
      <div className="w-full max-w-lg mx-auto flex items-center justify-between pb-4 border-b border-slate-200">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Home
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-700 shadow-xs"
            title={soundEnabled ? 'Mute Chime' : 'Unmute Chime'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          
          <Link
            href="/admin/dashboard"
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-blue-700 shadow-xs flex items-center gap-1"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#1D4ED8]" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* ── SCANNER MAIN CONTAINER ───────────────────────────────────── */}
      <div className="max-w-md w-full space-y-6 my-auto pt-4 pb-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <PalmriseLogo size="md" className="justify-center mb-1" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[#DC2626] border border-red-200 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
            Gate Entry Verification
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Pass QR Scanner
          </h1>
          {checkinStats && (
            <p className="text-xs text-slate-500 font-medium">
              Live Attendance: <span className="font-bold text-[#1D4ED8]">{checkinStats.checkedIn}</span> of <span className="font-bold text-slate-700">{checkinStats.total}</span> guests verified
            </p>
          )}
        </div>

        {/* Scanner Card */}
        <div className="card-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 relative overflow-hidden">
          
          {/* Top Blue & Red Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1D4ED8] to-[#DC2626]" />

          {/* STATE: IDLE */}
          {status === 'idle' && (
            <div className="space-y-6 text-center py-4">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-blue-50 border-2 border-dashed border-[#1D4ED8]/40 flex items-center justify-center text-[#1D4ED8]">
                <QrCode className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Ready to Verify Guests
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Position the attendee’s digital or printed QR pass in front of your camera to validate entry.
                </p>
              </div>
              <button
                onClick={startScanner}
                className="w-full py-4 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>Activate Camera Scanner</span>
              </button>
            </div>
          )}

          {/* STATE: SCANNING */}
          {status === 'scanning' && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-square flex items-center justify-center border-2 border-[#1D4ED8]">
                <div id="reader" className="w-full h-full" />
                
                {/* Visual Viewfinder Reticle & Red Laser */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 border-2 border-[#1D4ED8] rounded-2xl relative">
                    {/* Laser line sweep */}
                    <div className="absolute left-2 right-2 h-0.5 bg-[#DC2626] shadow-[0_0_8px_#DC2626] animate-laser" />
                    
                    {/* Corner Reticles */}
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-[#DC2626] rounded-tl" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-[#DC2626] rounded-tr" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-[#DC2626] rounded-bl" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-[#DC2626] rounded-br" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                  <span className="px-3 py-1 rounded-full bg-black/60 text-white text-[10px] font-bold tracking-wider uppercase backdrop-blur-xs">
                    Align QR inside frame
                  </span>
                </div>
              </div>

              <button
                onClick={async () => {
                  await stopScanner();
                  setStatus('idle');
                }}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Cancel Camera
              </button>
            </div>
          )}

          {/* STATE: CHECKING */}
          {status === 'checking' && (
            <div className="py-12 space-y-4 text-center">
              <Loader2 className="w-12 h-12 text-[#1D4ED8] animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">Validating Pass...</h3>
                <p className="text-xs text-slate-500">Communicating with Palmrise Access Engine</p>
              </div>
            </div>
          )}

          {/* STATE: SUCCESS */}
          {status === 'success' && result && (
            <div className="space-y-6 text-center py-2 animate-fadeInUp">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                  Entry Approved
                </span>
                <h3 className="text-2xl font-black text-slate-900 pt-1">
                  {result.name}
                </h3>
                {result.mainGuestName && (
                  <p className="text-xs text-[#DC2626] font-semibold">
                    Guest of: {result.mainGuestName}
                  </p>
                )}
                <p className="text-xs text-slate-600 pt-1">
                  {result.message}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-[#1D4ED8] font-bold flex items-center justify-center gap-2">
                <UserCheck className="w-4 h-4" />
                <span>Guest Check-in Confirmed &amp; Logged</span>
              </div>

              <button
                onClick={() => {
                  reset();
                  startScanner();
                }}
                className="w-full py-3.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Scan Next Guest</span>
              </button>
            </div>
          )}

          {/* STATE: ERROR */}
          {status === 'error' && (
            <div className="space-y-6 text-center py-2 animate-fadeInUp">
              <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-[#DC2626] flex items-center justify-center mx-auto text-[#DC2626] shadow-sm">
                <XCircle className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#DC2626] bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                  Access Flagged
                </span>
                {result?.name && (
                  <h3 className="text-xl font-bold text-slate-900 pt-1">
                    {result.name}
                  </h3>
                )}
                <p className="text-sm font-semibold text-[#DC2626] pt-1">
                  {errorMessage || result?.message || 'Invalid or unrecognized pass.'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200 text-xs text-slate-600 flex items-start gap-2 text-left">
                <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <span>
                  {result?.message
                    ? 'Please verify the guest\'s name in the Admin Dashboard or use Manual Token Entry below.'
                    : 'Use the Manual Token Entry section below to validate the guest pass without the camera.'}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={reset}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => {
                    reset();
                    startScanner();
                  }}
                  className="flex-1 py-3 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* ── MANUAL TOKEN FALLBACK ──────────────────────────────────── */}
        <div className="card-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#1D4ED8]" /> Manual Token Entry
            </span>
            <span className="text-[10px] text-slate-400">Fallback Mode</span>
          </div>

          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Paste token or enter code..."
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
            />
            <button
              type="submit"
              disabled={status === 'checking'}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              Verify
            </button>
          </form>
        </div>

      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 py-2">
        Palmrise Event Management System · Gate Scanner v2.0
      </div>

    </div>
  );
}
