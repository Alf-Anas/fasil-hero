import React, { useState, useMemo } from 'react';
import {
  Search,
  MessageSquare,
  CheckCircle,
  XCircle,
  ExternalLink,
  Edit2,
  PhoneCall,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Check,
  Info,
  Layers,
  Eye,
  EyeOff,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
} from 'lucide-react';
import { ParticipantRecord, SnapshotRecord, RawParticipantRow } from '../types';
import { db } from '../db';
import { calculateHighestMilestone } from '../utils/milestones';
import { maskEmail, maskPhone } from '../utils/masking';
import { parseNumberCell, normalizeAccessCodeStatus } from '../utils/excelParser';

type SortField =
  | 'name'
  | 'email'
  | 'access_code_status'
  | 'calculated_milestone'
  | 'wa_invited'
  | 'skill_badges_count'
  | 'arcade_games_count'
  | 'total_combined'
  | 'first_seen_date';

type SortDirection = 'asc' | 'desc';

interface ParticipantTableProps {
  participants: ParticipantRecord[];
  snapshots?: SnapshotRecord[];
  allFirstSeenDates: string[];
  selectedSnapshotDate: string;
  hideSensitive?: boolean;
  onToggleHideSensitive?: () => void;
  onParticipantUpdated: () => void;
  onOpenDetail: (participant: ParticipantRecord) => void;
  onExportFiltered: (filtered: ParticipantRecord[]) => void;
}

