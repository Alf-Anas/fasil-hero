import React, { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { ParticipantRecord, ProjectRecord, SnapshotRecord } from './types';
import { seedSampleData } from './utils/sampleData';
import { exportParticipantsToExcel } from './utils/excelParser';
import { exportProjectToJson } from './utils/projectBackup';

import { Navbar } from './components/Navbar';
import { TabNavigation, TabType } from './components/TabNavigation';
import { OverviewTab } from './components/OverviewTab';
import { MilestoneCards, FACILITATOR_MILESTONES } from './components/MilestoneCards';
import { ParticipantTable } from './components/ParticipantTable';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { ProjectSettingsTab } from './components/ProjectSettingsTab';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ProjectListScreen } from './components/ProjectListScreen';

import { UploadModal } from './components/UploadModal';
import { AboutModal } from './components/AboutModal';
import { HelpModal } from './components/HelpModal';
import { ParticipantDetailModal } from './components/ParticipantDetailModal';
import { ProjectSettingsModal } from './components/ProjectSettingsModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { DeleteProjectModal } from './components/DeleteProjectModal';

import { Sparkles } from 'lucide-react';

export default function App() {
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [selectedSnapshotDate, setSelectedSnapshotDate] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Set default view to Project List Screen on launch
  const [isProjectViewActive, setIsProjectViewActive] = useState<boolean>(true);

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isAboutOpen, setIsAboutOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState<boolean>(false);
  const [isProjectSettingsOpen, setIsProjectSettingsOpen] = useState<boolean>(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectRecord | null>(null);

  const [selectedParticipantForDetail, setSelectedParticipantForDetail] = useState<ParticipantRecord | null>(null);
  const [hideSensitive, setHideSensitive] = useState<boolean>(false);

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

  // Automatically select the first available project if currentProjectId is empty
  useEffect(() => {
    if (projects.length > 0 && !currentProjectId) {
      setCurrentProjectId(projects[0].id);
    }
  }, [projects, currentProjectId]);

  // 2. Live Query Snapshots for current project
  const snapshots =
    useLiveQuery(
      () =>
        currentProjectId
          ? db.snapshots
              .where('project_id')
              .equals(currentProjectId)
              .reverse()
              .sortBy('snapshot_date')
          : Promise.resolve([]),
      [currentProjectId]
    ) || [];

  // 3. Live Query Participants for current project
  const rawParticipants =
    useLiveQuery(
      () => (currentProjectId ? db.participants.where('project_id').equals(currentProjectId).toArray() : Promise.resolve([])),
      [currentProjectId]
    ) || [];

  // Initialize DB (NO auto-creation of default project)
  const initApp = useCallback(async () => {
    setIsInitializing(true);
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

  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete) return;
    const targetId = projectToDelete.id;
    const targetName = projectToDelete.name;

    await db.projects.delete(targetId);
    await db.snapshots.where('project_id').equals(targetId).delete();
    await db.participants.where('project_id').equals(targetId).delete();

    showToast(`Project "${targetName}" berhasil dihapus.`);
    setProjectToDelete(null);

    const remaining = projects.filter((p) => p.id !== targetId);
    if (remaining.length === 0) {
      setCurrentProjectId('');
      setIsProjectViewActive(true);
    } else if (currentProjectId === targetId) {
      setCurrentProjectId(remaining[0].id);
      setIsProjectViewActive(true);
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#fbbc04] to-amber-600 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-[#fbbc04]/30 animate-pulse mb-4">
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
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce border border-[#fbbc04]/40">
          <Sparkles className="w-4 h-4 text-[#fbbc04]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        currentProject={currentProject}
        snapshots={snapshots}
        selectedSnapshotDate={selectedSnapshotDate}
        isProjectViewActive={isProjectViewActive}
        onGoToProjectList={() => setIsProjectViewActive(true)}
        onSelectSnapshotDate={(date) => setSelectedSnapshotDate(date)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Tab Navigation (Displayed when in project detail view) */}
      {!isProjectViewActive && currentProject && (
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
        {isProjectViewActive || !currentProject ? (
          /* Project List Screen View */
          <ProjectListScreen
            projects={projects}
            currentProjectId={currentProjectId}
            onSelectProject={(id) => {
              setCurrentProjectId(id);
              setIsProjectViewActive(false);
            }}
            onProjectCreated={(newId) => {
              setCurrentProjectId(newId);
              setIsProjectViewActive(false);
            }}
            onProjectDeleted={() => {
              // IndexedDB live query automatically updates
            }}
            showToast={showToast}
          />
        ) : activeTab === 'settings' ? (
          /* Settings Tab */
          <ProjectSettingsTab
            currentProject={currentProject}
            participantCount={rawParticipants.length}
            snapshotCount={snapshots.length}
            snapshots={snapshots}
            onOpenUploadModal={() => setIsUploadOpen(true)}
            onExportMasterExcel={handleExportAll}
            onOpenDeleteModal={(p) => setProjectToDelete(p)}
            onProjectUpdated={() => {
              // Live query handles refresh
            }}
            showToast={showToast}
          />
        ) : isDataEmpty ? (
          /* Empty State Welcome Screen when active project has no data */
          <WelcomeScreen
            currentProject={currentProject}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenProjectsModal={() => setIsProjectViewActive(true)}
            onLoadSampleData={async () => {
              await seedSampleData(true, currentProjectId);
              showToast('Data demo Google Arcade 2026 berhasil dimuat!');
            }}
            onSelectProject={(id) => setCurrentProjectId(id)}
            showToast={showToast}
          />
        ) : (
          /* Dashboard Tabs */
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
                onOpenHelp={() => setIsHelpOpen(true)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenDetail={(participant) => setSelectedParticipantForDetail(participant)}
              />
            )}

            {activeTab === 'participants' && (
              <ParticipantTable
                participants={rawParticipants}
                snapshots={snapshots}
                allFirstSeenDates={allFirstSeenDates}
                selectedSnapshotDate={selectedSnapshotDate}
                hideSensitive={hideSensitive}
                onToggleHideSensitive={() => setHideSensitive((prev) => !prev)}
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

      {/* Clean Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 mt-12 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-slate-300">
            © 2026 |{' '}
            <a
              href="https://geoit.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#fbbc04] hover:underline font-bold underline-offset-2 transition-colors"
            >
              GeoIT Developer
            </a>
          </p>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <button
              onClick={() => setIsHelpOpen(true)}
              className="hover:text-[#fbbc04] transition-colors cursor-pointer"
            >
              Bantuan Kendala
            </button>
            <span>•</span>
            <button
              onClick={() => setIsProjectViewActive(true)}
              className="hover:text-[#fbbc04] transition-colors cursor-pointer"
            >
              Kelola Project
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
          setIsProjectViewActive(false);
          showToast(
            `Snapshot ${snapshotDate} berhasil diupload! (${summary.newParticipantsCount} Peserta Baru)`
          );
        }}
      />

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <ParticipantDetailModal
        participant={selectedParticipantForDetail}
        onClose={() => setSelectedParticipantForDetail(null)}
        onUpdated={() => showToast('Catatan peserta berhasil diperbarui!')}
        hideSensitive={hideSensitive}
      />

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onProjectCreated={(newId) => {
          setCurrentProjectId(newId);
          setIsProjectViewActive(false);
        }}
        showToast={showToast}
      />

      <ProjectSettingsModal
        isOpen={isProjectSettingsOpen}
        currentProject={currentProject}
        onClose={() => setIsProjectSettingsOpen(false)}
        onOpenUpload={() => setIsUploadOpen(true)}
        onExportAllExcel={handleExportAll}
        onOpenDeleteModal={(p) => setProjectToDelete(p)}
        onSelectProject={(id) => setCurrentProjectId(id)}
        showToast={showToast}
      />

      <DeleteProjectModal
        isOpen={!!projectToDelete}
        project={projectToDelete}
        participantCount={rawParticipants.length}
        snapshotCount={snapshots.length}
        isLastProject={projects.length <= 1}
        onClose={() => setProjectToDelete(null)}
        onConfirmDelete={handleConfirmDeleteProject}
        onDownloadBackup={async () => {
          if (projectToDelete) {
            await exportProjectToJson(projectToDelete.id);
            showToast(`Backup JSON "${projectToDelete.name}" berhasil di-download!`);
          }
        }}
      />
    </div>
  );
}
