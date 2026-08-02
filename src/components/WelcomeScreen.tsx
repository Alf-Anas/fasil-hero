import React from 'react';
import {
  Upload,
  FileJson,
  Sparkles,
  Plus,
  FolderKanban,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { exportProjectToJson, importProjectFromJson } from '../utils/projectBackup';
import { ProjectRecord } from '../types';

interface WelcomeScreenProps {
  currentProject: ProjectRecord | null;
  onOpenUpload: () => void;
  onOpenProjectsModal: () => void;
  onLoadSampleData: () => void;
  onSelectProject: (projectId: string) => void;
  showToast: (msg: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  currentProject,
  onOpenUpload,
  onOpenProjectsModal,
  onLoadSampleData,
  onSelectProject,
  showToast,
}) => {
  const handleImportJson = () => {
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
    <div className="max-w-4xl mx-auto my-6 sm:my-10 p-6 sm:p-10 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-extrabold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Google Arcade Facilitator 2026
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Selamat Datang di <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">FasilHero</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Project <strong className="text-slate-200">"{currentProject?.name || 'Utama'}"</strong> saat ini belum memiliki data snapshot laporan. Silakan pilih metode untuk mulai mengelola data Facilitator Anda:
        </p>
      </div>

      {/* 3 Main Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Upload CSV/XLSX */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">1. Upload File Excel/CSV</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Unggah file laporan harian Google Arcade (.xlsx/.csv) untuk diproses & dianalisis secara otomatis.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenUpload}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white font-extrabold text-xs hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Upload File Laporan
          </button>
        </div>

        {/* Card 2: Import Backup JSON */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <FileJson className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">2. Import Project JSON</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Pulihkan project beserta seluruh snapshot & data pesertanya dari file backup JSON FasilHero.
              </p>
            </div>
          </div>

          <button
            onClick={handleImportJson}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 border border-slate-700 text-emerald-400 font-extrabold text-xs hover:bg-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileJson className="w-4 h-4 text-emerald-400" />
            Pilih File Backup JSON
          </button>
        </div>

        {/* Card 3: Load Demo Sample Data */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">3. Muat Data Demo</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Coba seluruh fitur FasilHero sekarang juga dengan 12 data peserta demo & 3 snapshot harian.
              </p>
            </div>
          </div>

          <button
            onClick={onLoadSampleData}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-extrabold text-xs hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Muat Contoh Data Demo
          </button>
        </div>
      </div>

      {/* Bottom Option: Manage / Create New Project */}
      <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
            <FolderKanban className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="font-bold text-slate-200">Ingin Membuat Project Baru / Batch Terpisah?</p>
            <p className="text-[11px] text-slate-400">
              Buat project terpisah untuk wilayah, kampus, atau musim Google Arcade berikutnya.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenProjectsModal}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-blue-400" />
          Kelola / Buat Project
        </button>
      </div>

      {/* Privacy Guarantee Note */}
      <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>Penyimpanan 100% Aman & Lokal di Browser (IndexedDB Dexie). Tanpa Server Luar.</span>
      </div>
    </div>
  );
};
