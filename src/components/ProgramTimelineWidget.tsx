import React from 'react';
import { Calendar, Clock, Flame, CheckCircle2, Sparkles } from 'lucide-react';
import { getProgramTimelineStatus } from '../utils/timeline';

export const ProgramTimelineWidget: React.FC = () => {
  const timeline = getProgramTimelineStatus();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg relative overflow-hidden space-y-4">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#fbbc04]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#fbbc04]/10 text-[#fbbc04] border border-[#fbbc04]/20 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white">Track Waktu Program Facilitator</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#fbbc04]/15 text-[#fbbc04] border border-[#fbbc04]/30 uppercase tracking-wider">
                {timeline.statusText}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              13 Juli 2026 – 14 September 2026 (Total 9 Minggu / {timeline.totalDays} Hari)
            </p>
          </div>
        </div>

        {/* Remaining Days Pill */}
        <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-2xl border border-slate-800 text-xs shrink-0 self-start sm:self-auto">
          <Flame className="w-4 h-4 text-[#fbbc04] animate-pulse" />
          <span className="text-slate-300 font-medium">Sisa Waktu:</span>
          <span className="font-extrabold text-white font-mono">{timeline.remainingDays} Hari Lagi</span>
        </div>
      </div>

      {/* Program Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#fbbc04]" />
            Minggu ke-{timeline.currentWeek} dari {timeline.totalWeeks} Minggu
          </span>
          <span className="text-[#fbbc04] font-mono font-extrabold">{timeline.progressPercentage}% Terlewati</span>
        </div>

        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-[#fbbc04] to-yellow-400 rounded-full transition-all duration-500 shadow-sm shadow-[#fbbc04]/20"
            style={{ width: `${timeline.progressPercentage}%` }}
          />
        </div>

        {/* Milestone Milestones ticks on timeline */}
        <div className="grid grid-cols-4 gap-1 pt-1 text-[10px] text-slate-400 text-center font-mono">
          <div className="border-t border-slate-800 pt-1">13 Jul (Awal)</div>
          <div className="border-t border-slate-800 pt-1">Awal Agt (W4)</div>
          <div className="border-t border-slate-800 pt-1">Awal Sep (W8)</div>
          <div className="border-t border-slate-800 pt-1">14 Sep (Akhir)</div>
        </div>
      </div>
    </div>
  );
};
