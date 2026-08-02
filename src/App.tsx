import React, { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, ensureDefaultProjectExists, DEFAULT_PROJECT_ID } from './db';
import { ParticipantRecord, ProjectRecord, SnapshotRecord } from './types';
import { seedSampleData } from './utils/sampleData';
import { exportParticipantsToExcel } from './utils/excelParser';

import { Navbar } from './components/Navbar';
import { MilestoneCards } from './components/MilestoneCards';
import { ParticipantTable } from './components/ParticipantTable';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { UploadModal } from './components/UploadModal';
import { AboutModal } from './components/AboutModal';
import { ProjectModal } from './components/ProjectModal';
import { ParticipantDetailModal } from './components/ParticipantDetailModal';

import {
  Sparkles,
  Layers,
  Award,
  Users,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';

export default function App() {
  const [currentProjectId, setCurrentProjectId] = useState<string>(DEFAULT_PROJECT_ID);
  const [selectedSnapshotDate, setSelectedSnapshotDate] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

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

  // Initialize DB & Seed Demo Data if empty
  const initApp = useCallback(async () => {
    setIsInitializing(true);
    await ensureDefaultProjectExists();
    await seedSampleData(false); // seed if empty

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

  // Unique first_seen_dates for filtering
  const allFirstSeenDates = Array.from(
    new Set(rawParticipants.map((p) => p.first_seen_date).filter(Boolean))
  ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  // Handle Load Sample Demo Data
  const handleLoadSampleData = async () => {
    if (confirm('Apakah Anda ingin memuat ulang Data Demo Google Arcade Facilitator 2026?')) {
      await seedSampleData(true);
      showToast('Data demo Google Arcade 2026 berhasil dimuat!');
    }
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/30 animate-pulse mb-4">
          F
        </div>
        <h2 className="text-base font-extrabold text-slate-800">Menyiapkan FasilHero DB...</h2>
        <p className="text-xs text-slate-500 mt-1">Mengagregasi data peserta & IndexedDB lokal</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased">
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
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 flex-1">
        {/* Section 1: Milestone Progress Cards */}
        <section>
          <MilestoneCards
            totalSkillBadges={totalSkillBadges}
            totalArcadeGames={totalArcadeGames}
            totalParticipants={totalParticipantsCount}
          />
        </section>

        {/* Section 2: Recharts Analytics Charts */}
        <section>
          <AnalyticsCharts snapshots={snapshots} participants={rawParticipants} />
        </section>

        {/* Section 3: Interactive Participant Table */}
        <section>
          <ParticipantTable
            participants={rawParticipants}
            allFirstSeenDates={allFirstSeenDates}
            selectedSnapshotDate={selectedSnapshotDate}
            onParticipantUpdated={() => {
              // IndexedDB automatically triggers Dexie useLiveQuery re-render
            }}
            onOpenDetail={(participant) => setSelectedParticipantForDetail(participant)}
            onExportFiltered={handleExportFiltered}
          />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium">
            <strong>FasilHero</strong> — Google Arcade Facilitator 2026 Tracking Dashboard (IndexedDB Client-Side)
          </p>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <button onClick={() => setIsAboutOpen(true)} className="hover:text-blue-600 transition-colors">
              Panduan Facilitator
            </button>
            <span>•</span>
            <button onClick={handleLoadSampleData} className="hover:text-blue-600 transition-colors">
              Reset Data Demo
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
