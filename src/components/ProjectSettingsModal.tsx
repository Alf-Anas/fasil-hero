import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  Edit3,
  Upload,
  FileJson,
  Download,
  Trash2,
  Check,
  FolderKanban,
  FileSpreadsheet,
} from 'lucide-react';
import { ProjectRecord } from '../types';
import { db } from '../db';
import { exportProjectToJson, importProjectFromJson } from '../utils/projectBackup';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  currentProject: ProjectRecord | null;
  onClose: () => void;
  onOpenUpload: () => void;
  onExportAllExcel: () => void;
  onOpenDeleteModal: (project: ProjectRecord) => void;
  onSelectProject: (projectId: string) => void;
  showToast: (msg: string) => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  currentProject,
  onClose,
  onOpenUpload,
  onExportAllExcel,
  onOpenDeleteModal,
  onSelectProject,
  showToast,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentProject) {
      setName(currentProject.name);
      setDescription(currentProject.description || '');
    }
  }, [currentProject]);

  if (!isOpen || !currentProject) return null;

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
          onSelectProject(result.projectId);
          showToast(
            `Project "${result.projectName}" berhasil di-import! (${result.participantCount} peserta, ${result.snapshotCount} snapshot)`
          );
          onClose();
        } catch (err: any) {
          alert(`Gagal import backup: ${err.message}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-800 relative my-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#fbbc04]/10 text-[#fbbc04] rounded-2xl border border-[#fbbc04]/20 shrink-0">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Pengaturan Project</h2>
              <p className="text-xs text-slate-400">
                Kelola nama, snapshot, ekspor JSON, dan pengaturan project aktif
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Rename Project */}
        <form onSubmit={handleSaveRename} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-[#fbbc04]" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
              Ubah Nama & Deskripsi
            </h3>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Nama Project</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Batch 1 - Jawa Barat"
                className="w-full p-2.5 text-xs bg-slate-900 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#fbbc04] font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">Deskripsi Catatan (Opsional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Catatan tambahan target atau grup peserta"
                className="w-full p-2.5 text-xs bg-slate-900 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#fbbc04]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#fbbc04] text-slate-950 font-extrabold text-xs hover:bg-amber-400 transition-all cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>

        {/* Section 2: Data Actions Grid */}
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Aksi & Manajemen Data
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Upload Snapshot */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenUpload();
              }}
              className="p-3 bg-slate-950 border border-slate-800 hover:border-[#fbbc04]/50 rounded-2xl text-left flex items-center gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-[#fbbc04]/10 text-[#fbbc04] border border-[#fbbc04]/20 group-hover:bg-[#fbbc04] group-hover:text-slate-950 transition-colors">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block group-hover:text-[#fbbc04] transition-colors">
                  Upload Snapshot Baru
                </span>
                <span className="text-[10px] text-slate-400 block">Proses file .xlsx / .csv</span>
              </div>
            </button>

            {/* Export Backup JSON */}
            <button
              type="button"
              onClick={handleExportJson}
              className="p-3 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-2xl text-left flex items-center gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-slate-950 transition-colors">
                <FileJson className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block group-hover:text-blue-400 transition-colors">
                  Export Backup JSON
                </span>
                <span className="text-[10px] text-slate-400 block">Simpan file cadangan</span>
              </div>
            </button>

            {/* Import Backup JSON */}
            <button
              type="button"
              onClick={handleImportJson}
              className="p-3 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-2xl text-left flex items-center gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <Upload className="w-4 h-4 text-emerald-400 group-hover:text-slate-950" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block group-hover:text-emerald-400 transition-colors">
                  Import Backup JSON
                </span>
                <span className="text-[10px] text-slate-400 block">Pulihkan dari file JSON</span>
              </div>
            </button>

            {/* Export Excel Master */}
            <button
              type="button"
              onClick={() => {
                onExportAllExcel();
              }}
              className="p-3 bg-slate-950 border border-slate-800 hover:border-amber-500/50 rounded-2xl text-left flex items-center gap-3 transition-all cursor-pointer group"
            >
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block group-hover:text-amber-400 transition-colors">
                  Export Master Excel
                </span>
                <span className="text-[10px] text-slate-400 block">Download spreadsheet .xlsx</span>
              </div>
            </button>
          </div>
        </div>

        {/* Section 3: Danger Zone */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-400 block">Zona Bahaya</span>
            <span className="text-[10px] text-slate-400">Hapus project ini beserta seluruh pesertanya</span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenDeleteModal(currentProject);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/20 font-bold text-xs transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Hapus Project</span>
          </button>
        </div>
      </div>
    </div>
  );
};
