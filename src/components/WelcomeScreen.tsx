import React from 'react';
import {
  Upload,
  FileJson,
  Sparkles,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { importProjectFromJson } from '../utils/projectBackup';
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
    <div className="max-w-4xl mx-auto my-6 sm:my-10 p-6 sm:p-10 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-8 animate-fadeIn relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#fbbc04]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="text-center space-y-3 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fbbc04]/10 border border-[#fbbc04]/20 text-[#fbbc04] text-xs font-extrabold tracking-wide uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Google Arcade Facilitator 2026
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Selamat Datang di <span className="text-[#fbbc04]">FasilHero</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Project <strong className="text-white">"{currentProject?.name || 'Utama'}"</strong> saat ini belum memiliki data snapshot laporan. Silakan pilih metode untuk mulai mengelola data Facilitator Anda:
        </p>
      </div>

      {/* 3 Main Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
        {/* Card 1: Upload CSV/XLSX */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-[#fbbc04]/50 transition-all flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#fbbc04]/10 border border-[#fbbc04]/20 text-[#fbbc04] flex items-center justify-center group-hover:bg-[#fbbc04] group-hover:text-slate-950 transition-colors">
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
            className="w-full py-2.5 px-4 rounded-xl bg-[#fbbc04] text-slate-950 font-black text-xs hover:bg-amber-400 shadow-md shadow-[#fbbc04]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4 stroke-[2.5]" />
            Upload File Laporan
          </button>
        </div>

        {/* Card 2: Import Backup JSON */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
              <FileJson className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">2. Import Backup JSON</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Pulihkan data snapshot & peserta dari file ekspor backup JSON yang pernah dibuat sebelumnya.
              </p>
            </div>
          </div>

          <button
            onClick={handleImportJson}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileJson className="w-4 h-4 text-emerald-400" />
            Import File Backup
          </button>
        </div>

        {/* Card 3: Load Demo Sample Data */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4 group">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">3. Muat Contoh Data Demo</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Uji coba fitur aplikasi langsung dengan 12 data peserta simulasi & 3 snapshot historis.
              </p>
            </div>
          </div>

          <button
            onClick={onLoadSampleData}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold text-xs hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Muat Data Demo
          </button>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Analisis Poin Gabungan & Tier Swag otomatis</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#fbbc04] shrink-0" />
          <span>100% Offline-first & Data Tersimpan Lokal</span>
        </div>
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>Mendukung Multiple Project / Batch</span>
        </div>
      </div>
    </div>
  );
};