export const ParticipantTable: React.FC<ParticipantTableProps> = ({
  participants,
  snapshots = [],
  allFirstSeenDates,
  selectedSnapshotDate,
  hideSensitive = false,
  onToggleHideSensitive,
  onParticipantUpdated,
  onOpenDetail,
  onExportFiltered,
}) => {
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [redeemFilter, setRedeemFilter] = useState<string>('ALL'); // ALL, SUDAH, BELUM
  const [waInviteFilter, setWaInviteFilter] = useState<string>('ALL'); // ALL, INVITED, NOT_INVITED
  const [firstSeenFilter, setFirstSeenFilter] = useState<string>('ALL');
  const [badgeTierFilter, setBadgeTierFilter] = useState<string>('ALL'); // ALL, ZERO, 1_10, 11_25, 26_PLUS
  const [milestoneFilter, setMilestoneFilter] = useState<string>('ALL'); // ALL, ULTIMATE, M3, M2, M1, NONE
  const [onlyNewFilter, setOnlyNewFilter] = useState<boolean>(false);

  // Sorting States
  const [sortField, setSortField] = useState<SortField>('total_combined');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Notes Modal state
  const [editingParticipant, setEditingParticipant] = useState<ParticipantRecord | null>(null);
  const [notesValue, setNotesValue] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // 1. Snapshot Specific Data Parsing
  const displayedParticipants = useMemo(() => {
    if (!selectedSnapshotDate || snapshots.length === 0) {
      return participants;
    }

    const matchingSnapshot = snapshots.find((s) => s.snapshot_date === selectedSnapshotDate);
    if (!matchingSnapshot || !matchingSnapshot.raw_data_json) {
      return participants;
    }

    try {
      const rawRows: RawParticipantRow[] = JSON.parse(matchingSnapshot.raw_data_json);
      const masterMap = new Map<string, ParticipantRecord>();
      participants.forEach((p) => masterMap.set(p.email.toLowerCase().trim(), p));

      return rawRows.map((row) => {
        const rawEmail = row['Email Peserta'] || '';
        const email = rawEmail.toLowerCase().trim();
        const masterP = masterMap.get(email);

        const skillBadges = parseNumberCell(row['Jumlah Lencana Keahlian yang diselesaikan']);
        const arcadeGames = parseNumberCell(row['Jumlah Arcade Game yang diselesaikan']);
        const accessCodeStatus = normalizeAccessCodeStatus(row['Status Redeem Kode Akses']);

        return {
          email: email,
          project_id: matchingSnapshot.project_id,
          name: row['Nama Peserta'] || masterP?.name || email,
          phone: row['Nomor HP Peserta'] || masterP?.phone || '',
          access_code_status: accessCodeStatus,
          skills_profile_url: row['Status Google Skills URL Profil'] || masterP?.skills_profile_url || '',
          developer_profile_url: row['Status URL Profil Google Developer'] || masterP?.developer_profile_url || '',
          milestone_reached: row['Milestone Diraih'] || masterP?.milestone_reached || '',
          gear_digital_badge: row['Lencana GEAR'] || masterP?.gear_digital_badge || '',
          skill_badges_count: skillBadges,
          skill_badges_names: row['Nama Lencana Keahlian yang diselesaikan'] || '',
          arcade_games_count: arcadeGames,
          arcade_games_names: row['Nama Arcade Game yang diselesaikan'] || '',
          calculated_milestone: calculateHighestMilestone(arcadeGames, skillBadges),
          milestone_1_date: masterP?.milestone_1_date,
          milestone_2_date: masterP?.milestone_2_date,
          milestone_3_date: masterP?.milestone_3_date,
          ultimate_milestone_date: masterP?.ultimate_milestone_date,
          wa_invited: masterP ? masterP.wa_invited : false,
          notes: masterP ? masterP.notes : '',
          first_seen_date: masterP ? masterP.first_seen_date : matchingSnapshot.snapshot_date,
        } as ParticipantRecord;
      });
    } catch (e) {
      console.error('Failed to parse snapshot raw_data_json', e);
      return participants;
    }
  }, [participants, snapshots, selectedSnapshotDate]);

  // Handle WA Invited toggle in Dexie IndexedDB
  const handleToggleWaInvite = async (p: ParticipantRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await db.participants
        .where({ project_id: p.project_id, email: p.email })
        .modify({ wa_invited: !p.wa_invited });
      onParticipantUpdated();
    } catch (err) {
      console.error('Failed to update WA invited status', err);
    }
  };

  // Open Notes Modal
  const handleStartEditNotes = (participant: ParticipantRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingParticipant(participant);
    setNotesValue(participant.notes || '');
  };

  // Save Notes to Dexie IndexedDB
  const handleSaveNotes = async () => {
    if (!editingParticipant) return;
    try {
      await db.participants
        .where({ project_id: editingParticipant.project_id, email: editingParticipant.email })
        .modify({ notes: notesValue });
      setEditingParticipant(null);
      onParticipantUpdated();
    } catch (err) {
      console.error('Failed to update participant notes', err);
    }
  };

  // Clean phone number for WhatsApp link
  const getWaDirectUrl = (phone: string) => {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    return `https://wa.me/${cleanPhone}`;
  };

  // WhatsApp template message link
  const getWaMessageLink = (phone: string, name: string) => {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const message = encodeURIComponent(
      `Halo Kak ${name}! 👋\n\n` +
      `Saya Fasilitator Google Arcade 2026. Mau mengingatkan untuk cek progres lab & redeem kode aksesnya ya. ` +
      `Jika ada kendala saat pengerjaan skill badges atau arcade game, jangan ragu untuk tanyakan di grup! 🚀`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  // Sort Handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'name' || field === 'email' ? 'asc' : 'desc');
    }
  };

  // Filtering Logic
  const filteredParticipants = useMemo(() => {
    return displayedParticipants.filter((p) => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchName = p.name.toLowerCase().includes(term);
        const matchEmail = p.email.toLowerCase().includes(term);
        const matchPhone = p.phone.toLowerCase().includes(term);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }

      if (redeemFilter === 'SUDAH' && p.access_code_status !== 'Sudah Redeem') return false;
      if (redeemFilter === 'BELUM' && p.access_code_status === 'Sudah Redeem') return false;

      if (waInviteFilter === 'INVITED' && !p.wa_invited) return false;
      if (waInviteFilter === 'NOT_INVITED' && p.wa_invited) return false;

      if (firstSeenFilter !== 'ALL' && p.first_seen_date !== firstSeenFilter) return false;

      const totalCombined = (p.skill_badges_count || 0) + (p.arcade_games_count || 0);
      if (badgeTierFilter === 'ZERO' && totalCombined > 0) return false;
      if (badgeTierFilter === '1_10' && (totalCombined < 1 || totalCombined > 10)) return false;
      if (badgeTierFilter === '11_25' && (totalCombined < 11 || totalCombined > 25)) return false;
      if (badgeTierFilter === '26_PLUS' && totalCombined < 26) return false;

      if (milestoneFilter !== 'ALL') {
        const highest = p.calculated_milestone || calculateHighestMilestone(p.arcade_games_count, p.skill_badges_count);
        if (milestoneFilter === 'ULTIMATE' && highest !== 'Ultimate Milestone') return false;
        if (milestoneFilter === 'M3' && highest !== 'Milestone 3') return false;
        if (milestoneFilter === 'M2' && highest !== 'Milestone 2') return false;
        if (milestoneFilter === 'M1' && highest !== 'Milestone 1') return false;
        if (milestoneFilter === 'NONE' && highest !== 'Belum Milestone') return false;
      }

      if (onlyNewFilter && p.first_seen_date !== selectedSnapshotDate) return false;

      return true;
    });
  }, [
    displayedParticipants,
    searchTerm,
    redeemFilter,
    waInviteFilter,
    firstSeenFilter,
    badgeTierFilter,
    milestoneFilter,
    onlyNewFilter,
    selectedSnapshotDate,
  ]);

  // Sorting Logic
  const sortedParticipants = useMemo(() => {
    const list = [...filteredParticipants];
    return list.sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortField) {
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'email':
          valA = a.email.toLowerCase();
          valB = b.email.toLowerCase();
          break;
        case 'access_code_status':
          valA = a.access_code_status;
          valB = b.access_code_status;
          break;
        case 'wa_invited':
          valA = a.wa_invited ? 1 : 0;
          valB = b.wa_invited ? 1 : 0;
          break;
        case 'skill_badges_count':
          valA = a.skill_badges_count || 0;
          valB = b.skill_badges_count || 0;
          break;
        case 'arcade_games_count':
          valA = a.arcade_games_count || 0;
          valB = b.arcade_games_count || 0;
          break;
        case 'total_combined':
          valA = (a.skill_badges_count || 0) + (a.arcade_games_count || 0);
          valB = (b.skill_badges_count || 0) + (b.arcade_games_count || 0);
          break;
        case 'first_seen_date':
          valA = a.first_seen_date || '';
          valB = b.first_seen_date || '';
          break;
        case 'calculated_milestone': {
          const rankMap: Record<string, number> = {
            'Ultimate Milestone': 4,
            'Milestone 3': 3,
            'Milestone 2': 2,
            'Milestone 1': 1,
            'Belum Milestone': 0,
          };
          valA = rankMap[a.calculated_milestone || calculateHighestMilestone(a.arcade_games_count, a.skill_badges_count)] || 0;
          valB = rankMap[b.calculated_milestone || calculateHighestMilestone(b.arcade_games_count, b.skill_badges_count)] || 0;
          break;
        }
        default:
          valA = (a.skill_badges_count || 0) + (a.arcade_games_count || 0);
          valB = (b.skill_badges_count || 0) + (b.arcade_games_count || 0);
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredParticipants, sortField, sortDirection]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, redeemFilter, waInviteFilter, firstSeenFilter, badgeTierFilter, milestoneFilter, onlyNewFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(sortedParticipants.length / pageSize) || 1;
  const paginatedParticipants = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return sortedParticipants.slice(startIdx, startIdx + pageSize);
  }, [sortedParticipants, currentPage, pageSize]);

  // Render Sort Icon Helper
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60 group-hover:opacity-100 transition-opacity" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-400 font-black" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-400 font-black" />
    );
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-md overflow-hidden space-y-4 p-4 sm:p-5">
      {/* Table Header & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Daftar Peserta & Progres Facilitator
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-950 text-slate-300 border border-slate-800">
              {filteredParticipants.length} Peserta
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Klik nomor HP untuk membuka WhatsApp. Gunakan tombol sort header untuk mengurutkan kolom.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Hide Sensitive Data Toggle */}
          <button
            onClick={() => onToggleHideSensitive && onToggleHideSensitive()}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shrink-0 ${
              hideSensitive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-xs shadow-amber-500/10'
                : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
            }`}
            title={hideSensitive ? 'Data email & HP disembunyikan' : 'Sembunyikan email & no HP untuk screenshot/share'}
          >
            {hideSensitive ? (
              <EyeOff className="w-4 h-4 text-amber-400" />
            ) : (
              <Eye className="w-4 h-4 text-slate-400" />
            )}
            <span>{hideSensitive ? 'Sensitif: Sembunyi' : 'Sembunyikan Data Sensitif'}</span>
          </button>

          <button
            onClick={() => onExportFiltered(filteredParticipants)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            Export Excel (.xlsx)
          </button>
        </div>
      </div>

      {/* Snapshot Date Active Indicator */}
      {selectedSnapshotDate && (
        <div className="flex items-center justify-between bg-blue-950/40 border border-blue-800/60 rounded-xl px-3.5 py-2 text-xs text-blue-200">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              Menampilkan data snapshot tanggal: <strong className="text-white font-mono">{selectedSnapshotDate}</strong> ({displayedParticipants.length} peserta tercatat)
            </span>
          </div>
          <span className="text-[10px] bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-300 border border-blue-500/30 font-semibold">
            Snapshot Filtered
          </span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Bar - Fixed alignment with label */}
          <div className="relative lg:col-span-2 flex flex-col justify-end">
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
              Pencarian Peserta
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari Nama, Email, No HP..."
                className="w-full pl-9 pr-8 py-2 text-xs bg-slate-900 text-slate-100 placeholder-slate-500 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filter Milestone Peserta */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
              Milestone Peserta
            </label>
            <select
              value={milestoneFilter}
              onChange={(e) => setMilestoneFilter(e.target.value)}
              className="w-full py-2 px-2 text-xs bg-slate-900 text-slate-100 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Milestone</option>
              <option value="ULTIMATE">🏆 Ultimate Milestone</option>
              <option value="M3">🥇 Milestone 3</option>
              <option value="M2">🥈 Milestone 2</option>
              <option value="M1">🥉 Milestone 1</option>
              <option value="NONE">⚪ Belum Milestone</option>
            </select>
          </div>

          {/* Filter Status Redeem */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
              Status Redeem
            </label>
            <select
              value={redeemFilter}
              onChange={(e) => setRedeemFilter(e.target.value)}
              className="w-full py-2 px-2 text-xs bg-slate-900 text-slate-100 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="SUDAH">✅ Sudah Redeem</option>
              <option value="BELUM">❌ Belum Redeem</option>
            </select>
          </div>

          {/* Filter Status WA Invite */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
              WA Invite
            </label>
            <select
              value={waInviteFilter}
              onChange={(e) => setWaInviteFilter(e.target.value)}
              className="w-full py-2 px-2 text-xs bg-slate-900 text-slate-100 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="INVITED">💬 Sudah Invited</option>
              <option value="NOT_INVITED">⏳ Belum Invited</option>
            </select>
          </div>

          {/* Filter Tanggal Masuk */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
              First Seen
            </label>
            <select
              value={firstSeenFilter}
              onChange={(e) => setFirstSeenFilter(e.target.value)}
              className="w-full py-2 px-2 text-xs bg-slate-900 text-slate-100 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Tanggal</option>
              {allFirstSeenDates.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Second Row Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-4 flex-wrap text-xs text-slate-300">
            {/* Filter Badge Tier */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Poin:</span>
              <select
                value={badgeTierFilter}
                onChange={(e) => setBadgeTierFilter(e.target.value)}
                className="py-1 px-2 text-xs bg-slate-900 text-slate-100 rounded-lg border border-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">Semua</option>
                <option value="ZERO">0 Badges/Games</option>
                <option value="1_10">1 - 10 Point</option>
                <option value="11_25">11 - 25 Point</option>
                <option value="26_PLUS">26+ Point</option>
              </select>
            </div>

            {/* Checkbox Only New */}
            {selectedSnapshotDate && (
              <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                <input
                  type="checkbox"
                  checked={onlyNewFilter}
                  onChange={(e) => setOnlyNewFilter(e.target.checked)}
                  className="rounded border-slate-700 text-blue-500 focus:ring-0 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-200">
                  Hanya Peserta Baru di Snapshot Ini
                </span>
              </label>
            )}
          </div>

          {(searchTerm ||
            redeemFilter !== 'ALL' ||
            waInviteFilter !== 'ALL' ||
            firstSeenFilter !== 'ALL' ||
            badgeTierFilter !== 'ALL' ||
            milestoneFilter !== 'ALL' ||
            onlyNewFilter) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRedeemFilter('ALL');
                setWaInviteFilter('ALL');
                setFirstSeenFilter('ALL');
                setBadgeTierFilter('ALL');
                setMilestoneFilter('ALL');
                setOnlyNewFilter(false);
              }}
              className="text-xs text-blue-400 font-medium hover:underline ml-auto"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 text-slate-400 text-[10px] uppercase tracking-wider border-b border-slate-800 select-none">
            <tr>
              <th className="py-3 px-3 w-10 text-center">No</th>

              {/* Sortable: Peserta & Contact */}
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-3 cursor-pointer hover:text-slate-100 transition-colors group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Peserta & WA</span>
                  {renderSortIcon('name')}
                </div>
              </th>

              {/* Sortable: Status Redeem */}
              <th
                onClick={() => handleSort('access_code_status')}
                className="py-3 px-3 text-center cursor-pointer hover:text-slate-100 transition-colors group"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Status Redeem</span>
                  {renderSortIcon('access_code_status')}
                </div>
              </th>

              {/* Sortable: Milestone */}
              <th
                onClick={() => handleSort('calculated_milestone')}
                className="py-3 px-3 text-center cursor-pointer hover:text-slate-100 transition-colors group"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Milestone</span>
                  {renderSortIcon('calculated_milestone')}
                </div>
              </th>

              {/* Sortable: WA Invited */}
              <th
                onClick={() => handleSort('wa_invited')}
                className="py-3 px-3 text-center cursor-pointer hover:text-slate-100 transition-colors group"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>WA Invited</span>
                  {renderSortIcon('wa_invited')}
                </div>
              </th>

              {/* Sortable: Skill */}
              <th
                onClick={() => handleSort('skill_badges_count')}
                className="py-3 px-3 text-center cursor-pointer hover:text-slate-100 transition-colors group"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Skill</span>
                  {renderSortIcon('skill_badges_count')}
                </div>
              </th>

              {/* Sortable: Arcade */}
              <th
                onClick={() => handleSort('arcade_games_count')}
                className="py-3 px-3 text-center cursor-pointer hover:text-slate-100 transition-colors group"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Arcade</span>
                  {renderSortIcon('arcade_games_count')}
                </div>
              </th>

              {/* Sortable: Total Combined */}
              <th
                onClick={() => handleSort('total_combined')}
                className="py-3 px-3 text-center cursor-pointer hover:text-slate-100 transition-colors group"
              >
                <div className="flex items-center justify-center gap-1.5">
                  <span>Total Point</span>
                  {renderSortIcon('total_combined')}
                </div>
              </th>

              {/* Catatan */}
              <th className="py-3 px-3">Catatan</th>

              {/* Aksi */}
              <th className="py-3 px-3 text-center">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60">
            {paginatedParticipants.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-500">
                  <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  Tidak ada peserta yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              paginatedParticipants.map((p, idx) => {
                const totalCombined = (p.skill_badges_count || 0) + (p.arcade_games_count || 0);
                const rowNum = (currentPage - 1) * pageSize + idx + 1;

                return (
                  <tr
                    key={`${p.email}-${idx}`}
                    onClick={() => onOpenDetail(p)}
                    className="hover:bg-slate-900/80 transition-colors cursor-pointer group"
                  >
                    {/* Index */}
                    <td className="py-3 px-3 text-center font-mono text-slate-500 text-[11px]">
                      {rowNum}
                    </td>

                    {/* Participant Details */}
                    <td className="py-3 px-3">
                      <div>
                        <div className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {p.first_seen_date === selectedSnapshotDate && (
                            <span className="px-1.5 py-0.2 bg-blue-500/20 text-blue-300 text-[9px] rounded font-bold border border-blue-500/30">
                              Baru
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                          <span>{maskEmail(p.email, hideSensitive)}</span>
                          {p.phone && (
                            <a
                              href={getWaDirectUrl(p.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-emerald-400 hover:underline flex items-center gap-0.5"
                              title="Buka WA Direct"
                            >
                              • {maskPhone(p.phone, hideSensitive)}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Access Code Status */}
                    <td className="py-3 px-3 text-center">
                      {p.access_code_status === 'Sudah Redeem' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 text-emerald-400" />
                          Sudah Redeem
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3 text-rose-400" />
                          Belum Redeem
                        </span>
                      )}
                    </td>

                    {/* Milestone Peserta & Snapshot Date */}
                    <td className="py-3 px-3 text-center">
                      {(() => {
                        const highest =
                          p.calculated_milestone ||
                          calculateHighestMilestone(p.arcade_games_count, p.skill_badges_count);
                        const dateMap: Record<string, string | undefined> = {
                          'Ultimate Milestone': p.ultimate_milestone_date,
                          'Milestone 3': p.milestone_3_date,
                          'Milestone 2': p.milestone_2_date,
                          'Milestone 1': p.milestone_1_date,
                        };
                        const achievedDate = dateMap[highest];

                        if (highest === 'Ultimate Milestone') {
                          return (
                            <div className="flex flex-col items-center">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                🏆 Ultimate
                              </span>
                              {achievedDate && (
                                <span
                                  className="text-[9px] text-slate-400 font-mono mt-0.5"
                                  title={`Dicapai pada snapshot ${achievedDate}`}
                                >
                                  {achievedDate}
                                </span>
                              )}
                            </div>
                          );
                        }
                        if (highest === 'Milestone 3') {
                          return (
                            <div className="flex flex-col items-center">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                🥇 Milestone 3
                              </span>
                              {achievedDate && (
                                <span
                                  className="text-[9px] text-slate-400 font-mono mt-0.5"
                                  title={`Dicapai pada snapshot ${achievedDate}`}
                                >
                                  {achievedDate}
                                </span>
                              )}
                            </div>
                          );
                        }
                        if (highest === 'Milestone 2') {
                          return (
                            <div className="flex flex-col items-center">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                🥈 Milestone 2
                              </span>
                              {achievedDate && (
                                <span
                                  className="text-[9px] text-slate-400 font-mono mt-0.5"
                                  title={`Dicapai pada snapshot ${achievedDate}`}
                                >
                                  {achievedDate}
                                </span>
                              )}
                            </div>
                          );
                        }
                        if (highest === 'Milestone 1') {
                          return (
                            <div className="flex flex-col items-center">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                🥉 Milestone 1
                              </span>
                              {achievedDate && (
                                <span
                                  className="text-[9px] text-slate-400 font-mono mt-0.5"
                                  title={`Dicapai pada snapshot ${achievedDate}`}
                                >
                                  {achievedDate}
                                </span>
                              )}
                            </div>
                          );
                        }
                        return <span className="text-[10px] text-slate-500 font-mono">Belum</span>;
                      })()}
                    </td>

                    {/* WA Invited Toggle */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleToggleWaInvite(p, e)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                          p.wa_invited
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {p.wa_invited ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-blue-400" />
                            Invited
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5 text-slate-500" />
                            Belum
                          </>
                        )}
                      </button>
                    </td>

                    {/* Skill Badges */}
                    <td className="py-3 px-3 text-center font-extrabold text-emerald-400 text-sm">
                      {p.skill_badges_count}
                    </td>

                    {/* Arcade Games */}
                    <td className="py-3 px-3 text-center font-extrabold text-amber-400 text-sm">
                      {p.arcade_games_count}
                    </td>

                    {/* Total Combined */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 font-extrabold text-xs border border-blue-500/30">
                        {totalCombined}
                      </span>
                    </td>

                    {/* Facilitator Notes */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between gap-1 max-w-[180px]">
                        <p className="text-slate-400 truncate text-[11px] italic">
                          {p.notes ? p.notes : <span className="text-slate-600">Belum ada...</span>}
                        </p>
                        <button
                          onClick={(e) => handleStartEditNotes(p, e)}
                          title="Edit Catatan"
                          className="text-slate-500 hover:text-blue-400 p-1 rounded hover:bg-slate-800 shrink-0 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        {p.phone && (
                          <a
                            href={getWaMessageLink(p.phone, p.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Kirim Pesan Template WA Facilitator"
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow-xs transition-colors"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => onOpenDetail(p)}
                          title="Lihat Detail Profil"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Baris per halaman:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="py-1 px-2 rounded-lg border border-slate-800 text-xs bg-slate-950 text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>(Total {filteredParticipants.length} peserta)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-300 font-bold px-2">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline Notes Edit Modal */}
      {editingParticipant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              Edit Catatan Fasilitator
            </h3>
            <p className="text-xs text-slate-400">
              Catatan untuk <strong className="text-slate-200">{editingParticipant.name || editingParticipant.email}</strong> ({maskEmail(editingParticipant.email, hideSensitive)}):
            </p>

            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              rows={4}
              placeholder="Contoh: Sudah dihubungi via WA, berencana selesaikan 5 lab minggu ini..."
              className="w-full p-3 text-xs bg-slate-950 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingParticipant(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 rounded-xl border border-slate-800 hover:bg-slate-800 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Simpan Catatan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
