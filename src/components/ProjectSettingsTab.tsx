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
  RefreshCw,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { ProjectRecord, SnapshotRecord } from '../types';
import { db } from '../db';
import { exportProjectToJson, importProjectFromJson } from '../utils/projectBackup';
import { recalculateProjectData, deleteSnapshot } from '../utils/excelParser';

interface ProjectSettingsTabProps {
  currentProject: ProjectRecord;
  participantCount: number;
  snapshotCount: number;
  snapshots?: SnapshotRecord[];
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
  snapshots = [],
  onOpenUploadModal,
  onExportMasterExcel,
  onOpenDeleteModal,
  onProjectUpdated,
  showToast,
}) => {
  const [name, setName] = useState(currentProject.name);
  const [description, setDescription] = useState(currentProject.description || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [snapshotToDelete, setSnapshotToDelete] = useState<SnapshotRecord | null>(null);
  const [isDeletingSnapshot, setIsDeletingSnapshot] = useState(false);

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

  const handleManualRecalculate = async () => {
    setIsRecalculating(true);
    try {
      const res = await recalculateProjectData(currentProject.id);
      showToast(
        `Kalkulasi ulang selesai! (${res.participantsCount} peserta diperbarui dari ${res.snapshotsCount} snapshot)`
      );
      onProjectUpdated();
    } catch (err: any) {
      alert('Gagal mengkalkulasi ulang data: ' + err.message);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleConfirmDeleteSnapshot = async () => {
    if (!snapshotToDelete || !snapshotToDelete.id) return;
    setIsDeletingSnapshot(true);
    try {
      const targetDate = snapshotToDelete.snapshot_date;
      const res = await deleteSnapshot(snapshotToDelete.id, currentProject.id);
      showToast(`Snapshot ${targetDate} berhasil dihapus & data peserta telah dikalkulasi ulang.`);
      setSnapshotToDelete(null);
      onProjectUpdated();
    } catch (err: any) {
      alert('Gagal menghapus snapshot: ' + err.message);
    } finally {
      setIsDeletingSnapshot(false);
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

      {/* Section 2: Snapshot Management & Recalculation */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#fbbc04]" />
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                Riwayat Snapshot & Kalkulasi Ulang
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hapus snapshot bermasalah atau hitung ulang total peserta dari awal secara kronologis.
              </p>
            </div>
          </div>

          <button
            onClick={handleManualRecalculate}
            disabled={isRecalculating || snapshots.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#fbbc04] border border-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
            title="Kalkulasi Ulang Data Peserta"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
            <span>{isRecalculating ? 'Mengkalkulasi...' : 'Kalkulasi Ulang Data'}</span>
          </button>
        </div>

        {snapshots.length === 0 ? (
          <div className="text-center py-6 bg-slate-950 rounded-2xl border border-slate-800/80">
            <Calendar className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-400">Belum Ada Snapshot Diunggah</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Upload file Excel/CSV laporan harian untuk membuat snapshot pertama.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-extrabold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Tanggal Snapshot</th>
                  <th className="p-3">Waktu Upload</th>
                  <th className="p-3 text-center">Peserta</th>
                  <th className="p-3 text-center">Skill Badges</th>
                  <th className="p-3 text-center">Arcade Games</th>
                  <th className="p-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {snapshots.map((s) => (
                  <tr key={s.id || s.snapshot_date} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 font-bold text-slate-100 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#fbbc04]" />
                      <span>{s.snapshot_date}</span>
                    </td>
                    <td className="p-3 text-slate-400 text-[11px]">
                      {new Date(s.created_at).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 text-center font-bold text-indigo-400">{s.total_participants}</td>
                    <td className="p-3 text-center text-emerald-400 font-semibold">{s.total_skill_badges}</td>
                    <td className="p-3 text-center text-amber-400 font-semibold">{s.total_arcade_games}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSnapshotToDelete(s)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[11px] font-bold transition-colors cursor-pointer"
                        title="Hapus Snapshot Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 3: Data Actions Cards */}
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

      {/* Section 4: Danger Zone */}
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

      {/* Modal Confirmation Delete Snapshot */}
      {snapshotToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-2xl border border-rose-500/20 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Hapus Snapshot?</h3>
                <p className="text-xs text-slate-400">
                  Tanggal: <strong className="text-white">{snapshotToDelete.snapshot_date}</strong> ({snapshotToDelete.total_participants} peserta)
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
              Data snapshot ini akan dihapus permanen. Setelah penghapusan, sistem akan secara otomatis mengkalkulasi ulang data peserta berdasarkan snapshot sisanya. <span className="text-emerald-400 font-bold">Catatan & status invite WA peserta akan tetap aman dan dipertahankan.</span>
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSnapshotToDelete(null)}
                disabled={isDeletingSnapshot}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteSnapshot}
                disabled={isDeletingSnapshot}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition-all cursor-pointer shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeletingSnapshot ? 'Menghapus...' : 'Ya, Hapus & Recalculate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
