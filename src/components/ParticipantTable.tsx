import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  MessageSquare,
  CheckCircle,
  XCircle,
  ExternalLink,
  Edit2,
  PhoneCall,
  UserPlus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  Check,
  Tag,
  Info,
  Layers,
} from 'lucide-react';
import { ParticipantRecord } from '../types';
import { db } from '../db';

interface ParticipantTableProps {
  participants: ParticipantRecord[];
  allFirstSeenDates: string[];
  selectedSnapshotDate: string;
  onParticipantUpdated: () => void;
  onOpenDetail: (participant: ParticipantRecord) => void;
  onExportFiltered: (filtered: ParticipantRecord[]) => void;
}

export const ParticipantTable: React.FC<ParticipantTableProps> = ({
  participants,
  allFirstSeenDates,
  selectedSnapshotDate,
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
  const [onlyNewFilter, setOnlyNewFilter] = useState<boolean>(false);

  // Notes Modal state
  const [editingNotesEmail, setEditingNotesEmail] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Handle WA Invited toggle in Dexie IndexedDB
  const handleToggleWaInvite = async (email: string, currentStatus: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await db.participants.update(email, {
        wa_invited: !currentStatus,
      });
      onParticipantUpdated();
    } catch (err) {
      console.error('Failed to update WA invited status', err);
    }
  };

  // Open Notes Modal
  const handleStartEditNotes = (participant: ParticipantRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNotesEmail(participant.email);
    setNotesValue(participant.notes || '');
  };

  // Save Notes to Dexie IndexedDB
  const handleSaveNotes = async () => {
    if (!editingNotesEmail) return;
    try {
      await db.participants.update(editingNotesEmail, {
        notes: notesValue,
      });
      setEditingNotesEmail(null);
      onParticipantUpdated();
    } catch (err) {
      console.error('Failed to update participant notes', err);
    }
  };

  // Generate WhatsApp message link
  const getWaLink = (phone: string, name: string) => {
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

  // Filtering Logic
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      // 1. Search term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchName = p.name.toLowerCase().includes(term);
        const matchEmail = p.email.toLowerCase().includes(term);
        const matchPhone = p.phone.toLowerCase().includes(term);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }

      // 2. Redeem Code Status
      if (redeemFilter === 'SUDAH' && p.access_code_status !== 'Sudah Redeem') return false;
      if (redeemFilter === 'BELUM' && p.access_code_status === 'Sudah Redeem') return false;

      // 3. WA Invite Status
      if (waInviteFilter === 'INVITED' && !p.wa_invited) return false;
      if (waInviteFilter === 'NOT_INVITED' && p.wa_invited) return false;

      // 4. First Seen Date
      if (firstSeenFilter !== 'ALL' && p.first_seen_date !== firstSeenFilter) return false;

      // 5. Badge Tier Filter
      const totalCombined = (p.skill_badges_count || 0) + (p.arcade_games_count || 0);
      if (badgeTierFilter === 'ZERO' && totalCombined > 0) return false;
      if (badgeTierFilter === '1_10' && (totalCombined < 1 || totalCombined > 10)) return false;
      if (badgeTierFilter === '11_25' && (totalCombined < 11 || totalCombined > 25)) return false;
      if (badgeTierFilter === '26_PLUS' && totalCombined < 26) return false;

      // 6. Only New on Selected Snapshot Date
      if (onlyNewFilter && p.first_seen_date !== selectedSnapshotDate) return false;

      return true;
    });
  }, [
    participants,
    searchTerm,
    redeemFilter,
    waInviteFilter,
    firstSeenFilter,
    badgeTierFilter,
    onlyNewFilter,
    selectedSnapshotDate,
  ]);

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, redeemFilter, waInviteFilter, firstSeenFilter, badgeTierFilter, onlyNewFilter]);

  // Paginated Slice
  const totalPages = Math.ceil(filteredParticipants.length / pageSize) || 1;
  const paginatedParticipants = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredParticipants.slice(startIdx, startIdx + pageSize);
  }, [filteredParticipants, currentPage, pageSize]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
      {/* Table Header & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            Daftar Peserta & Progres Facilitator
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {filteredParticipants.length} Peserta
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau status redeem kode akses, invite grup WhatsApp, serta catatan khusus untuk tiap peserta.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => onExportFiltered(filteredParticipants)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export Data Tabel (.xlsx)
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Bar */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nama, Email, No HP..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Status Redeem */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
              Redeem Kode Akses
            </label>
            <select
              value={redeemFilter}
              onChange={(e) => setRedeemFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="SUDAH">✅ Sudah Redeem</option>
              <option value="BELUM">❌ Belum Redeem</option>
            </select>
          </div>

          {/* Filter Status WA Invite */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
              Status WA Invite
            </label>
            <select
              value={waInviteFilter}
              onChange={(e) => setWaInviteFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Status</option>
              <option value="INVITED">💬 Sudah Invited</option>
              <option value="NOT_INVITED">⏳ Belum Invited</option>
            </select>
          </div>

          {/* Filter Tanggal Masuk */}
          <div>
            <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">
              Tanggal Masuk (First Seen)
            </label>
            <select
              value={firstSeenFilter}
              onChange={(e) => setFirstSeenFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Tanggal</option>
              {allFirstSeenDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Row: Badge Tier & Quick Checkbox Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-medium">Tier Badges:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'ALL', label: 'Semua' },
                { id: 'ZERO', label: '0 Badges' },
                { id: '1_10', label: '1 - 10 Badges' },
                { id: '11_25', label: '11 - 25 Badges' },
                { id: '26_PLUS', label: '26+ Badges' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setBadgeTierFilter(tier.id)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                    badgeTierFilter === tier.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={onlyNewFilter}
                onChange={(e) => setOnlyNewFilter(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Hanya Peserta Baru di Snapshot Ini ({selectedSnapshotDate})
              </span>
            </label>

            {(searchTerm || redeemFilter !== 'ALL' || waInviteFilter !== 'ALL' || firstSeenFilter !== 'ALL' || badgeTierFilter !== 'ALL' || onlyNewFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRedeemFilter('ALL');
                  setWaInviteFilter('ALL');
                  setFirstSeenFilter('ALL');
                  setBadgeTierFilter('ALL');
                  setOnlyNewFilter(false);
                }}
                className="text-xs text-blue-600 font-medium hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-3 w-12 text-center">No</th>
              <th className="py-3 px-3">Peserta & Kontak</th>
              <th className="py-3 px-3 text-center">Status Redeem</th>
              <th className="py-3 px-3 text-center">WA Invited</th>
              <th className="py-3 px-3 text-center">Skill Badges</th>
              <th className="py-3 px-3 text-center">Arcade Games</th>
              <th className="py-3 px-3 text-center">Total Badges</th>
              <th className="py-3 px-3">Catatan Fasilitator</th>
              <th className="py-3 px-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedParticipants.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Tidak ada data peserta yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              paginatedParticipants.map((p, idx) => {
                const isNewParticipant = p.first_seen_date === selectedSnapshotDate;
                const isRedeemed = p.access_code_status === 'Sudah Redeem';
                const totalCombined = p.skill_badges_count + p.arcade_games_count;
                const rowNum = (currentPage - 1) * pageSize + idx + 1;

                return (
                  <tr
                    key={p.email}
                    onClick={() => onOpenDetail(p)}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  >
                    {/* Index */}
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{rowNum}</td>

                    {/* Participant Info */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                            {p.name}
                          </span>
                          {isNewParticipant && (
                            <span className="px-1.5 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-800 rounded border border-amber-300 flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5 text-amber-600" /> NEW
                            </span>
                          )}
                        </div>
                        <span className="text-slate-500 text-[11px] font-mono">{p.email}</span>
                        {p.phone && (
                          <span className="text-slate-400 text-[11px]">{p.phone}</span>
                        )}
                      </div>
                    </td>

                    {/* Redeem Status */}
                    <td className="py-3 px-3 text-center">
                      {isRedeemed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Sudah Redeem
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <XCircle className="w-3 h-3 text-rose-600" /> Belum Redeem
                        </span>
                      )}
                    </td>

                    {/* WA Invited Toggle */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleToggleWaInvite(p.email, p.wa_invited, e)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                          p.wa_invited
                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                        }`}
                      >
                        {p.wa_invited ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-blue-600" />
                            Invited
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                            Belum
                          </>
                        )}
                      </button>
                    </td>

                    {/* Skill Badges */}
                    <td className="py-3 px-3 text-center font-extrabold text-emerald-700 text-sm">
                      {p.skill_badges_count}
                    </td>

                    {/* Arcade Games */}
                    <td className="py-3 px-3 text-center font-extrabold text-amber-700 text-sm">
                      {p.arcade_games_count}
                    </td>

                    {/* Total Combined */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-extrabold text-sm border border-blue-200">
                        {totalCombined}
                      </span>
                    </td>

                    {/* Facilitator Notes */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between gap-2 group/note max-w-[200px]">
                        <p className="text-slate-600 truncate text-[11px] italic">
                          {p.notes ? p.notes : <span className="text-slate-300">Belum ada catatan...</span>}
                        </p>
                        <button
                          onClick={(e) => handleStartEditNotes(p, e)}
                          title="Edit Catatan"
                          className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-slate-100"
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
                            href={getWaLink(p.phone, p.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Kirim Pesan WhatsApp"
                            className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm transition-colors"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => onOpenDetail(p)}
                          title="Lihat Detail Profil"
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
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
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Menampilkan rows per halaman:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="py-1 px-2 rounded border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>
            (Total {filteredParticipants.length} data)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-700 font-bold px-2">
            Halaman {currentPage} dari {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline Notes Edit Modal */}
      {editingNotesEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              Edit Catatan Fasilitator
            </h3>
            <p className="text-xs text-slate-500">
              Catatan untuk <strong className="text-slate-800">{editingNotesEmail}</strong>:
            </p>

            <textarea
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              rows={4}
              placeholder="Contoh: Sudah dihubungi via WA, berencana selesaikan 5 lab minggu ini..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setEditingNotesEmail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20"
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
