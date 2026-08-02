import React, { useState } from 'react';
import { X, FolderKanban, Plus, Trash2 } from 'lucide-react';
import { ProjectRecord } from '../types';
import { db } from '../db';

interface ProjectModalProps {
  isOpen: boolean;
  projects: ProjectRecord[];
  currentProjectId: string;
  onClose: () => void;
  onSelectProject: (id: string) => void;
  onProjectCreated: () => void;
  onProjectDeleted: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  projects,
  currentProjectId,
  onClose,
  onSelectProject,
  onProjectCreated,
  onProjectDeleted,
}) => {
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    setIsCreating(true);
    const newId = 'proj_' + Date.now();
    try {
      await db.projects.add({
        id: newId,
        name: newProjectName.trim(),
        description: newProjectDesc.trim() || 'Project Facilitator Arcade',
        created_at: new Date().toISOString(),
      });
      setIsCreating(false);
      setNewProjectName('');
      setNewProjectDesc('');
      onProjectCreated();
      onSelectProject(newId);
    } catch (err) {
      console.error('Failed to create project', err);
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string, name: string) => {
    if (projects.length <= 1) {
      alert('Tidak dapat menghapus project terakhir!');
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus project "${name}" beserta seluruh data snapshot dan pesertanya?`)) {
      return;
    }

    try {
      await db.projects.delete(projectId);
      await db.snapshots.where('project_id').equals(projectId).delete();
      await db.participants.where('project_id').equals(projectId).delete();

      onProjectDeleted();
      const remaining = projects.find((p) => p.id !== projectId);
      if (remaining) {
        onSelectProject(remaining.id);
      }
    } catch (err) {
      console.error('Failed to delete project', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 max-w-xl w-full shadow-2xl border border-slate-800 relative my-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-800 text-blue-400 rounded-2xl border border-slate-700">
              <FolderKanban className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Kelola Project Facilitator</h2>
              <p className="text-xs text-slate-400">
                Buat project terpisah untuk batch, wilayah, atau musim Google Arcade.
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

        {/* Existing Projects List */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Daftar Project Active</h3>
          <div className="space-y-2">
            {projects.map((p) => {
              const isSelected = p.id === currentProjectId;
              return (
                <div
                  key={p.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all ${
                    isSelected
                      ? 'bg-blue-500/10 border-blue-500/40 shadow-xs'
                      : 'bg-slate-950 border-slate-800 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        onSelectProject(p.id);
                        onClose();
                      }}
                      className="text-left"
                    >
                      <p className="text-xs font-bold text-white flex items-center gap-2">
                        {p.name}
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[10px] font-semibold">
                            Aktif
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400">{p.description}</p>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isSelected && (
                      <button
                        onClick={() => {
                          onSelectProject(p.id);
                          onClose();
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-blue-400 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 cursor-pointer"
                      >
                        Pilih
                      </button>
                    )}

                    {projects.length > 1 && (
                      <button
                        onClick={() => handleDeleteProject(p.id, p.name)}
                        title="Hapus Project"
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add New Project Form */}
        <form onSubmit={handleCreateProject} className="space-y-3 pt-3 border-t border-slate-800">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Tambah Project Baru
          </h3>

          <div className="space-y-2">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Nama Project (Contoh: Arcade Season 2 Jawa Barat)"
              className="w-full p-3 text-xs bg-slate-950 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              required
            />
            <input
              type="text"
              value={newProjectDesc}
              onChange={(e) => setNewProjectDesc(e.target.value)}
              placeholder="Deskripsi singkat project..."
              className="w-full p-3 text-xs bg-slate-950 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isCreating || !newProjectName.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-extrabold text-white bg-blue-600 rounded-xl hover:bg-blue-500 shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {isCreating ? 'Membuat...' : 'Buat Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
