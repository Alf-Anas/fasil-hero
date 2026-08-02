import React from 'react';
import { Award, CheckCircle2, Lock, Sparkles, Zap, Trophy, ShieldCheck } from 'lucide-react';
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
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl text-white shadow-md shadow-blue-500/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Google Arcade Facilitator 2026 Milestone
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold border border-blue-200">
                Official Metrics
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Total Gabungan Pencapaian = <strong className="text-slate-800">{totalSkillBadges} Skill Badges</strong> +{' '}
              <strong className="text-slate-800">{totalArcadeGames} Arcade Games</strong> ({totalParticipants} Peserta Aktif)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/80">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Poin Gabungan</p>
            <p className="text-xl font-extrabold text-blue-600">{currentTotalCombined.toLocaleString()}</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Skill Badges</p>
            <p className="text-xl font-extrabold text-emerald-600">{totalSkillBadges.toLocaleString()}</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Arcade Games</p>
            <p className="text-xl font-extrabold text-amber-600">{totalArcadeGames.toLocaleString()}</p>
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

          // Theme styling based on index (Google colors: Blue, Red, Yellow, Green)
          const themeStyles = [
            {
              border: isCompleted ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200',
              accent: 'bg-blue-600',
              badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
              progressBg: 'bg-blue-600',
              icon: 'text-blue-600',
            },
            {
              border: isCompleted ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200',
              accent: 'bg-red-500',
              badgeBg: 'bg-red-50 text-red-700 border-red-200',
              progressBg: 'bg-red-500',
              icon: 'text-red-500',
            },
            {
              border: isCompleted ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200',
              accent: 'bg-amber-500',
              badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
              progressBg: 'bg-amber-500',
              icon: 'text-amber-500',
            },
            {
              border: isCompleted ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200',
              accent: 'bg-emerald-600',
              badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
              progressBg: 'bg-emerald-600',
              icon: 'text-emerald-600',
            },
          ][index];

          return (
            <div
              key={ms.id}
              className={`bg-white rounded-2xl p-5 border transition-all duration-200 hover:shadow-md relative overflow-hidden flex flex-col justify-between ${themeStyles.border}`}
            >
              {/* Top status header */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Award className={`w-4 h-4 ${themeStyles.icon}`} />
                    {ms.title}
                  </span>

                  {isCompleted && (
                    <button
                      onClick={triggerCelebration}
                      title="Klik untuk selebrasi selebrasi"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Completed
                    </button>
                  )}

                  {isInProgress && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                      <Zap className="w-3.5 h-3.5 text-amber-600" />
                      In Progress
                    </span>
                  )}

                  {isLocked && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      Locked
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mb-1 flex items-center justify-between">
                  <span>Target {ms.targetCombined.toLocaleString()}</span>
                  <span className="text-xs text-slate-400 font-normal">Poin Gabungan</span>
                </h3>

                <p className="text-xs text-slate-500 mb-4 line-clamp-1">
                  💡 {ms.recommendedArcade} Arcade + {ms.recommendedSkill} Skill Badges
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">
                      {currentTotalCombined.toLocaleString()} / {ms.targetCombined.toLocaleString()}
                    </span>
                    <span className={`${isCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {percentage}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                          : isInProgress
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          : 'bg-slate-300'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Reward Footer */}
              <div className="pt-3 border-t border-slate-100 mt-auto flex items-start gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-600 leading-tight">
                  <strong className="text-slate-800">{ms.badgeName}:</strong> {ms.rewardDescription}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
