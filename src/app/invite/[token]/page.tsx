'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Loader2,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  XCircle,
  Info,
  Shield,
  Smartphone,
  Share2,
  ArrowLeft,
  Users,
  Award,
  Ticket
} from 'lucide-react';
import QRCode from 'qrcode';
import { downloadOrSharePass } from '@/lib/passGenerator';
import PalmriseLogo from '@/components/PalmriseLogo';

interface Invite {
  name: string;
  email: string;
  token: string;
  used: boolean;
  usedAt?: string;
  createdAt: string;
  isAdditionalGuest?: boolean;
  mainGuestName?: string;
  tableNumber?: string;
  section?: string;
  attending?: 'yes' | 'no';
}

export default function GuestPassPage() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();

  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [downloading, setDownloading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let isRedirecting = false;
    const fetchInvite = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/invite/${encodeURIComponent(token)}`);
        const data = await res.json();

        if (data.success && data.invite) {
          // If the guest hasn't submitted their RSVP yet, redirect them to fill the form first
          if (!data.invite.rsvpSubmitted) {
            isRedirecting = true;
            router.replace(`/rsvp?token=${encodeURIComponent(data.invite.token)}`);
            return;
          }
          setInvite(data.invite);
          // Generate QR code data URL
          const qr = await QRCode.toDataURL(data.invite.token, {
            width: 320,
            margin: 1,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
            errorCorrectionLevel: 'H',
          });
          setQrDataUrl(qr);
        } else {
          setError(data.message || 'Invitation not found. Please verify your token.');
        }
      } catch (err) {
        setError('Failed to load invitation. Please check your network connection.');
      } finally {
        if (!isRedirecting) {
          setLoading(false);
        }
      }
    };

    fetchInvite();
  }, [token, router]);

  const handleDownload = async () => {
    if (!invite) return;
    setDownloading(true);
    try {
      await downloadOrSharePass(
        {
          name: invite.name,
          token: invite.token,
          tableNumber: invite.tableNumber,
          section: invite.section,
          isAdditionalGuest: invite.isAdditionalGuest,
          mainGuestName: invite.mainGuestName,
        },
        (imgUrl) => {
          setPreviewImage(imgUrl);
        }
      );
    } catch (err) {
      console.error('Download pass error:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-slate-900">
        <Loader2 className="w-10 h-10 text-[#1D4ED8] animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Generating Palmrise Entry Pass...</p>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 text-slate-900">
        <div className="card-white rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-lg border border-slate-200">
          <div className="w-14 h-14 rounded-full bg-red-50 text-[#DC2626] border border-red-200 flex items-center justify-center mx-auto">
            <XCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Invitation Not Found</h2>
            <p className="text-xs text-slate-600">{error || 'Unable to retrieve guest pass.'}</p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full py-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
          >
            Return to Home Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-10 px-4 sm:px-6 flex flex-col items-center justify-between relative selection:bg-blue-100">
      
      {/* Top Navigation */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Portal
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
          Official Digital Pass
        </span>
      </div>

      {/* Main Digital Ticket Pass (White Card, Royal Blue Ribbon, Red Highlights) */}
      <div className="w-full max-w-md mx-auto space-y-6 my-auto">
        
        {/* Ticket Container */}
        <div className="card-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 relative">
          
          {/* Header Ribbon: Deep Royal Blue */}
          <div className="palmrise-gradient-blue text-white p-6 sm:p-7 relative overflow-hidden">
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-200">
                  Palmrise Event Pass
                </span>
                <h1 className="text-2xl font-black tracking-tight text-white mt-1">
                  Executive Gala
                </h1>
                <p className="text-xs text-blue-100 mt-0.5">
                  Annual Innovation &amp; Leadership Summit 2026
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Red Accent Bottom Stripe */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#DC2626]" />
          </div>

          {/* Guest Identity & Badges */}
          <div className="p-6 sm:p-8 space-y-6 text-center">
            
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Verified Guest
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {invite.name}
              </h2>

              {invite.isAdditionalGuest && invite.mainGuestName && (
                <p className="text-xs text-[#DC2626] font-semibold">
                  Accompanying: {invite.mainGuestName}
                </p>
              )}

              {/* Status & Table Badges */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {invite.tableNumber && (
                  <span className="px-3 py-1 rounded-lg bg-blue-50 text-[#1D4ED8] border border-blue-200 text-xs font-bold tracking-wide">
                    Table {invite.tableNumber}
                  </span>
                )}

                <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold tracking-wide">
                  {invite.section === 'section2' ? 'Section 2' : 'Section 1 (Main Hall)'}
                </span>

                {invite.used ? (
                  <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-lg bg-red-50 text-[#DC2626] border border-red-200 text-xs font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" /> Valid Pass
                  </span>
                )}
              </div>
            </div>

            {/* Ticket Perforation Tear Line with Notches */}
            <div className="relative my-6 -mx-8 py-2">
              <div className="ticket-hole-left" />
              <div className="ticket-tear-dashed" />
              <div className="ticket-hole-right" />
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-white rounded-2xl border-2 border-[#1D4ED8] shadow-sm relative">
                {/* Red Corner Accents */}
                <div className="absolute -top-1.5 -left-1.5 w-4 h-4 border-t-3 border-l-3 border-[#DC2626] rounded-tl-sm" />
                <div className="absolute -top-1.5 -right-1.5 w-4 h-4 border-t-3 border-r-3 border-[#DC2626] rounded-tr-sm" />
                <div className="absolute -bottom-1.5 -left-1.5 w-4 h-4 border-b-3 border-l-3 border-[#DC2626] rounded-bl-sm" />
                <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 border-b-3 border-r-3 border-[#DC2626] rounded-br-sm" />

                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Entry QR Code"
                    className="w-48 h-48 select-none"
                  />
                )}
              </div>

              <div className="text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626]">
                  Present QR at Venue Gate
                </span>
                <p className="font-mono text-[10px] text-slate-400">
                  REF: {invite.token.substring(0, 8)}...{invite.token.substring(invite.token.length - 8)}
                </p>
              </div>
            </div>

            {/* Action Buttons: Download & Share */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 py-3.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Rendering Pass...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download PNG Pass</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownload}
                className="py-3.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2"
                title="Share or Save Pass"
              >
                <Share2 className="w-4 h-4 text-[#1D4ED8]" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>

            {/* Event Logistics Info Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2.5">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#1D4ED8] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Saturday, Nov 28, 2026</span>
                  <p className="text-slate-500">1:00 PM – 8:30 PM (Gates open 12:30 PM)</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">The Palmrise Grand Pavilion</span>
                  <p className="text-slate-500">Main Concourse, Gate 1 Entrance</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800">Dress Code: Smart Formal</span>
                  <p className="text-slate-500">Admittance strictly requires verified QR scan</p>
                </div>
              </div>
            </div>

          </div>

          {/* Ticket Footer Strip */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
            <span>Palmrise Access Control</span>
            <span>Secured by QR-Engine</span>
          </div>

        </div>

      </div>

      {/* ── MODAL: HIGH-RES PNG PREVIEW FOR MOBILE SAVE ────────────── */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-4 flex items-center justify-center">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200 animate-fadeInUp">
            <h3 className="text-base font-bold text-slate-900">Your Official Pass</h3>
            <p className="text-xs text-slate-500">
              Long-press or right-click the pass to save to your photo library.
            </p>
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm max-h-[60vh] overflow-y-auto">
              <img src={previewImage} alt="Official Pass Badge" className="w-full h-auto" />
            </div>
            <button
              onClick={() => setPreviewImage(null)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* Page Footer */}
      <div className="text-center text-xs text-slate-400 py-4">
        Palmrise Event Management System · Verified Guest Ticket Pass
      </div>

    </div>
  );
}
