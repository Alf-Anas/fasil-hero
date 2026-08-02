import React from 'react';
import { Award, CheckCircle2, Lock, Sparkles, Zap, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { FacilitatorMilestone } from '../types';

export const FACILITATOR_MILESTONES: FacilitatorMilestone[] = [
  {
    id: 1,
    title: 'Milestone #1',
    targetCombined: 500,
    recommendedArcade: 200,
    recommendedSkill: 300,
    badgeName: 'Facilitator Tier 1 Badge',
    rewardDescription: 'Sertifikat Facilitator Tier 1 & T-Shirt Eksklusif',
  },
  {
    id: 2,
    title: 'Milestone #2',
    targetCombined: 800,
    recommendedArcade: 300,
    recommendedSkill: 500,
    badgeName: 'Facilitator Tier 2 Badge',
    rewardDescription: 'Swag Pack Tier 2 + Hoodie Facilitator Google',
  },
  {
    id: 3,
    title: 'Milestone #3',
    targetCombined: 1150,
    recommendedArcade: 400,
    recommendedSkill: 750,
    badgeName: 'Facilitator Tier 3 Badge',
    rewardDescription: 'Swag Pack Premium + Google Cloud Tech Voucher',
  },
  {
    id: 4,
    title: 'Milestone #4',
    targetCombined: 1500,
    recommendedArcade: 500,
    recommendedSkill: 1000,
    badgeName: 'Facilitator Ultimate Hero',
    rewardDescription: 'Trophy Facilitator, Swag Ultimate & National Hall of Fame',
  },
];

interface MilestoneCardsProps {
  totalSkillBadges: number;
  totalArcadeGames: number;
  totalParticipants: number;
}

export const MilestoneCards: React.FC<MilestoneCardsProps> = ({
  totalSkillBadges,
  totalArcadeGames,
  totalParticipants,
}) => {
  const currentTotalCombined = totalSkillBadges + totalArcadeGames;

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4285F4', '#EA4335', '#FBBC04', '#34A853'],
    });
  };

  return (
    <div className="space-y-4">
      {/* Overview Stat Strip */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg shadow-blue-500/20 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white flex flex-wrap items-center gap-2">
              Google Arcade Facilitator 2026 Milestone
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                Official Metrics
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Total Gabungan Pencapaian = <strong className="text-slate-200">{totalSkillBadges} Skill Badges</strong> +{' '}
              <strong className="text-slate-200">{totalArcadeGames} Arcade Games</strong> ({totalParticipants} Peserta)
            </p>
          </div>
        </div>

        <div className="w-full md:w-auto grid grid-cols-3 gap-2 sm:gap-4 bg-slate-950 px-3 sm:px-4 py-2.5 rounded-xl border border-slate-800 text-center">
          <div>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold">Poin Gabungan</p>
            <p className="text-lg sm:text-xl font-extrabold text-blue-400">{currentTotalCombined.toLocaleString()}</p>
          </div>
          <div className="border-x border-slate-800 px-2">
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold">Skill Badges</p>
            <p className="text-lg sm:text-xl font-extrabold text-emerald-400">{totalSkillBadges.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-400 font-bold">Arcade Games</p>
            <p className="text-lg sm:text-xl font-extrabold text-amber-400">{totalArcadeGames.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 4 Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FACILITATOR_MILESTONES.map((ms, index) => {
          const isCompleted = currentTotalCombined >= ms.targetCombined;
          const prevTarget = index === 0 ? 0 : FACILITATOR_MILESTONES[index - 1].targetCombined;
          const isInProgress = !isCompleted && currentTotalCombined > prevTarget;
          const isLocked = !isCompleted && !isInProgress;

          const percentage = Math.min(100, Math.round((currentTotalCombined / ms.targetCombined) * 100));

          const themeStyles = [
            {
              border: isCompleted ? 'border-blue-500/80 ring-1 ring-blue-500/30' : 'border-slate-800',
              icon: 'text-blue-400',
            },
            {
              border: isCompleted ? 'border-red-500/80 ring-1 ring-red-500/30' : 'border-slate-800',
              icon: 'text-red-400',
            },
            {
              border: isCompleted ? 'border-amber-500/80 ring-1 ring-amber-500/30' : 'border-slate-800',
              icon: 'text-amber-400',
            },
            {
              border: isCompleted ? 'border-emerald-500/80 ring-1 ring-emerald-500/30' : 'border-slate-800',
              icon: 'text-emerald-400',
            },
          ][index];

          return (
            <div
              key={ms.id}
              className={`bg-slate-900 rounded-2xl p-5 border transition-all duration-200 hover:border-slate-700 relative overflow-hidden flex flex-col justify-between shadow-sm ${themeStyles.border}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Award className={`w-4 h-4 ${themeStyles.icon}`} />
                    {ms.title}
                  </span>

                  {isCompleted && (
                    <button
                      onClick={triggerCelebration}
                      title="Klik untuk selebrasi"
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Selesai
                    </button>
                  )}

                  {isInProgress && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      In Progress
                    </span>
                  )}

                  {isLocked && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-950 text-slate-500 border border-slate-800">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      Locked
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-white mb-1 flex items-center justify-between">
                  <span>Target {ms.targetCombined.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 font-normal">Poin</span>
                </h3>

                <p className="text-xs text-slate-400 mb-4 line-clamp-1">
                  💡 {ms.recommendedArcade} Arcade + {ms.recommendedSkill} Skill
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">
                      {currentTotalCombined.toLocaleString()} / {ms.targetCombined.toLocaleString()}
                    </span>
                    <span className={`${isCompleted ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : isInProgress
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          : 'bg-slate-700'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Reward Footer */}
              <div className="pt-3 border-t border-slate-800/80 mt-auto flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-300 leading-tight">
                  <strong className="text-white">{ms.badgeName}:</strong> {ms.rewardDescription}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
