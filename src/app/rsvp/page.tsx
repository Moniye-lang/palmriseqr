'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Phone,
  User,
  Mail,
  Download,
  ExternalLink,
  Loader2,
  XCircle,
  CheckCircle2,
  Sparkles,
  Send,
  Shirt,
  Share2,
  Lock,
  AlertTriangle,
  ArrowLeft,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import QRCode from 'qrcode';
import { downloadOrSharePass } from '@/lib/passGenerator';
import PalmriseLogo from '@/components/PalmriseLogo';

interface GeneratedPass {
  name: string;
  token: string;
  tableNumber?: string;
  section?: string;
  isAdditionalGuest?: boolean;
  mainGuestName?: string;
}

function RsvpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCode = searchParams.get('code') || searchParams.get('token') || '';

  // Lookup state
  const [passcode, setPasscode] = useState(initialCode);
  const [lookingUp, setLookingUp] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [attending, setAttending] = useState<'yes' | 'no'>('yes');
  const [additionalGuestNames, setAdditionalGuestNames] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Confirmation state
  const [confirmedPasses, setConfirmedPasses] = useState<GeneratedPass[] | null>(null);
  const [declined, setDeclined] = useState(false);

  // Auto lookup if token provided in URL
  useEffect(() => {
    if (initialCode) {
      handleLookupByCode(initialCode);
    }
  }, [initialCode]);

  const handleLookupByCode = async (codeToLookup: string) => {
    if (!codeToLookup.trim()) return;
    setLookingUp(true);
    setLookupError(null);

    try {
      const res = await fetch(`/api/invite/${encodeURIComponent(codeToLookup.trim())}`);
      const data = await res.json();

      if (data.success && data.invite) {
        const inv = data.invite;
        setInviteData(inv);
        setName(inv.name || '');
        setEmail(inv.email || '');
        setPhone(inv.phone || '');
        setAttending(inv.attending || 'yes');

        // If RSVP is already submitted and confirmed, show passes directly
        if (inv.rsvpSubmitted && inv.attending === 'yes') {
          router.push(`/invite/${encodeURIComponent(inv.token)}`);
          return;
        }

        // Initialize additional guest fields
        const maxPlus = Math.max(0, (inv.maxUses || 1) - 1);
        if (maxPlus > 0) {
          setAdditionalGuestNames(new Array(maxPlus).fill(''));
        }
      } else {
        setLookupError('Invitation code not recognized. Please check your spelling or contact event organizers.');
      }
    } catch (err) {
      setLookupError('Error verifying invitation code. Please check your connection.');
    } finally {
      setLookingUp(false);
    }
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookupByCode(passcode);
  };

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData) return;

    if (!name.trim()) {
      setSubmitError('Please enter your full name.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const filteredPlusOnes = additionalGuestNames.map(n => n.trim()).filter(Boolean);

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: inviteData.token,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          attending,
          guests: 1 + filteredPlusOnes.length,
          guestNames: filteredPlusOnes,
        }),
      });

      const data = await res.json();

      if (data.success) {
        if (attending === 'no') {
          setDeclined(true);
        } else {
          // If tickets array returned
          if (data.tickets && data.tickets.length > 0) {
            setConfirmedPasses(data.tickets);
          } else {
            // Main ticket
            setConfirmedPasses([
              {
                name: name.trim(),
                token: inviteData.token,
                tableNumber: inviteData.tableNumber,
                section: inviteData.section,
              }
            ]);
          }
        }
      } else {
        setSubmitError(data.message || 'Failed to submit RSVP. Please try again.');
      }
    } catch (err) {
      setSubmitError('Network error submitting RSVP.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 py-10 px-4 sm:px-6 flex flex-col items-center justify-between selection:bg-blue-100">
      
      {/* Top Navbar */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-between pb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Portal
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
          Guest RSVP Center
        </span>
      </div>

      <div className="w-full max-w-xl mx-auto space-y-6 my-auto">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <PalmriseLogo size="md" className="justify-center mb-1" />
          <h1 className="text-3xl font-black text-slate-900">
            Guest RSVP &amp; Pass Desk
          </h1>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Please confirm your attendance for the Palmrise Executive Gala. Upon confirmation, your digital QR pass will be immediately generated.
          </p>
        </div>

        {/* ── STEP 1: LOOKUP CODE (IF NOT YET LOADED) ──────────────── */}
        {!inviteData && !confirmedPasses && !declined && (
          <div className="card-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">Step 1 of 2</span>
              <h2 className="text-xl font-bold text-slate-900">Look Up Your Invitation</h2>
              <p className="text-xs text-slate-500">
                Enter your invitation token or passcode provided in your SMS or email dispatch.
              </p>
            </div>

            <form onSubmit={handleLookupSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000 or PR-104"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white transition-all font-mono"
                  required
                />
              </div>

              {lookupError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-[#DC2626] rounded-xl text-xs font-medium">
                  {lookupError}
                </div>
              )}

              <button
                type="submit"
                disabled={lookingUp}
                className="w-full py-3.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {lookingUp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to RSVP</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2: FILL RSVP FORM ─────────────────────────────────── */}
        {inviteData && !confirmedPasses && !declined && (
          <div className="card-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 space-y-6 animate-fadeInUp">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D4ED8]">
                  Invitation Verified
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  {inviteData.name}
                </h3>
              </div>
              <button
                onClick={() => setInviteData(null)}
                className="text-xs text-slate-500 hover:text-red-600 font-medium"
              >
                Change Code
              </button>
            </div>

            <form onSubmit={handleRsvpSubmit} className="space-y-5">
              {submitError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-[#DC2626] rounded-xl text-xs font-medium">
                  {submitError}
                </div>
              )}

              {/* Attendance Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Will you be attending?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAttending('yes')}
                    className={`py-3.5 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      attending === 'yes'
                        ? 'bg-blue-50 border-[#1D4ED8] text-[#1D4ED8] ring-2 ring-blue-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#1D4ED8]" />
                    <span>Joyfully Accept</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAttending('no')}
                    className={`py-3.5 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      attending === 'no'
                        ? 'bg-red-50 border-[#DC2626] text-[#DC2626] ring-2 ring-red-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-4 h-4 text-[#DC2626]" />
                    <span>Regretfully Decline</span>
                  </button>
                </div>
              </div>

              {attending === 'yes' && (
                <>
                  {/* Guest Contact Details */}
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Primary Guest Full Name
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="for ticket delivery"
                          className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          WhatsApp / Phone
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+234..."
                          className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Plus-ones (if invitation allows) */}
                  {additionalGuestNames.length > 0 && (
                    <div className="space-y-3 pt-3 border-t border-slate-100">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-[#1D4ED8]" /> Accompanying Guest Names
                        </span>
                        <p className="text-[11px] text-slate-500">
                          Your invitation permits {additionalGuestNames.length} additional guest(s). Each guest receives a personalized entry QR voucher.
                        </p>
                      </div>

                      {additionalGuestNames.map((gName, idx) => (
                        <div key={idx} className="relative">
                          <input
                            type="text"
                            placeholder={`Guest #${idx + 1} Full Name`}
                            value={gName}
                            onChange={(e) => {
                              const updated = [...additionalGuestNames];
                              updated[idx] = e.target.value;
                              setAdditionalGuestNames(updated);
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Confirming with Access Engine...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{attending === 'yes' ? 'Confirm & Generate Passes' : 'Submit Response'}</span>
                  </>
                )}
              </button>
            </form>

          </div>
        )}

        {/* ── STEP 3A: CONFIRMED PASSES REVEAL ───────────────────────── */}
        {confirmedPasses && confirmedPasses.length > 0 && (
          <div className="card-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 text-center animate-fadeInUp">
            
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#1D4ED8] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                RSVP Confirmed
              </span>
              <h2 className="text-2xl font-black text-slate-900 pt-2">
                Your Digital Passes are Ready
              </h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                Thank you, {confirmedPasses[0].name}. We look forward to hosting you at the Palmrise Executive Gala.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {confirmedPasses.map((pass, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left"
                >
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      Pass #{idx + 1} · {pass.isAdditionalGuest ? 'Guest Pass' : 'Primary VIP'}
                    </span>
                    <h4 className="text-base font-bold text-slate-900">{pass.name}</h4>
                    {pass.tableNumber && (
                      <span className="text-xs font-bold text-[#1D4ED8]">Table {pass.tableNumber}</span>
                    )}
                  </div>

                  <Link
                    href={`/invite/${encodeURIComponent(pass.token)}`}
                    className="px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>View Pass &amp; QR</span>
                  </Link>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="text-xs font-semibold text-slate-500 hover:text-blue-700 transition-colors"
              >
                Back to Palmrise Home
              </Link>
            </div>

          </div>
        )}

        {/* ── STEP 3B: DECLINED CONFIRMATION ──────────────────────────── */}
        {declined && (
          <div className="card-white rounded-3xl p-8 shadow-xl border border-slate-200 text-center space-y-4 animate-fadeInUp">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <XCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Response Recorded</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              We regret you are unable to attend the Palmrise Executive Gala. Thank you for notifying us.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider"
            >
              Return Home
            </Link>
          </div>
        )}

      </div>

      <div className="text-center text-xs text-slate-400 py-4">
        Palmrise Event Management System · RSVP Verification Portal
      </div>

    </div>
  );
}

export default function RsvpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1D4ED8] animate-spin" />
      </div>
    }>
      <RsvpContent />
    </Suspense>
  );
}
