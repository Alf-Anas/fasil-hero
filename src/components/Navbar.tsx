import React, { useState } from 'react';
import {
  Upload,
  Download,
  Info,
  Calendar,
  Sparkles,
  Plus,
  FolderKanban,
  FileJson,
  Menu,
  X,
} from 'lucide-react';
import { ProjectRecord, SnapshotRecord } from '../types';
import { exportProjectToJson, importProjectFromJson } from '../utils/projectBackup';

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
  showToast: (msg: string) => void;
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
  showToast,
}) => {
  const [logoError, setLogoError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleExportBackup = async () => {
    if (!currentProject) return;
    try {
      await exportProjectToJson(currentProject.id);
      showToast(`Backup JSON project "${currentProject.name}" berhasil di-download!`);
    } catch (err: any) {
      alert(`Gagal export backup: ${err.message}`);
    }
  };

  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const content = evt.target?.result as string;
          const result = await importProjectFromJson(content);
          onSelectProject(result.projectId);
          showToast(
            `Project "${result.projectName}" berhasil di-import! (${result.participantCount} peserta, ${result.snapshotCount} snapshot)`
          );
        } catch (err: any) {
          alert(`Gagal import backup: ${err.message}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800 p-1 border border-slate-700/80 shadow-inner flex items-center justify-center shrink-0 overflow-hidden relative">
              {!logoError ? (
                <img
                  src="/logo.png"
                  alt="FasilHero Logo"
                  className="w-full h-full object-contain"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-emerald-500 rounded-lg flex items-center justify-center text-white font-black text-lg">
                  F
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight leading-none">
                  FasilHero
                </h1>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs">
                  2026
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium line-clamp-1">
                Google Arcade Facilitator Tracking
              </p>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Project Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
              <FolderKanban className="w-4 h-4 text-slate-400 ml-1.5 shrink-0" />
              <select
                value={currentProject?.id || ''}
                onChange={(e) => onSelectProject(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none pr-1 cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                    {p.name}
                  </option>
                ))}
              </select>
              <button
                onClick={onOpenProjectsModal}
                title="Kelola Project Facilitator"
                className="p-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-blue-400 hover:bg-slate-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Snapshot Selector */}
            {snapshots.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <Calendar className="w-4 h-4 text-blue-400 ml-1.5 shrink-0" />
                <span className="text-[11px] text-slate-400 font-medium">Snapshot:</span>
                <select
                  value={selectedSnapshotDate}
                  onChange={(e) => onSelectSnapshotDate(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none pr-1 cursor-pointer"
                >
                  {snapshots.map((s) => (
                    <option key={s.snapshot_date} value={s.snapshot_date} className="bg-slate-900 text-slate-100">
                      {s.snapshot_date} ({s.total_participants} Peserta)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Export / Import Backup JSON */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleExportBackup}
                title="Export Backup Database Project ke File JSON"
                className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5 text-blue-400" />
                <span>Export JSON</span>
              </button>
              <button
                onClick={handleImportBackup}
                title="Import Project dari File Backup JSON"
                className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                <span>Import JSON</span>
              </button>
            </div>

            {/* Demo Data */}
            <button
              onClick={onLoadSampleData}
              title="Muat Data Demo Google Arcade"
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-bold rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Demo</span>
            </button>

            {/* Upload Snapshot Button */}
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold rounded-xl bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all cursor-pointer shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Snapshot</span>
            </button>

            {/* Export Excel */}
            <button
              onClick={onExportAll}
              title="Export Master Data Peserta ke Excel"
              className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* About Modal */}
            <button
              onClick={onOpenAbout}
              className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors"
              title="Panduan Facilitator"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Action Bar Controls & Toggle */}
          <div className="flex lg:hidden items-center gap-1.5">
            <button
              onClick={onOpenUpload}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-500"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="text-[11px]">Upload</span>
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-300 bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-slate-800 space-y-3 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Project Select */}
              <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400">Project:</span>
                </div>
                <select
                  value={currentProject?.id || ''}
                  onChange={(e) => onSelectProject(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none max-w-[140px]"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-slate-100">
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Snapshot Select */}
              {snapshots.length > 0 && (
                <div className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-slate-400">Snapshot:</span>
                  </div>
                  <select
                    value={selectedSnapshotDate}
                    onChange={(e) => onSelectSnapshotDate(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none max-w-[140px]"
                  >
                    {snapshots.map((s) => (
                      <option key={s.snapshot_date} value={s.snapshot_date} className="bg-slate-900 text-slate-100">
                        {s.snapshot_date}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Quick Mobile Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => {
                  handleExportBackup();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2 bg-slate-800 rounded-xl border border-slate-700 text-slate-200 font-medium"
              >
                <FileJson className="w-3.5 h-3.5 text-blue-400" />
                Export JSON
              </button>
              <button
                onClick={() => {
                  handleImportBackup();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2 bg-slate-800 rounded-xl border border-slate-700 text-slate-200 font-medium"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-400" />
                Import JSON
              </button>
              <button
                onClick={() => {
                  onExportAll();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2 bg-slate-800 rounded-xl border border-slate-700 text-slate-200 font-medium"
              >
                <Download className="w-3.5 h-3.5 text-indigo-400" />
                Excel
              </button>
              <button
                onClick={() => {
                  onOpenAbout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-1.5 p-2 bg-slate-800 rounded-xl border border-slate-700 text-slate-200 font-medium"
              >
                <Info className="w-3.5 h-3.5 text-amber-400" />
                Panduan
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
