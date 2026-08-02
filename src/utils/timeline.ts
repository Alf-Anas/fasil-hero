/**
 * Utility functions for tracking program timeline (13 Juli 2026 - 14 September 2026)
 */

export interface ProgramTimelineStatus {
  startDate: Date;
  endDate: Date;
  currentDate: Date;
  totalDays: number;
  elapsedDays: number;
  remainingDays: number;
  currentWeek: number;
  totalWeeks: number;
  progressPercentage: number;
  statusText: string;
  isStarted: boolean;
  isEnded: boolean;
}

export function getProgramTimelineStatus(): ProgramTimelineStatus {
  // Fixed Schedule: 13 Juli 2026 - 14 September 2026
  const startDate = new Date('2026-07-13T00:00:00');
  const endDate = new Date('2026-09-14T23:59:59');
  
  // Current date
  const currentDate = new Date();

  const msPerDay = 1000 * 60 * 60 * 24;
  
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay);
  const totalWeeks = Math.ceil(totalDays / 7);

  const isStarted = currentDate >= startDate;
  const isEnded = currentDate > endDate;

  let elapsedDays = 0;
  if (isStarted) {
    if (isEnded) {
      elapsedDays = totalDays;
    } else {
      elapsedDays = Math.floor((currentDate.getTime() - startDate.getTime()) / msPerDay) + 1;
    }
  }

  const remainingDays = Math.max(0, totalDays - elapsedDays);
  const currentWeek = Math.min(totalWeeks, Math.max(1, Math.ceil(elapsedDays / 7)));
  const progressPercentage = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));

  let statusText = 'Program Berjalan';
  if (!isStarted) {
    statusText = 'Belum Dimulai';
  } else if (isEnded) {
    statusText = 'Program Selesai';
  } else {
    statusText = `Hari ke-${elapsedDays} • Minggu ke-${currentWeek}`;
  }

  return {
    startDate,
    endDate,
    currentDate,
    totalDays,
    elapsedDays,
    remainingDays,
    currentWeek,
    totalWeeks,
    progressPercentage,
    statusText,
    isStarted,
    isEnded,
  };
}
