'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  QrCode,
  LogOut,
  Search,
  CheckCircle2,
  XCircle,
  Loader2,
  Calendar,
  ExternalLink,
  Trash2,
  RotateCcw,
  RefreshCw,
  Copy,
  Pencil,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  AlertCircle,
  ArrowLeftRight,
  ArrowRight,
  Shuffle,
  Lock,
  Building2,
  Check,
  Send,
  Sparkles,
  Ticket
} from 'lucide-react';
import {
  exportToExcel,
  exportToWord,
  ExportFilter,
  ExportFormat
} from '@/lib/exportUtils';
import { TABLE_CYCLES } from '@/lib/tableSwitchConfig';
import PalmriseLogo from '@/components/PalmriseLogo';

interface Invite {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  token: string;
  used: boolean;
  usedAt: string | null;
  createdAt: string;
  attending?: 'yes' | 'no';
  isAdditionalGuest?: boolean;
  mainGuestName?: string;
  rsvpSubmitted?: boolean;
  maxUses: number;
  section?: string;
  tableNumber?: string;
}

export default function AdminDashboard() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'section1' | 'section2'>('section1');

  // Create Invite Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [guestOfName, setGuestOfName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTableNumber, setNewTableNumber] = useState('');
  const [maxGuests, setMaxGuests] = useState('0');
  const [newSection, setNewSection] = useState<'section1' | 'section2'>('section1');
  const [creating, setCreating] = useState(false);

  // Edit Invite Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingInvite, setEditingInvite] = useState<Invite | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editGuestOf, setEditGuestOf] = useState('');
  const [editTableNumber, setEditTableNumber] = useState('');
  const [editMaxGuests, setEditMaxGuests] = useState('0');
  const [editSection, setEditSection] = useState<'section1' | 'section2'>('section1');
  const [updating, setUpdating] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const router = useRouter();

  // Export states
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFilter, setExportFilter] = useState<ExportFilter>('all');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('excel');
  const [exportSectionScope, setExportSectionScope] = useState<'current' | 'all'>('current');
  const [exporting, setExporting] = useState(false);

  // Filter state for dashboard list
  const [tableFilter, setTableFilter] = useState<'all' | 'with-table' | 'without-table'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'checked-in' | 'pending' | 'declined'>('all');

  // Table Switch & Re-allocation states
  const [switchModalOpen, setSwitchModalOpen] = useState(false);
  const [switchSectionScope, setSwitchSectionScope] = useState<'section1' | 'section2' | 'all'>('section1');
  const [switchLoading, setSwitchLoading] = useState(false);
  const [switchExecuting, setSwitchExecuting] = useState(false);
  const [switchStatusData, setSwitchStatusData] = useState<any>(null);
  const [switchFeedback, setSwitchFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmSwitch, setConfirmSwitch] = useState<{ cycleId: string; cycleName: string } | null>(null);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    const token = localStorage.getItem('token');
    if (!token) { router.push('/admin/login'); return; }

    try {
      setLoading(true);
      const res = await fetch('/api/invite', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setInvites(data.invites);
      } else if (res.status === 401) {
        router.push('/admin/login');
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    router.push('/admin/login');
  };

  const copyInviteLink = (inviteToken: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/invite/${inviteToken}`;
    navigator.clipboard.writeText(link);
    setCopyToast(inviteToken);
    setTimeout(() => setCopyToast(null), 2500);
  };

  // Switch Modal Handlers
  const openSwitchModal = async (sectionScope?: 'section1' | 'section2' | 'all') => {
    const targetScope = sectionScope || activeSection;
    setSwitchSectionScope(targetScope);
    setSwitchFeedback(null);
    setConfirmSwitch(null);
    setSwitchModalOpen(true);
    await fetchSwitchStatus(targetScope);
  };

  const fetchSwitchStatus = async (scope: string) => {
    setSwitchLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/invite/switch-tables?section=${scope}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setSwitchStatusData(data);
      }
    } catch (err) {
      console.error('Failed to fetch switch status:', err);
    } finally {
      setSwitchLoading(false);
    }
  };

  const handleExecuteSwitch = async (cycleId: string) => {
    setSwitchExecuting(true);
    setSwitchFeedback(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/invite/switch-tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          section: switchSectionScope,
          cycleId,
          action: 'execute',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSwitchFeedback({ type: 'success', message: data.message });
        setConfirmSwitch(null);
        fetchInvites();
        await fetchSwitchStatus(switchSectionScope);
      } else {
        setSwitchFeedback({ type: 'error', message: data.message || 'Failed to execute table switch' });
      }
    } catch (err: any) {
      setSwitchFeedback({ type: 'error', message: err.message || 'Network error executing switch' });
    } finally {
      setSwitchExecuting(false);
    }
  };

  const handleRevertSwitch = async (cycleId: string = 'all') => {
    if (!confirm('Revert table assignments back to their previous configurations?')) return;
    setSwitchExecuting(true);
    setSwitchFeedback(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/invite/switch-tables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          section: switchSectionScope,
          cycleId,
          action: 'revert',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSwitchFeedback({ type: 'success', message: data.message });
        fetchInvites();
        await fetchSwitchStatus(switchSectionScope);
      } else {
        setSwitchFeedback({ type: 'error', message: data.message || 'Failed to revert tables' });
      }
    } catch (err: any) {
      setSwitchFeedback({ type: 'error', message: err.message || 'Network error reverting switch' });
    } finally {
      setSwitchExecuting(false);
    }
  };

  // Add guest
  const openCreateModal = () => {
    setNewSection(activeSection);
    setNewName('');
    setGuestOfName('');
    setNewPhone('');
    setNewTableNumber('');
    setMaxGuests('0');
    setModalOpen(true);
  };

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          phone: newPhone,
          mainGuestName: guestOfName.trim(),
          tableNumber: newTableNumber.trim(),
          maxUses: (parseInt(maxGuests) || 0) + 1,
          section: newSection,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setInvites([data.invite, ...invites]);
        setModalOpen(false);
        setNewName('');
        setGuestOfName('');
        setNewPhone('');
        setNewTableNumber('');
        setMaxGuests('0');
      } else {
        alert(data.message || 'Failed to create invitation');
      }
    } catch (err) {
      console.error('Create error:', err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  // Edit guest
  const openEditModal = (invite: Invite) => {
    setEditingInvite(invite);
    setEditName(invite.name);
    setEditPhone(invite.phone || '');
    setEditGuestOf(invite.mainGuestName || '');
    setEditTableNumber(invite.tableNumber || '');
    setEditMaxGuests(Math.max(0, invite.maxUses - 1).toString());
    setEditSection((invite.section as 'section1' | 'section2') || 'section1');
    setEditModalOpen(true);
  };

  const handleUpdateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvite) return;
    setUpdating(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`/api/invite/actions/${editingInvite._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName,
          phone: editPhone,
          mainGuestName: editGuestOf.trim(),
          tableNumber: editTableNumber.trim(),
          maxUses: (parseInt(editMaxGuests) || 0) + 1,
          section: editSection,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setInvites(invites.map(i => i._id === editingInvite._id ? data.invite : i));
        setEditModalOpen(false);
        setEditingInvite(null);
      } else {
        alert(data.message || 'Failed to update invitation');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  // Toggle or reset check-in
  const handleToggleCheckin = async (invite: Invite) => {
    const token = localStorage.getItem('token');
    setActionId(invite._id);
    try {
      const res = await fetch(`/api/invite/actions/${invite._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          toggleUsed: true
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInvites(invites.map(i => i._id === invite._id ? data.invite : i));
      }
    } catch (err) {
      console.error('Toggle error:', err);
    } finally {
      setActionId(null);
    }
  };

  // Delete guest
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invitation?')) return;
    const token = localStorage.getItem('token');
    setActionId(id);
    try {
      const res = await fetch(`/api/invite/actions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setInvites(invites.filter(i => i._id !== id));
      }
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setActionId(null);
    }
  };

  // Export
  const handleExport = async () => {
    setExporting(true);
    try {
      const targetInvites = exportSectionScope === 'all'
        ? invites
        : invites.filter(i => (i.section || 'section1') === activeSection);

      if (exportFormat === 'excel') {
        await exportToExcel(targetInvites, exportFilter);
      } else {
        await exportToWord(targetInvites, exportFilter);
      }
      setExportModalOpen(false);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to generate export file.');
    } finally {
      setExporting(false);
    }
  };

  // Metrics Calculations
  const sectionInvites = invites.filter(i => (i.section || 'section1') === activeSection);
  const totalGuests = sectionInvites.length;
  const attendingGuests = sectionInvites.filter(i => i.attending !== 'no');
  const confirmedCount = sectionInvites.filter(i => i.rsvpSubmitted && i.attending === 'yes').length;
  const checkedInCount = sectionInvites.filter(i => i.used).length;
  const tablesAssignedCount = sectionInvites.filter(i => Boolean(i.tableNumber)).length;
  const checkinPercent = totalGuests > 0 ? Math.round((checkedInCount / totalGuests) * 100) : 0;

  // Filtered Invites
  const filteredInvites = sectionInvites.filter((inv) => {
    // Search
    const matchesSearch =
      inv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.phone && inv.phone.includes(searchTerm)) ||
      (inv.tableNumber && inv.tableNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      inv.token.toLowerCase().includes(searchTerm.toLowerCase());

    // Table filter
    let matchesTable = true;
    if (tableFilter === 'with-table') matchesTable = Boolean(inv.tableNumber);
    if (tableFilter === 'without-table') matchesTable = !inv.tableNumber;

    // Status filter
    let matchesStatus = true;
    if (statusFilter === 'checked-in') matchesStatus = inv.used;
    if (statusFilter === 'pending') matchesStatus = !inv.used && inv.attending !== 'no';
    if (statusFilter === 'declined') matchesStatus = inv.attending === 'no';

    return matchesSearch && matchesTable && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-blue-100">
      
      {/* ── TOP NAV / HEADER ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <PalmriseLogo size="md" />

          <div className="flex items-center gap-3">
            <Link
              href="/scan"
              className="px-3.5 py-2 rounded-xl bg-red-50 text-[#DC2626] hover:bg-red-100 border border-red-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span>Gate Scanner</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ───────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Banner with Event Title & Section Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1D4ED8]">
              <span className="w-2 h-2 rounded-full bg-[#1D4ED8]" />
              Event Operations Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Palmrise Executive Gala &amp; Summit 2026
            </h1>
            <p className="text-xs text-slate-500">
              Manage guest vouchers, monitor gate admissions, re-allocate tables, and generate reports.
            </p>
          </div>

          {/* Section Tabs */}
          <div className="flex items-center p-1 bg-slate-200/70 rounded-2xl w-fit">
            <button
              onClick={() => setActiveSection('section1')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'section1'
                  ? 'bg-white text-[#1D4ED8] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Section 1 (Main Hall)
            </button>
            <button
              onClick={() => setActiveSection('section2')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'section2'
                  ? 'bg-white text-[#1D4ED8] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Section 2 (Executive)
            </button>
          </div>
        </div>

        {/* ── 4 STAT METRIC CARDS ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Registered */}
          <div className="card-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Guests</span>
              <p className="text-3xl font-black text-slate-900">{totalGuests}</p>
              <span className="text-[11px] text-slate-500">{activeSection === 'section1' ? 'Main Hall' : 'Executive'}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1D4ED8] border border-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          {/* Card 2: Confirmed Attending */}
          <div className="card-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirmed RSVP</span>
              <p className="text-3xl font-black text-blue-700">{confirmedCount}</p>
              <span className="text-[11px] text-slate-500">of {totalGuests} guests</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Checked In (Live at Gate) */}
          <div className="card-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gate Verified</span>
              <p className="text-3xl font-black text-emerald-600">{checkedInCount}</p>
              <span className="text-[11px] font-semibold text-emerald-600">{checkinPercent}% Admitted</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
          </div>

          {/* Card 4: Tables Assigned */}
          <div className="card-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tables Assigned</span>
              <p className="text-3xl font-black text-slate-800">{tablesAssignedCount}</p>
              <span className="text-[11px] text-slate-500">of {totalGuests} allocated</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#DC2626] border border-red-100 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
          </div>

        </div>

        {/* ── TOOLBAR: ACTIONS & FILTERS ─────────────────────────────────── */}
        <div className="card-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            
            {/* Action Buttons: Add, Table Switch, Export */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={openCreateModal}
                className="px-4 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Guest</span>
              </button>

              <button
                onClick={() => openSwitchModal(activeSection)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Shuffle className="w-4 h-4 text-[#DC2626]" />
                <span>Switch Tables</span>
              </button>

              <button
                onClick={() => setExportModalOpen(true)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#1D4ED8]" />
                <span>Export Reports</span>
              </button>

              <button
                onClick={fetchInvites}
                disabled={loading}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all"
                title="Refresh List"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Live Count Badge */}
            <div className="text-xs text-slate-500">
              Showing <span className="font-bold text-slate-900">{filteredInvites.length}</span> of {totalGuests} guests
            </div>

          </div>

          {/* Search & Filter Row */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search guest name, phone, table number, token..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              >
                <option value="all">All Gate Status</option>
                <option value="checked-in">Checked In Only</option>
                <option value="pending">Pending Gate Scan</option>
                <option value="declined">Declined</option>
              </select>

              <select
                value={tableFilter}
                onChange={(e) => setTableFilter(e.target.value as any)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
              >
                <option value="all">All Tables</option>
                <option value="with-table">Assigned Table</option>
                <option value="without-table">No Table</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── GUEST DIRECTORY TABLE ───────────────────────────────────────── */}
        <div className="card-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <th className="py-4 px-6">Guest Information</th>
                  <th className="py-4 px-4">Contact</th>
                  <th className="py-4 px-4 text-center">Table</th>
                  <th className="py-4 px-4 text-center">RSVP</th>
                  <th className="py-4 px-4 text-center">Gate Check-in</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      <Loader2 className="w-8 h-8 text-[#1D4ED8] animate-spin mx-auto mb-2" />
                      Loading guest list...
                    </td>
                  </tr>
                ) : filteredInvites.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No guests match your search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvites.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-50/70 transition-colors">
                      
                      {/* Name & Type */}
                      <td className="py-4 px-6">
                        <div className="space-y-0.5">
                          <span className="font-bold text-sm text-slate-900">{inv.name}</span>
                          {inv.isAdditionalGuest && inv.mainGuestName && (
                            <span className="inline-block text-[10px] text-[#DC2626] font-semibold bg-red-50 px-2 py-0.5 rounded border border-red-100">
                              Guest of {inv.mainGuestName}
                            </span>
                          )}
                          <div className="font-mono text-[9px] text-slate-400">
                            {inv.token.substring(0, 10)}...
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="py-4 px-4 text-slate-600">
                        {inv.phone || '—'}
                      </td>

                      {/* Table */}
                      <td className="py-4 px-4 text-center">
                        {inv.tableNumber ? (
                          <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-[#1D4ED8] font-bold text-xs border border-blue-200">
                            Table {inv.tableNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* RSVP Status */}
                      <td className="py-4 px-4 text-center">
                        {inv.attending === 'no' ? (
                          <span className="inline-block px-2.5 py-1 rounded-md bg-red-50 text-[#DC2626] font-bold text-[10px] uppercase border border-red-200">
                            Declined
                          </span>
                        ) : inv.rsvpSubmitted ? (
                          <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-[#1D4ED8] font-bold text-[10px] uppercase border border-blue-200">
                            Confirmed
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 font-semibold text-[10px] uppercase">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Gate Check-in Status */}
                      <td className="py-4 px-4 text-center">
                        {inv.used ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Checked In</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 font-medium text-[10px]">
                            <span>Not Scanned</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          
                          {/* Copy Link */}
                          <button
                            onClick={() => copyInviteLink(inv.token)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#1D4ED8] hover:bg-blue-50 transition-all"
                            title="Copy Pass Link"
                          >
                            {copyToast === inv.token ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          {/* View Pass Page */}
                          <Link
                            href={`/invite/${encodeURIComponent(inv.token)}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#1D4ED8] hover:bg-blue-50 transition-all"
                            title="View Official Pass"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {/* Toggle Check-in */}
                          <button
                            onClick={() => handleToggleCheckin(inv)}
                            disabled={actionId === inv._id}
                            className={`p-1.5 rounded-lg transition-all ${
                              inv.used
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={inv.used ? 'Mark Unchecked' : 'Mark Checked In'}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(inv)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-all"
                            title="Edit Details"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(inv._id)}
                            disabled={actionId === inv._id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#DC2626] hover:bg-red-50 transition-all"
                            title="Delete Guest"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* ── MODAL: CREATE GUEST ─────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs p-4 flex items-center justify-center">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-fadeInUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Add New Guest</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvite} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Guest Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Ngozi Adeleke"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="+234..."
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Table Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 14 or VIP-A"
                    value={newTableNumber}
                    onChange={(e) => setNewTableNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Section</label>
                  <select
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  >
                    <option value="section1">Section 1 (Main)</option>
                    <option value="section2">Section 2 (Executive)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Max Plus-Ones</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Accompanying Host (If +1)</label>
                <input
                  type="text"
                  placeholder="Primary guest name (leave empty if main guest)"
                  value={guestOfName}
                  onChange={(e) => setGuestOfName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT GUEST ───────────────────────────────────────────── */}
      {editModalOpen && editingInvite && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs p-4 flex items-center justify-center">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-fadeInUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Edit Guest Details</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateInvite} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Guest Full Name *</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Table Number</label>
                  <input
                    type="text"
                    value={editTableNumber}
                    onChange={(e) => setEditTableNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Section</label>
                  <select
                    value={editSection}
                    onChange={(e) => setEditSection(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  >
                    <option value="section1">Section 1 (Main)</option>
                    <option value="section2">Section 2 (Executive)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Max Plus-Ones</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={editMaxGuests}
                    onChange={(e) => setEditMaxGuests(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: TABLE SWITCHING & RE-ALLOCATION ────────────────────── */}
      {switchModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs p-4 flex items-center justify-center">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto animate-fadeInUp">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#DC2626]">Dynamic Seating Engine</span>
                <h3 className="text-xl font-bold text-slate-900">Table Switch &amp; Permutation Cycles</h3>
              </div>
              <button onClick={() => setSwitchModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {switchFeedback && (
              <div className={`p-4 rounded-xl text-xs font-semibold ${
                switchFeedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-red-50 text-[#DC2626] border border-red-200'
              }`}>
                {switchFeedback.message}
              </div>
            )}

            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Rotate guests dynamically across tables for post-banquet networking sessions. The 30-table permutation maps ensure flawless rotation without duplicate table collisions.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TABLE_CYCLES.map((cycle) => (
                  <div key={cycle.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">{cycle.name}</h4>
                      <span className="text-[10px] font-bold text-[#1D4ED8] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {cycle.count} Tables
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
                      {cycle.description}
                    </p>
                    <button
                      onClick={() => handleExecuteSwitch(cycle.id)}
                      disabled={switchExecuting}
                      className="w-full py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Shuffle className="w-3.5 h-3.5" />
                      <span>Execute {cycle.name}</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleRevertSwitch('all')}
                  disabled={switchExecuting}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-[#DC2626] font-bold text-xs uppercase tracking-wider rounded-xl border border-red-200 transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Revert to Previous Tables</span>
                </button>

                <button
                  onClick={() => setSwitchModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl"
                >
                  Done
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EXPORT DATA ───────────────────────────────────────────── */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs p-4 flex items-center justify-center">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-fadeInUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Export Guest Data</h3>
              <button onClick={() => setExportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              
              {/* Format */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 uppercase tracking-wider">File Format</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setExportFormat('excel')}
                    className={`py-3 px-4 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      exportFormat === 'excel'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Excel (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => setExportFormat('word')}
                    className={`py-3 px-4 rounded-xl border font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      exportFormat === 'word'
                        ? 'bg-blue-50 border-blue-500 text-[#1D4ED8] ring-2 ring-blue-200'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Word (.docx)</span>
                  </button>
                </div>
              </div>

              {/* Scope */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 uppercase tracking-wider">Section Scope</label>
                <select
                  value={exportSectionScope}
                  onChange={(e) => setExportSectionScope(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                >
                  <option value="current">Current Section ({activeSection === 'section1' ? 'Main Hall' : 'Executive'})</option>
                  <option value="all">Entire Event (All Sections)</option>
                </select>
              </div>

              {/* Filter */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 uppercase tracking-wider">Guest Subset Filter</label>
                <select
                  value={exportFilter}
                  onChange={(e) => setExportFilter(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                >
                  <option value="all">All Registered Guests</option>
                  <option value="checked-in">Only Gate-Verified (Checked In)</option>
                  <option value="not-checked-in">Unchecked Guests Only</option>
                  <option value="with-table">Assigned Table Only</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setExportModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex-1 py-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Download File'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        Palmrise Event Management System · Organizer Control Engine v2.0
      </footer>

    </div>
  );
}
