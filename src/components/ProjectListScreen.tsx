import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Trash2,
  FolderOpen,
  FileJson,
  Sparkles,
  Users,
  FileSpreadsheet,
  Download,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ProjectRecord } from '../types';
import { db } from '../db';
import { exportProjectToJson, importProjectFromJson } from '../utils/projectBackup';
import { seedSampleData } from '../utils/sampleData';
import { DeleteProjectModal } from './DeleteProjectModal';

interface ProjectListScreenProps {
  projects: ProjectRecord[];
  currentProjectId: string;
  onSelectProject: (id: string) => void;
  onProjectCreated: (newId: string) => void;
  onProjectDeleted: () => void;
  showToast: (msg: string) => void;
}

export const ProjectListScreen: React.FC<ProjectListScreenProps> = ({
  projects,
  currentProjectId,
  onSelectProject,
  onProjectCreated,
  onProjectDeleted,
  showToast,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [createOption, setCreateOption] = useState<'empty' | 'demo' | 'import'>('empty');
  const [isCreating, setIsCreating] = useState(false);

  const [projectToDelete, setProjectToDelete] = useState<ProjectRecord | null>(null);

  // Fetch participant counts & snapshot counts for each project
  const [projectStats, setProjectStats] = useState<Record<string, { participants: number; snapshots: number }>>({});

  React.useEffect(() => {
    async function loadStats() {
      const statsMap: Record<string, { participants: number; snapshots: number }> = {};
      for (const p of projects) {
        const pCount = await db.participants.where('project_id').equals(p.id).count();
        const sCount = await db.snapshots.where('project_id').equals(p.id).count();
        statsMap[p.id] = { participants: pCount, snapshots: sCount };
      }
      setProjectStats(statsMap);
    }
    loadStats();
  }, [projects]);

  const openDeleteModal = (e: React.MouseEvent, project: ProjectRecord) => {
    e.stopPropagation();
    setProjectToDelete(project);
  };

  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete) return;
    const targetId = projectToDelete.id;
    const targetName = projectToDelete.name;

    await db.projects.delete(targetId);
    await db.snapshots.where('project_id').equals(targetId).delete();
    await db.participants.where('project_id').equals(targetId).delete();

    showToast(`Project "${targetName}" berhasil dihapus.`);

    const remaining = projects.filter((p) => p.id !== targetId);
    if (remaining.length === 0) {
      onSelectProject('');
    } else if (currentProjectId === targetId) {
      onSelectProject(remaining[0].id);
    }

    onProjectDeleted();
  };

  const handleExportBackup = async (e: React.MouseEvent, projectId: string, name: string) => {
    e.stopPropagation();
    try {
      await exportProjectToJson(projectId);
      showToast(`Backup JSON project "${name}" berhasil didownload!`);
    } catch (err: any) {
      alert('Gagal export backup: ' + err.message);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    const newId = 'proj_' + Date.now();

    try {
      await db.projects.add({
        id: newId,
        name: newProjectName.trim(),
        description: newProjectDesc.trim() || 'Project Facilitator Arcade 2026',
        created_at: new Date().toISOString(),
      });

      if (createOption === 'demo') {
        await seedSampleData(true, newId);
        showToast(`Project "${newProjectName}" berhasil dibuat dengan data demo Google Arcade!`);
      } else {
        showToast(`Project "${newProjectName}" berhasil dibuat!`);
      }

      setIsCreating(false);
      setIsCreateModalOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
      onProjectCreated(newId);
      onSelectProject(newId);
    } catch (err: any) {
      setIsCreating(false);
      alert('Gagal membuat project: ' + err.message);
    }
  };

  const handleImportJsonFile = () => {
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
          alert(`Gagal import backup JSON: ${err.message}`);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-2 sm:px-4 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#fbbc04]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fbbc04]/10 border border-[#fbbc04]/20 text-[#fbbc04] text-xs font-extrabold uppercase tracking-wider">
            <FolderKanban className="w-3.5 h-3.5" /> Workspace Manager
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Pilih Project Facilitator Google Arcade
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Kelola multiple batch, wilayah, atau season pengerjaan Google Arcade secara terpisah. Seluruh data tersimpan aman di browser (IndexedDB).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 w-full md:w-auto shrink-0">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#fbbc04] text-slate-950 font-black text-xs hover:bg-amber-400 shadow-lg shadow-[#fbbc04]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Buat Project Baru
          </button>
          <button
            onClick={handleImportJsonFile}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <FileJson className="w-4 h-4 text-emerald-400" />
            Import Backup JSON
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#fbbc04]" />
            Daftar Project Terdaftar ({projects.length})
          </h2>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 sm:p-12 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 border border-slate-700 flex items-center justify-center mx-auto">
              <FolderKanban className="w-8 h-8 text-[#fbbc04]" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-extrabold text-white">Belum Ada Project</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Belum ada project yang dibuat. Klik tombol <strong className="text-slate-200">"Buat Project Baru"</strong> atau <strong className="text-slate-200">"Import Backup JSON"</strong> untuk membuat atau memulihkan batch pengerjaan.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#fbbc04] text-slate-950 font-black text-xs hover:bg-amber-400 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Buat Project Baru
              </button>
              <button
                onClick={handleImportJsonFile}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                <FileJson className="w-4 h-4 text-emerald-400" />
                Import Backup JSON
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => {
              const stats = projectStats[p.id] || { participants: 0, snapshots: 0 };

              return (
                <div
                  key={p.id}
                  onClick={() => onSelectProject(p.id)}
                  className="p-5 rounded-3xl border border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900 transition-all cursor-pointer flex flex-col justify-between space-y-4 group relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-2xl border bg-slate-950 text-slate-400 border-slate-800 group-hover:text-[#fbbc04] group-hover:border-[#fbbc04]/30 transition-colors">
                        <FolderOpen className="w-6 h-6" />
                      </div>
                      <div className="pr-4">
                        <h3 className="text-base font-extrabold text-white group-hover:text-[#fbbc04] transition-colors line-clamp-1">
                          {p.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Dibuat: {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {p.description || 'Project Facilitator Google Arcade'}
                    </p>

                    {/* Stats Badges */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                      <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80 text-center">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Peserta</span>
                        <span className="font-extrabold text-white text-sm flex items-center justify-center gap-1">
                          <Users className="w-3.5 h-3.5 text-blue-400" /> {stats.participants}
                        </span>
                      </div>

                      <div className="p-2 bg-slate-950 rounded-xl border border-slate-800/80 text-center">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase">Snapshots</span>
                        <span className="font-extrabold text-white text-sm flex items-center justify-center gap-1">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> {stats.snapshots}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleExportBackup(e, p.id, p.name)}
                        title="Download Backup JSON Project"
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => openDeleteModal(e, p)}
                        title="Hapus Project"
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => onSelectProject(p.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#fbbc04] text-slate-950 hover:bg-amber-400 transition-all cursor-pointer"
                    >
                      <span>Buka Project</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Buat Project Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-slate-800 relative my-8 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#fbbc04]/10 text-[#fbbc04] rounded-2xl border border-[#fbbc04]/20">
                  <Plus className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white">Buat Project Facilitator Baru</h2>
                  <p className="text-xs text-slate-400">
                    Atur nama & opsi awal pembuatan data project.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Project
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Contoh: Arcade Season 2 Jawa Barat"
                  className="w-full p-3 text-xs bg-slate-950 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#fbbc04]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Deskripsi Singkat (Opsional)
                </label>
                <input
                  type="text"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Deskripsi wilayah, batch, atau pengelola..."
                  className="w-full p-3 text-xs bg-slate-950 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#fbbc04]"
                />
              </div>

              {/* Opsi Inisialisasi Data */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Pilihan Inisialisasi Data Awal
                </label>

                <div className="grid grid-cols-1 gap-2">
                  <label
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      createOption === 'empty'
                        ? 'bg-[#fbbc04]/10 border-[#fbbc04] text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="createOption"
                        checked={createOption === 'empty'}
                        onChange={() => setCreateOption('empty')}
                        className="accent-[#fbbc04]"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">Project Kosong (Clean)</p>
                        <p className="text-[11px] text-slate-400">Mulai dari nol dan upload file laporan tersendiri.</p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                      createOption === 'demo'
                        ? 'bg-[#fbbc04]/10 border-[#fbbc04] text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="createOption"
                        checked={createOption === 'demo'}
                        onChange={() => setCreateOption('demo')}
                        className="accent-[#fbbc04]"
                      />
                      <div>
                        <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Muat Contoh Data Demo
                        </p>
                        <p className="text-[11px] text-slate-400">Otomatis isi dengan 12 peserta demo & 3 snapshot harian.</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 rounded-xl border border-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newProjectName.trim()}
                  className="px-5 py-2 text-xs font-black text-slate-950 bg-[#fbbc04] hover:bg-amber-400 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? 'Membuat...' : 'Buat Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Project Modal */}
      <DeleteProjectModal
        isOpen={!!projectToDelete}
        project={projectToDelete}
        participantCount={projectToDelete ? projectStats[projectToDelete.id]?.participants || 0 : 0}
        snapshotCount={projectToDelete ? projectStats[projectToDelete.id]?.snapshots || 0 : 0}
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
};
