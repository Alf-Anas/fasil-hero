import React, { useState, useEffect } from 'react';
import {
  Settings,
  Edit3,
  Upload,
  FileJson,
  Download,
  Trash2,
  Check,
  ShieldAlert,
  Calendar,
  Users,
  FileSpreadsheet,
} from 'lucide-react';
import { ProjectRecord } from '../types';
import { db } from '../db';
import { exportProjectToJson, importProjectFromJson } from '../utils/projectBackup';

interface ProjectSettingsTabProps {
  currentProject: ProjectRecord;
  participantCount: number;
  snapshotCount: number;
  onOpenUploadModal: () => void;
  onExportMasterExcel: () => void;
  onOpenDeleteModal: (project: ProjectRecord) => void;
  onProjectUpdated: () => void;
  showToast: (msg: string) => void;
}

export const ProjectSettingsTab: React.FC<ProjectSettingsTabProps> = ({
  currentProject,
  participantCount,
  snapshotCount,
  onOpenUploadModal,
  onExportMasterExcel,
  onOpenDeleteModal,
  onProjectUpdated,
  showToast,
}) => {
  const [name, setName] = useState(currentProject.name);
  const [description, setDescription] = useState(currentProject.description || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(currentProject.name);
    setDescription(currentProject.description || '');
  }, [currentProject]);

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await db.projects.update(currentProject.id, {
        name: name.trim(),
        description: description.trim(),
      });
      showToast(`Nama project berhasil diperbarui menjadi "${name.trim()}"`);
      onProjectUpdated();
    } catch (err: any) {
      alert('Gagal memperbarui project: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJson = async () => {
    try {
      await exportProjectToJson(currentProject.id);
      showToast(`Backup JSON project "${currentProject.name}" berhasil di-download!`);
    } catch (err: any) {
      alert('Gagal export backup: ' + err.message);
    }
  };

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
          showToast(
            `Project "${result.projectName}" berhasil di-import! (${result.participantCount} peserta, ${result.snapshotCount} snapshot)`
          );
          onProjectUpdated();
        } catch (err: any) {
          alert(`Gagal import backup: ${err.message}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-2">
      {/* Header Info Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 shrink-0">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">{currentProject.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Kelola informasi project, unggah data snapshot, ekspor laporan, dan cadangkan data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs w-full sm:w-auto shrink-0">
          <div className="px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-center flex-1 sm:flex-none">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Peserta</span>
            <span className="font-extrabold text-white text-sm">{participantCount}</span>
          </div>
          <div className="px-3 py-2 bg-slate-950 rounded-xl border border-slate-800 text-center flex-1 sm:flex-none">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Total Snapshot</span>
            <span className="font-extrabold text-white text-sm">{snapshotCount}</span>
          </div>
        </div>
      </div>

      {/* Section 1: Edit Project Details */}
      <form onSubmit={handleSaveRename} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Edit3 className="w-4 h-4 text-[#fbbc04]" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
            Ubah Nama & Deskripsi Project
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Nama Project / Batch <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Facilitator Arcade 2026 - Batch 1"
              className="w-full p-3 text-xs bg-slate-950 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#fbbc04] font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Deskripsi Catatan (Opsional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan tambahan grup atau wilayah"
              className="w-full p-3 text-xs bg-slate-950 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#fbbc04]"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving || !name.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#fbbc04] text-slate-950 font-black text-xs hover:bg-amber-400 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-[#fbbc04]/20"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>
      </form>

      {/* Section 2: Data Actions Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
          Aksi Data & Ekspor/Impor
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upload Snapshot */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-[#fbbc04]/10 text-[#fbbc04] border border-[#fbbc04]/20 shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Upload Snapshot Baru</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Proses file Excel/CSV rekap harian dari Google Arcade untuk memperbarui progres peserta.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenUploadModal}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-[#fbbc04] text-slate-950 font-black text-xs hover:bg-amber-400 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah File Snapshot</span>
            </button>
          </div>

          {/* Export Excel Master */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Export Master Excel (.xlsx)</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Unduh seluruh daftar peserta beserta lencana, game, dan status verifikasi dalam format spreadsheet.
                </p>
              </div>
            </div>
            <button
              onClick={onExportMasterExcel}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Excel Master</span>
            </button>
          </div>

          {/* Export Backup JSON */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                <FileJson className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Export Backup JSON</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cadangkan seluruh data project ini ke dalam 1 file JSON ringkas.
                </p>
              </div>
            </div>
            <button
              onClick={handleExportJson}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Backup JSON</span>
            </button>
          </div>

          {/* Import Backup JSON */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Import Backup JSON</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pulihkan data project dari file cadangan JSON yang telah disimpan sebelumnya.
                </p>
              </div>
            </div>
            <button
              onClick={handleImportJson}
              className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Unggah Backup JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Danger Zone */}
      <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-rose-500/20 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-400">
              Zona Bahaya
            </h3>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h4 className="text-sm font-extrabold text-white">Hapus Project Permanen</h4>
            <p className="text-xs text-slate-400">
              Menghapus seluruh peserta ({participantCount}) dan riwayat snapshot ({snapshotCount}) dari database IndexedDB browser.
            </p>
          </div>

          <button
            onClick={() => onOpenDeleteModal(currentProject)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all cursor-pointer shadow-md shadow-rose-600/20 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Hapus Project Ini</span>
          </button>
        </div>
      </div>
    </div>
  );
};
