import React from 'react';
import {
  Upload,
  Download,
  Info,
  Layers,
  Calendar,
  Sparkles,
  Database,
  Plus,
  RefreshCw,
  FolderKanban,
} from 'lucide-react';
import { ProjectRecord, SnapshotRecord } from '../types';

interface NavbarProps {
  currentProject: ProjectRecord | null;
  projects: ProjectRecord[];
  snapshots: SnapshotRecord[];
  selectedSnapshotDate: string;
  onSelectProject: (projectId: string) => void;
  onSelectSnapshotDate: (date: string) => void;
  onOpenUpload: () => void;
  onOpenAbout: () => void;
  onOpenProjectsModal: () => void;
  onExportAll: () => void;
  onLoadSampleData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  projects,
  snapshots,
  selectedSnapshotDate,
  onSelectProject,
  onSelectSnapshotDate,
  onOpenUpload,
  onOpenAbout,
  onOpenProjectsModal,
  onExportAll,
  onLoadSampleData,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Logo Brand */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-md shadow-blue-500/20 shrink-0 flex items-center justify-center text-white font-black text-xl tracking-tighter">
                F
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-slate-900 tracking-tight">FasilHero</h1>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
                    Arcade 2026
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Google Arcade Facilitator Tracking Dashboard
                </p>
              </div>
            </div>

            {/* Mobile About Button */}
            <button
              onClick={onOpenAbout}
              className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
            >
              <Info className="w-5 h-5" />
            </button>
          </div>

          {/* Controls & Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2.5">
            {/* Project Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
              <FolderKanban className="w-4 h-4 text-slate-500 ml-1.5 shrink-0" />
              <select
                value={currentProject?.id || ''}
                onChange={(e) => onSelectProject(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none pr-1 cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                onClick={onOpenProjectsModal}
                title="Kelola Project Facilitator"
                className="p-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Snapshot Date Selector */}
            {snapshots.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                <Calendar className="w-4 h-4 text-blue-600 ml-1.5 shrink-0" />
                <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Snapshot:</span>
                <select
                  value={selectedSnapshotDate}
                  onChange={(e) => onSelectSnapshotDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none pr-1 cursor-pointer"
                >
                  {snapshots.map((s) => (
                    <option key={s.snapshot_date} value={s.snapshot_date}>
                      {s.snapshot_date} ({s.total_participants} Peserta)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Load Sample Demo Data */}
            <button
              onClick={onLoadSampleData}
              title="Isi dengan data sampel demo Google Arcade"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Data Demo</span>
            </button>

            {/* Upload Button */}
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Snapshot</span>
            </button>

            {/* Export All Button */}
            <button
              onClick={onExportAll}
              title="Export Semua Data Peserta ke Excel"
              className="p-2 text-slate-600 hover:text-slate-900 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* About Modal Trigger */}
            <button
              onClick={onOpenAbout}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-slate-500" />
              Panduan Program
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
