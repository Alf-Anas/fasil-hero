import React, { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, ensureDefaultProjectExists, DEFAULT_PROJECT_ID } from './db';
import { ParticipantRecord, ProjectRecord, SnapshotRecord } from './types';
import { seedSampleData } from './utils/sampleData';
import { exportParticipantsToExcel } from './utils/excelParser';

import { Navbar } from './components/Navbar';
import { TabNavigation, TabType } from './components/TabNavigation';
import { OverviewTab } from './components/OverviewTab';
import { MilestoneCards, FACILITATOR_MILESTONES } from './components/MilestoneCards';
import { ParticipantTable } from './components/ParticipantTable';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { WelcomeScreen } from './components/WelcomeScreen';

import { UploadModal } from './components/UploadModal';
import { AboutModal } from './components/AboutModal';
import { ProjectModal } from './components/ProjectModal';
import { ParticipantDetailModal } from './components/ParticipantDetailModal';

import { Sparkles } from 'lucide-react';

export default function App() {
  const [currentProjectId, setCurrentProjectId] = useState<string>(DEFAULT_PROJECT_ID);
  const [selectedSnapshotDate, setSelectedSnapshotDate] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isProjectsOpen, setIsProjectsOpen] = useState<boolean>(false);
  const [selectedParticipantForDetail, setSelectedParticipantForDetail] = useState<ParticipantRecord | null>(null);

  // Success Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Live Query Projects
  const projects = useLiveQuery(() => db.projects.toArray(), []) || [];

  // 2. Live Query Snapshots for current project
  const snapshots =
    useLiveQuery(
      () =>
        db.snapshots
          .where('project_id')
          .equals(currentProjectId)
          .reverse()
          .sortBy('snapshot_date'),
      [currentProjectId]
    ) || [];

  // 3. Live Query Participants for current project
  const rawParticipants =
    useLiveQuery(
      () => db.participants.where('project_id').equals(currentProjectId).toArray(),
      [currentProjectId]
    ) || [];

  // Initialize DB (ensure default project exists, DO NOT auto-seed sample data)
  const initApp = useCallback(async () => {
    setIsInitializing(true);
    await ensureDefaultProjectExists();
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    initApp();
  }, [initApp]);

  // Sync default snapshot date to latest when snapshots change or load
  useEffect(() => {
    if (snapshots.length > 0) {
      if (!selectedSnapshotDate || !snapshots.some((s) => s.snapshot_date === selectedSnapshotDate)) {
        setSelectedSnapshotDate(snapshots[0].snapshot_date);
      }
    } else {
      setSelectedSnapshotDate('');
    }
  }, [snapshots, selectedSnapshotDate]);

  const currentProject = projects.find((p) => p.id === currentProjectId) || null;

  // Active snapshot record
  const activeSnapshotRecord = snapshots.find((s) => s.snapshot_date === selectedSnapshotDate);

  // Calculate snapshot metrics based on active snapshot or fallback to raw participants
  const totalSkillBadges = activeSnapshotRecord
    ? activeSnapshotRecord.total_skill_badges
    : rawParticipants.reduce((acc, p) => acc + (p.skill_badges_count || 0), 0);

  const totalArcadeGames = activeSnapshotRecord
    ? activeSnapshotRecord.total_arcade_games
    : rawParticipants.reduce((acc, p) => acc + (p.arcade_games_count || 0), 0);

  const totalParticipantsCount = activeSnapshotRecord
    ? activeSnapshotRecord.total_participants
    : rawParticipants.length;

  const combinedPoints = totalSkillBadges + totalArcadeGames;
  const currentTierObj =
    [...FACILITATOR_MILESTONES].reverse().find((m) => combinedPoints >= m.targetCombined) ||
    FACILITATOR_MILESTONES[0];

  // Unique first_seen_dates for filtering
  const allFirstSeenDates = Array.from(
    new Set(rawParticipants.map((p) => p.first_seen_date).filter(Boolean))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Handle Load Sample Demo Data
  const handleLoadSampleData = async () => {
    await seedSampleData(true);
    showToast('Data demo Google Arcade 2026 berhasil dimuat!');
  };

  // Handle Export Filtered / All
  const handleExportFiltered = (filtered: ParticipantRecord[]) => {
    exportParticipantsToExcel(
      filtered,
      `FasilHero_${currentProject?.name || 'Arcade'}_${selectedSnapshotDate || 'Master'}.xlsx`
    );
    showToast(`Data ${filtered.length} peserta berhasil diexport ke Excel!`);
  };

  const handleExportAll = () => {
    exportParticipantsToExcel(
      rawParticipants,
      `FasilHero_MasterData_${currentProject?.name || 'Arcade'}.xlsx`
    );
    showToast(`Master data (${rawParticipants.length} peserta) berhasil diexport!`);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/30 animate-pulse mb-4">
          F
        </div>
        <h2 className="text-base font-extrabold text-slate-100">Menyiapkan FasilHero DB...</h2>
        <p className="text-xs text-slate-400 mt-1">Mengagregasi data peserta & IndexedDB lokal</p>
      </div>
    );
  }

  const isDataEmpty = snapshots.length === 0 && rawParticipants.length === 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce border border-slate-700">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentProject={currentProject}
        projects={projects}
        snapshots={snapshots}
        selectedSnapshotDate={selectedSnapshotDate}
        onSelectProject={(id) => setCurrentProjectId(id)}
        onSelectSnapshotDate={(date) => setSelectedSnapshotDate(date)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenProjectsModal={() => setIsProjectsOpen(true)}
        onExportAll={handleExportAll}
        onLoadSampleData={handleLoadSampleData}
        showToast={showToast}
      />

      {/* Tab Navigation (Displayed when data exists) */}
      {!isDataEmpty && (
        <TabNavigation
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          participantCount={rawParticipants.length}
          currentTierName={currentTierObj.title}
          snapshotCount={snapshots.length}
        />
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 flex-1">
        {isDataEmpty ? (
          /* Empty State Welcome Screen when project has no data */
          <WelcomeScreen
            currentProject={currentProject}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenProjectsModal={() => setIsProjectsOpen(true)}
            onLoadSampleData={handleLoadSampleData}
            onSelectProject={(id) => setCurrentProjectId(id)}
            showToast={showToast}
          />
        ) : (
          /* Tab Contents */
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <OverviewTab
                participants={rawParticipants}
                snapshots={snapshots}
                selectedSnapshotDate={selectedSnapshotDate}
                totalSkillBadges={totalSkillBadges}
                totalArcadeGames={totalArcadeGames}
                totalParticipants={totalParticipantsCount}
                onOpenUpload={() => setIsUploadOpen(true)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenDetail={(participant) => setSelectedParticipantForDetail(participant)}
              />
            )}

            {activeTab === 'participants' && (
              <ParticipantTable
                participants={rawParticipants}
                allFirstSeenDates={allFirstSeenDates}
                selectedSnapshotDate={selectedSnapshotDate}
                onParticipantUpdated={() => {
                  // IndexedDB live query automatically updates
                }}
                onOpenDetail={(participant) => setSelectedParticipantForDetail(participant)}
                onExportFiltered={handleExportFiltered}
              />
            )}

            {activeTab === 'milestones' && (
              <MilestoneCards
                totalSkillBadges={totalSkillBadges}
                totalArcadeGames={totalArcadeGames}
                totalParticipants={totalParticipantsCount}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsCharts snapshots={snapshots} participants={rawParticipants} />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-slate-300">
            © 2026 | <a href="https://geoit.dev/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-bold underline underline-offset-2 transition-colors">GeoIT Developer</a>
          </p>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <button onClick={() => setIsAboutOpen(true)} className="hover:text-blue-400 transition-colors cursor-pointer">
              Panduan Facilitator
            </button>
            <span>•</span>
            <button onClick={handleLoadSampleData} className="hover:text-blue-400 transition-colors cursor-pointer">
              Muat Data Demo
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        projectId={currentProjectId}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={(snapshotDate, summary) => {
          setSelectedSnapshotDate(snapshotDate);
          setActiveTab('overview');
          showToast(
            `Snapshot ${snapshotDate} berhasil diupload! (${summary.newParticipantsCount} Peserta Baru)`
          );
        }}
      />

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      <ProjectModal
        isOpen={isProjectsOpen}
        projects={projects}
        currentProjectId={currentProjectId}
        onClose={() => setIsProjectsOpen(false)}
        onSelectProject={(id) => setCurrentProjectId(id)}
        onProjectCreated={() => showToast('Project baru berhasil dibuat!')}
        onProjectDeleted={() => showToast('Project berhasil dihapus.')}
      />

      <ParticipantDetailModal
        participant={selectedParticipantForDetail}
        onClose={() => setSelectedParticipantForDetail(null)}
        onUpdated={() => showToast('Catatan peserta berhasil diperbarui!')}
      />
    </div>
  );
}
