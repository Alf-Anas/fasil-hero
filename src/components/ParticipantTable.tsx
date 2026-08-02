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
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Check,
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

  // Filtering Logic
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
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

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, redeemFilter, waInviteFilter, firstSeenFilter, badgeTierFilter, onlyNewFilter]);

  const totalPages = Math.ceil(filteredParticipants.length / pageSize) || 1;
  const paginatedParticipants = useMemo(() => {
    const startIdx = (currentPage - 1) * pageSize;
    return filteredParticipants.slice(startIdx, startIdx + pageSize);
  }, [filteredParticipants, currentPage, pageSize]);

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
            Klik nomor HP untuk membuka WhatsApp (https://wa.me/...).
          </p>
        </div>

        <button
          onClick={() => onExportFiltered(filteredParticipants)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          Export Excel (.xlsx)
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Bar */}
          <div className="relative lg:col-span-2">
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
              {allFirstSeenDates.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary Filter Buttons & Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-400 font-medium shrink-0">Tier:</span>
            <div className="flex items-center gap-1 shrink-0">
              {[
                { id: 'ALL', label: 'Semua' },
                { id: 'ZERO', label: '0 Badges' },
                { id: '1_10', label: '1 - 10' },
                { id: '11_25', label: '11 - 25' },
                { id: '26_PLUS', label: '26+' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setBadgeTierFilter(tier.id)}
                  className={`px-2.5 py-1 text-[11px] rounded-lg font-bold transition-colors cursor-pointer ${
                    badgeTierFilter === tier.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-slate-300 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={onlyNewFilter}
                onChange={(e) => setOnlyNewFilter(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
              />
              <span className="inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Hanya Baru di {selectedSnapshotDate || 'Snapshot'}
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
                className="text-xs text-blue-400 font-medium hover:underline ml-auto"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/40">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-slate-950 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3 px-3 w-10 text-center">No</th>
              <th className="py-3 px-3">Peserta & WA Link</th>
              <th className="py-3 px-3 text-center">Status Redeem</th>
              <th className="py-3 px-3 text-center">WA Invited</th>
              <th className="py-3 px-3 text-center">Skill</th>
              <th className="py-3 px-3 text-center">Arcade</th>
              <th className="py-3 px-3 text-center">Total</th>
              <th className="py-3 px-3">Catatan</th>
              <th className="py-3 px-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {paginatedParticipants.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-500">
                  <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  Tidak ada peserta yang cocok dengan filter.
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
                    className="hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    {/* Index */}
                    <td className="py-3 px-3 text-center text-slate-500 font-medium">{rowNum}</td>

                    {/* Participant Info & Phone Link */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-100 text-sm group-hover:text-blue-400 transition-colors">
                            {p.name}
                          </span>
                          {isNewParticipant && (
                            <span className="px-1.5 py-0.5 text-[9px] font-black bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5 text-amber-400" /> NEW
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400 text-[11px] font-mono">{p.email}</span>

                        {/* Direct WhatsApp link requirement */}
                        {p.phone ? (
                          <a
                            href={getWaDirectUrl(p.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-mono text-[11px] mt-0.5 hover:underline"
                            title="Buka Aplikasi WhatsApp (https://wa.me/)"
                          >
                            <span>{p.phone}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-emerald-400" />
                          </a>
                        ) : (
                          <span className="text-slate-600 text-[11px]">-</span>
                        )}
                      </div>
                    </td>

                    {/* Redeem Status */}
                    <td className="py-3 px-3 text-center">
                      {isRedeemed ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 text-emerald-400" /> Redeem
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          <XCircle className="w-3 h-3 text-rose-400" /> Belum
                        </span>
                      )}
                    </td>

                    {/* WA Invited Toggle */}
                    <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => handleToggleWaInvite(p.email, p.wa_invited, e)}
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
                          className="text-slate-500 hover:text-blue-400 p-1 rounded hover:bg-slate-800 shrink-0"
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
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
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
            className="py-1 px-2 rounded-lg border border-slate-800 text-xs bg-slate-950 text-slate-200 focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>
            (Total {filteredParticipants.length} peserta)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-slate-300 font-bold px-2">
            {currentPage} / {totalPages}
          </span>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inline Notes Edit Modal */}
      {editingNotesEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 rounded-2xl p-5 max-w-md w-full shadow-2xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-400" />
              Edit Catatan Fasilitator
            </h3>
            <p className="text-xs text-slate-400">
              Catatan untuk <strong className="text-slate-200">{editingNotesEmail}</strong>:
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
                onClick={() => setEditingNotesEmail(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-300 rounded-xl border border-slate-800 hover:bg-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-500 shadow-md shadow-blue-500/20"
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
