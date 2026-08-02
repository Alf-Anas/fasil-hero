import React, { useState } from 'react';
import { Trash2, AlertTriangle, Download, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ProjectRecord } from '../types';

interface DeleteProjectModalProps {
  isOpen: boolean;
  project: ProjectRecord | null;
  participantCount?: number;
  snapshotCount?: number;
  isLastProject?: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
  onDownloadBackup: () => Promise<void>;
}

export const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
  isOpen,
  project,
  participantCount = 0,
  snapshotCount = 0,
  isLastProject = false,
  onClose,
  onConfirmDelete,
  onDownloadBackup,
}) => {
  const [confirmNameInput, setConfirmNameInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !project) return null;

  const isNameMatched = confirmNameInput.trim().toLowerCase() === project.name.trim().toLowerCase();

  const handleDelete = async () => {
    if (!isNameMatched && participantCount > 0) return;
    setIsDeleting(true);
    try {
      await onConfirmDelete();
      setConfirmNameInput('');
      setIsDeleting(false);
      onClose();
    } catch (err: any) {
      setIsDeleting(false);
      alert('Gagal menghapus project: ' + err.message);
    }
  };

  const handleBackup = async () => {
    setIsDownloading(true);
    try {
      await onDownloadBackup();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-800 relative my-8 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Hapus Project</h2>
              <p className="text-xs text-rose-400 font-bold">Tindakan ini tidak dapat dibatalkan</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Project Terpilih:</span>
            <h3 className="text-base font-extrabold text-white">{project.name}</h3>
            {project.description && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{project.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Peserta</span>
              <span className="font-black text-rose-400 text-sm">{participantCount} Data</span>
            </div>
            <div className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Snapshot</span>
              <span className="font-black text-rose-400 text-sm">{snapshotCount} Snapshot</span>
            </div>
          </div>
        </div>

        {/* Warning text */}
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs text-rose-300 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-rose-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Peringatan Penting</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            Seluruh data peserta, catatan evaluasi, serta riwayat snapshot harian dalam project ini akan dihapus secara permanen dari IndexedDB browser.
          </p>
          {isLastProject && (
            <p className="text-[11px] text-amber-300 font-semibold pt-1 border-t border-rose-500/20">
              💡 Ini adalah project terakhir Anda. Setelah dihapus, FasilHero akan otomatis menyiapkan Project Utama baru yang bersih.
            </p>
          )}
        </div>

        {/* Backup Option */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-slate-200">Amankan Data Dulu?</p>
            <p className="text-[10px] text-slate-400">Download file backup JSON sebelum menghapus.</p>
          </div>
          <button
            type="button"
            onClick={handleBackup}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-bold text-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Downloading...' : 'Backup JSON'}</span>
          </button>
        </div>

        {/* Safety Type Input for Confirmation (if has participants) */}
        {participantCount > 0 && (
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              Ketik <span className="text-[#fbbc04] font-black">{project.name}</span> untuk konfirmasi:
            </label>
            <input
              type="text"
              value={confirmNameInput}
              onChange={(e) => setConfirmNameInput(e.target.value)}
              placeholder={`Tulis "${project.name}" di sini`}
              className="w-full p-3 text-xs bg-slate-950 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-rose-500 font-medium"
            />
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || (participantCount > 0 && !isNameMatched)}
            className="px-5 py-2.5 text-xs font-black text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-rose-600/20 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Menghapus...' : 'Hapus Project Permanen'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
