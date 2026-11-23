'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  ShieldCheck,
  Search,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Ticket,
  ChevronRight,
  ExternalLink,
  Laptop,
  Layers,
  ArrowUpRight,
  Shield
} from 'lucide-react';
import PalmriseLogo from '@/components/PalmriseLogo';

const ITINERARY_ITEMS = [
  { time: '01:00 PM', title: 'Arrival & Red Carpet Reception', desc: 'Guest check-in via digital QR passes, welcome champagne & networking.' },
  { time: '02:00 PM', title: 'Opening Keynote & Address', desc: 'Welcome address by Palmrise leadership & keynote presentations.' },
  { time: '03:15 PM', title: 'Executive Banquet & Lunch', desc: 'Fine dining culinary service with designated table allocations.' },
  { time: '05:00 PM', title: 'Innovation Awards & Presentation', desc: 'Recognition of excellence and corporate partner tributes.' },
  { time: '06:30 PM - 8:30 PM', title: 'Networking Lounge & Celebration', desc: 'Live musical ensemble, evening lounge, and executive mixer.' },
];

export default function HomePage() {
  const [tokenInput, setTokenInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [searching, setSearching] = useState(false);
  const router = useRouter();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setErrorMsg('Please enter your invitation passcode or token.');
      return;
    }

    setErrorMsg('');
    setSearching(true);

    const query = tokenInput.trim();

    try {
      // First try direct token check
      const res = await fetch(`/api/invite/${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data.success && data.invite) {
        router.push(`/invite/${encodeURIComponent(data.invite.token)}`);
        return;
      }

      // If not a direct token, check via RSVP search or redirect to RSVP page
      router.push(`/rsvp?code=${encodeURIComponent(query)}`);
    } catch (err) {
      router.push(`/rsvp?code=${encodeURIComponent(query)}`);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      
      {/* ── TOP NAVIGATION ──────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <PalmriseLogo size="md" />

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/rsvp"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Ticket className="w-4 h-4 text-[#1D4ED8]" />
              <span className="hidden sm:inline">Guest</span> RSVP
            </Link>

            <Link
              href="/scan"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-[#DC2626]" />
              <span>Gate Scan</span>
            </Link>

            <Link
              href="/admin/login"
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin Portal</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── HERO SECTION: WHITE PRIMARY WITH BLUE & RED ACCENTS ─────────── */}
      <main className="flex-1">
        <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-white border-b border-slate-200">
          {/* Subtle background ambient mesh */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-red-100 rounded-full blur-3xl" />
          </div>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-8">
            
            {/* System Status Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#1D4ED8] text-xs font-bold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" />
              Palmrise Event Management System · Live Access Engine
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Digital QR Ticketing &amp; <br />
                <span className="palmrise-blue-text">Event Access</span>{' '}
                <span className="text-[#DC2626]">Management</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                The unified digital ecosystem for Palmrise events. Retrieve your secure guest entry pass, verify RSVP attendance, find your assigned table, or process gate check-ins with instant camera scanning.
              </p>
            </div>

            {/* Interactive Guest Pass Lookup Desk */}
            <div className="max-w-xl mx-auto pt-2">
              <div className="p-2 sm:p-2.5 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-blue-900/5 ring-1 ring-slate-200/50">
                <form onSubmit={handleLookup} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Enter Invitation Passcode or Token..."
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searching}
                    className="px-6 py-3.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{searching ? 'Checking...' : 'Find Pass'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>

                {errorMsg && (
                  <p className="text-xs text-[#DC2626] font-medium text-left px-3 pt-2">
                    {errorMsg}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#1D4ED8]" /> Instant Pass Generation
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#DC2626]" /> Table &amp; Seat Allocation
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Live Gate Scanning
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ── 3 CORE SYSTEM MODULES ────────────────────────────────────────── */}
        <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#1D4ED8]">
              System Operations
            </span>
            <h2 className="text-3xl font-black text-slate-900">
              Complete Event Access Workflow
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Everything required to coordinate guest arrivals, ticketing, table allocations, and secure venue check-in.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1: Guest RSVP & Passes */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-[#1D4ED8] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Ticket className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#1D4ED8] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                    Guest Portal
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    RSVP &amp; Digital Passes
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Personalized digital entry vouchers with cryptographic QR codes, table seat assignments, and 1-click PNG pass download for mobile wallets.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <Link
                  href="/rsvp"
                  className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-blue-50 text-[#1D4ED8] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-slate-200 hover:border-blue-200"
                >
                  <span>Open RSVP Portal</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 2: Gate QR Scanner */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-red-300 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 text-[#DC2626] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <QrCode className="w-7 h-7" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#DC2626] bg-red-50 px-2.5 py-1 rounded-md border border-red-100">
                    Gate Usher / Bouncer
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    Instant Gate Scanner
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    High-speed camera verification with audio chime, table lookup, duplicate-scan protection, and real-time attendance sync.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <Link
                  href="/scan"
                  className="w-full py-3 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-[#DC2626] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border border-red-200"
                >
                  <span>Launch QR Scanner</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Card 3: Organizer Control */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all flex flex-col justify-between group">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                    Event Director
                  </span>
                  <h3 className="text-xl font-bold text-slate-900">
                    Organizer Dashboard
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Live attendee tracking, automated table switching cycles, Excel/Word collation exports, guest batch creation, and WhatsApp dispatch.
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100">
                <Link
                  href="/admin/login"
                  className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
                >
                  <span>Admin Access</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* ── FEATURED EVENT SHOWCASE ─────────────────────────────────────── */}
        <section className="py-16 bg-slate-50 border-t border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            
            <div className="bg-white rounded-3xl border border-slate-200 p-8 md:p-12 shadow-sm space-y-8">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
                    <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
                    Current Managed Event
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900">
                    Palmrise Annual Executive Gala &amp; Summit 2026
                  </h3>
                  <p className="text-xs md:text-sm text-slate-600">
                    Celebrating leadership, innovation, and corporate excellence across Africa.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/rsvp"
                    className="px-6 py-3 rounded-xl bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs uppercase tracking-wider text-center shadow-sm"
                  >
                    Confirm RSVP
                  </Link>
                  <Link
                    href="/scan"
                    className="px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider text-center border border-slate-200"
                  >
                    Staff Scanner
                  </Link>
                </div>
              </div>

              {/* Event Metadata Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#1D4ED8] flex items-center justify-center shrink-0 shadow-xs border border-blue-100">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Date &amp; Time</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">Saturday, Nov 28, 2026</p>
                    <p className="text-xs text-slate-600">1:00 PM – 8:30 PM WAT</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-red-50/50 border border-red-100 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#DC2626] flex items-center justify-center shrink-0 shadow-xs border border-red-100">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Venue &amp; Hall</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">The Palmrise Grand Pavilion</p>
                    <p className="text-xs text-slate-600">Concourse Ballrooms, Gate 1</p>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-100/60 border border-slate-200 flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white text-slate-800 flex items-center justify-center shrink-0 shadow-xs border border-slate-200">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Admission Criteria</span>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">Strictly by QR Ticket</p>
                    <p className="text-xs text-slate-600">Smart Formal Evening Wear</p>
                  </div>
                </div>

              </div>

              {/* Itinerary Timeline */}
              <div className="space-y-4 pt-4">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1D4ED8]" /> Event Itinerary &amp; Timeline
                </h4>
                <div className="divide-y divide-slate-100">
                  {ITINERARY_ITEMS.map((item, idx) => (
                    <div key={idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <span className="font-bold text-[#1D4ED8] sm:w-36 shrink-0">{item.time}</span>
                      <div className="flex-1">
                        <span className="font-bold text-slate-900">{item.title}</span>
                        <p className="text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </section>

      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-slate-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <PalmriseLogo size="sm" />
          <div className="flex items-center gap-6">
            <Link href="/rsvp" className="hover:text-blue-700">RSVP Portal</Link>
            <Link href="/scan" className="hover:text-red-700">Gate Scanner</Link>
            <Link href="/admin/login" className="hover:text-slate-900">Admin Control</Link>
          </div>
          <p>© 2026 Palmrise Event Management System. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
