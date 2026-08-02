import React from 'react';
import {
  Users,
  BookOpen,
  Gamepad2,
  Trophy,
  Award,
  Upload,
  BarChart2,
  CheckCircle,
  PhoneCall,
  Sparkles,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { ParticipantRecord, SnapshotRecord } from '../types';
import { FACILITATOR_MILESTONES } from './MilestoneCards';
import { ProgramTimelineWidget } from './ProgramTimelineWidget';

interface OverviewTabProps {
  participants: ParticipantRecord[];
  snapshots: SnapshotRecord[];
  selectedSnapshotDate: string;
  totalSkillBadges: number;
  totalArcadeGames: number;
  totalParticipants: number;
  onOpenUpload: () => void;
  onOpenHelp?: () => void;
  onNavigateTab: (tab: 'overview' | 'participants' | 'milestones' | 'analytics') => void;
  onOpenDetail: (participant: ParticipantRecord) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  participants,
  snapshots,
  selectedSnapshotDate,
  totalSkillBadges,
  totalArcadeGames,
  totalParticipants,
  onOpenUpload,
  onOpenHelp,
  onNavigateTab,
  onOpenDetail,
}) => {
  const combinedPoints = totalSkillBadges + totalArcadeGames;

  // Determine achieved milestone tier
  const currentTier =
    [...FACILITATOR_MILESTONES]
      .reverse()
      .find((m) => combinedPoints >= m.targetCombined) || FACILITATOR_MILESTONES[0];

  const nextTier = FACILITATOR_MILESTONES.find((m) => m.targetCombined > combinedPoints);

  const pointsNeededNext = nextTier ? nextTier.targetCombined - combinedPoints : 0;
  const progressPercentNext = nextTier
    ? Math.min(100, Math.round((combinedPoints / nextTier.targetCombined) * 100))
    : 100;

  // Calculate Redeem status stats
  const redeemedCount = participants.filter((p) => p.access_code_status === 'Sudah Redeem').length;
  const redeemedPercent = participants.length > 0 ? Math.round((redeemedCount / participants.length) * 100) : 0;

  // WA invited count
  const waInvitedCount = participants.filter((p) => p.wa_invited).length;
  const waInvitedPercent = participants.length > 0 ? Math.round((waInvitedCount / participants.length) * 100) : 0;

  // Top 3 Participants
  const topParticipants = [...participants]
    .sort(
      (a, b) =>
        b.skill_badges_count + b.arcade_games_count - (a.skill_badges_count + a.arcade_games_count)
    )
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Track Waktu Program Widget (13 Juli - 14 September 2026) */}
      <ProgramTimelineWidget />

      {/* 2. Active Snapshot Summary Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 sm:p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden shadow-xl">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#fbbc04]/15 text-[#fbbc04] border border-[#fbbc04]/30 uppercase tracking-wider">
              Snapshot Terpilih
            </span>
            <span className="text-xs font-mono font-bold text-slate-300">{selectedSnapshotDate || 'Terbaru'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Ringkasan Performa Facilitator Arcade 2026
          </h2>
          <p className="text-xs text-slate-300">
            Terdeteksi <strong className="text-white">{totalParticipants}</strong> peserta aktif dengan total <strong className="text-[#fbbc04] font-black">{combinedPoints.toLocaleString()}</strong> poin gabungan.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 relative z-10">
          <button
            onClick={onOpenUpload}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#fbbc04] text-slate-950 font-black text-xs hover:bg-amber-400 shadow-md shadow-[#fbbc04]/20 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            Upload Laporan Harian
          </button>
          <button
            onClick={() => onNavigateTab('analytics')}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <BarChart2 className="w-4 h-4 text-[#fbbc04]" />
            <span>Lihat Grafik</span>
          </button>
          {onOpenHelp && (
            <button
              onClick={onOpenHelp}
              className="inline-flex items-center justify-center p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#fbbc04] border border-slate-700 font-bold text-xs transition-colors cursor-pointer"
              title="Bantuan Kendala Teknis"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Points */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Poin Gabungan</p>
            <div className="p-2 rounded-xl bg-[#fbbc04]/10 text-[#fbbc04] border border-[#fbbc04]/20">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white mt-2">{combinedPoints.toLocaleString()}</p>
          <p className="text-[10px] text-[#fbbc04] font-bold mt-1">
            🎁 Status: {currentTier.title}
          </p>
        </div>

        {/* Card 2: Skill Badges */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Skill Badges</p>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-2">{totalSkillBadges.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Lencana Keahlian Praktis</p>
        </div>

        {/* Card 3: Arcade Games */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Arcade Games</p>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Gamepad2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-400 mt-2">{totalArcadeGames.toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-medium mt-1">Game Koin & Trivia</p>
        </div>

        {/* Card 4: Total Participants */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Peserta</p>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-indigo-400 mt-2">{totalParticipants}</p>
          <p className="text-[10px] text-emerald-400 font-bold mt-1">
            {redeemedPercent}% Sudah Redeem Kode
          </p>
        </div>
      </div>

      {/* 4. Middle Section: Milestone Target & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Target Milestone Status */}
        <div className="lg:col-span-2 bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#fbbc04]/10 text-[#fbbc04] border border-[#fbbc04]/20 rounded-xl">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Pencapaian Milestone Facilitator</h3>
                  <p className="text-xs text-slate-400">Target Poin Gabungan Peserta Google Arcade 2026</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('milestones')}
                className="text-xs font-bold text-[#fbbc04] hover:underline flex items-center gap-1 cursor-pointer"
              >
                Lihat Semua Tier <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Current Achieved Tier */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Tier Tercapai Saat Ini</p>
                <h4 className="text-lg font-black text-[#fbbc04] flex items-center gap-2">
                  {currentTier.title}
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  🎁 Swag: <span className="text-emerald-400 font-semibold">{currentTier.rewardDescription}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-2xl font-black text-white">{currentTier.targetCombined}</span>
                <span className="text-xs text-slate-400 block font-medium">Target Minimal Poin</span>
              </div>
            </div>

            {/* Next Tier Progress Bar */}
            {nextTier ? (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-extrabold text-slate-300">Menuju {nextTier.title}</span>
                  <span className="font-extrabold text-[#fbbc04]">{progressPercentNext}%</span>
                </div>

                <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-[#fbbc04] to-yellow-300 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercentNext}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                  <span>{combinedPoints.toLocaleString()} / {nextTier.targetCombined.toLocaleString()} Poin</span>
                  <span className="text-[#fbbc04] font-bold">Butuh {pointsNeededNext.toLocaleString()} Poin lagi</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center text-xs font-bold text-emerald-300">
                🎉 Selamat! Anda telah mencapai Tier Milestone Tertinggi (Milestone 4)!
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Rekomendasi Komposisi: 50% Arcade Games + 50% Skill Badges</span>
            <button
              onClick={() => onNavigateTab('participants')}
              className="text-[#fbbc04] font-bold hover:underline"
            >
              Kelola Peserta &rarr;
            </button>
          </div>
        </div>

        {/* Right 1 Col: Quick Status Cards */}
        <div className="space-y-3">
          {/* Redeem Status Progress Card */}
          <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-white flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Status Redeem Kode
              </span>
              <span className="font-mono font-bold text-emerald-400">{redeemedPercent}%</span>
            </div>

            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${redeemedPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">Sudah Redeem</span>
                <span className="font-bold text-emerald-400 text-sm">{redeemedCount}</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-slate-400 block text-[10px]">Belum Redeem</span>
                <span className="font-bold text-rose-400 text-sm">{participants.length - redeemedCount}</span>
              </div>
            </div>
          </div>

          {/* WA Invite Status Card */}
          <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-white flex items-center gap-1.5">
                <PhoneCall className="w-4 h-4 text-emerald-400" /> Status Invite WA Grup
              </span>
              <span className="font-mono font-bold text-indigo-400">{waInvitedPercent}%</span>
            </div>

            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${waInvitedPercent}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{waInvitedCount} dari {participants.length} peserta</span>
              <button
                onClick={() => onNavigateTab('participants')}
                className="text-[#fbbc04] font-bold hover:underline"
              >
                Cek List Peserta
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Top 3 Performers Section */}
      {topParticipants.length > 0 && (
        <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#fbbc04]" />
              <h3 className="text-sm font-extrabold text-white">
                Top 3 Peserta Berprestasi (Snapshot Terakhir)
              </h3>
            </div>

            <button
              onClick={() => onNavigateTab('participants')}
              className="text-xs font-bold text-[#fbbc04] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Buka Tabel Peserta <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topParticipants.map((p, idx) => {
              const totalP = p.skill_badges_count + p.arcade_games_count;
              const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
              return (
                <div
                  key={p.email}
                  onClick={() => onOpenDetail(p)}
                  className="p-4 bg-slate-950 border border-slate-800 hover:border-[#fbbc04]/50 rounded-2xl transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{medalEmoji}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#fbbc04]/10 text-[#fbbc04] border border-[#fbbc04]/20">
                      Rank #{idx + 1}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-[#fbbc04] transition-colors line-clamp-1">
                      {p.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">{p.email}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Total Poin:</span>
                    <span className="font-extrabold text-[#fbbc04]">{totalP} Pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
