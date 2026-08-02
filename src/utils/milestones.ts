export interface ParticipantMilestoneConfig {
  id: string;
  name: string;
  requiredArcade: number;
  requiredSkill: number;
  badgeEmoji: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  badgeClass: string;
}

export const PARTICIPANT_MILESTONES_CONFIG: ParticipantMilestoneConfig[] = [
  {
    id: 'm1',
    name: 'Milestone 1',
    requiredArcade: 6,
    requiredSkill: 14,
    badgeEmoji: '🥉',
    color: '#10B981', // Emerald
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/30',
    badgeClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 'm2',
    name: 'Milestone 2',
    requiredArcade: 8,
    requiredSkill: 28,
    badgeEmoji: '🥈',
    color: '#3B82F6', // Blue
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/30',
    badgeClass: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  {
    id: 'm3',
    name: 'Milestone 3',
    requiredArcade: 10,
    requiredSkill: 42,
    badgeEmoji: '🥇',
    color: '#F59E0B', // Amber
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    badgeClass: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  {
    id: 'ultimate',
    name: 'Ultimate Milestone',
    requiredArcade: 12,
    requiredSkill: 56,
    badgeEmoji: '🏆',
    color: '#8B5CF6', // Purple
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/30',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
];

/**
 * Calculates the highest milestone name reached based on arcade games and skill badges counts
 */
export function calculateHighestMilestone(arcadeCount: number = 0, skillCount: number = 0): string {
  if (arcadeCount >= 12 && skillCount >= 56) return 'Ultimate Milestone';
  if (arcadeCount >= 10 && skillCount >= 42) return 'Milestone 3';
  if (arcadeCount >= 8 && skillCount >= 28) return 'Milestone 2';
  if (arcadeCount >= 6 && skillCount >= 14) return 'Milestone 1';
  return 'Belum Milestone';
}

/**
 * Calculates progress percentages for a specific milestone tier
 */
export function getMilestoneTierProgress(
  arcadeCount: number = 0,
  skillCount: number = 0,
  requiredArcade: number,
  requiredSkill: number
) {
  const arcadeProgress = Math.min(100, Math.round((arcadeCount / requiredArcade) * 100));
  const skillProgress = Math.min(100, Math.round((skillCount / requiredSkill) * 100));
  const isAchieved = arcadeCount >= requiredArcade && skillCount >= requiredSkill;

  return {
    arcadeProgress,
    skillProgress,
    isAchieved,
    arcadeNeeded: Math.max(0, requiredArcade - arcadeCount),
    skillNeeded: Math.max(0, requiredSkill - skillCount),
  };
}
