import React, { useState } from 'react';
import { X, Plus, Sparkles, FileJson, Layers, Check } from 'lucide-react';
import { db } from '../db';
import { seedSampleData } from '../utils/sampleData';
import { importProjectFromJson } from '../utils/projectBackup';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (newProjectId: string) => void;
  showToast: (msg: string) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
  showToast,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [option, setOption] = useState<'empty' | 'demo'>('empty');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      const newId = 'proj_' + Date.now();
      await db.projects.add({
        id: newId,
        name: name.trim(),
        description: description.trim(),
        created_at: new Date().toISOString(),
      });

      if (option === 'demo') {
        await seedSampleData(false, newId);
        showToast(`Project "${name}" berhasil dibuat dengan data demo simulasi!`);
      } else {
        showToast(`Project bersih "${name}" berhasil dibuat! Silakan upload file snapshot.`);
      }

      setName('');
      setDescription('');
      setIsCreating(false);
      onProjectCreated(newId);
      onClose();
    } catch (err: any) {
      setIsCreating(false);
      alert('Gagal membuat project: ' + err.message);
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
          onProjectCreated(result.projectId);
          showToast(
            `Project "${result.projectName}" berhasil di-import! (${result.participantCount} peserta)`
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
      <div className="bg-slate-900 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-800 relative my-8 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#fbbc04]/10 text-[#fbbc04] rounded-2xl border border-[#fbbc04]/20 shrink-0">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Buat / Import Project Baru</h2>
              <p className="text-xs text-slate-400">Tambah batch atau kelompok peserta baru</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Nama Project / Batch <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Facilitator Arcade 2026 - Batch 2"
              className="w-full p-3 text-xs bg-slate-950 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#fbbc04] font-semibold"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Deskripsi / Catatan Tambahan
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Kelompok mahasiswa & umum wilayah Jabodetabek"
              className="w-full p-3 text-xs bg-slate-950 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#fbbc04]"
            />
          </div>

          {/* Opsi Isian Awal */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Isi Awal Project:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOption('empty')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  option === 'empty'
                    ? 'bg-[#fbbc04]/10 border-[#fbbc04] text-[#fbbc04]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4 mb-1" />
                <span className="text-xs font-extrabold block text-white">Project Bersih</span>
                <span className="text-[10px] text-slate-400 block">Siap upload file snapshot</span>
              </button>

              <button
                type="button"
                onClick={() => setOption('demo')}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  option === 'demo'
                    ? 'bg-[#fbbc04]/10 border-[#fbbc04] text-[#fbbc04]'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4 mb-1 text-amber-400" />
                <span className="text-xs font-extrabold block text-white">Data Demo</span>
                <span className="text-[10px] text-slate-400 block">12 peserta simulasi</span>
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleImportJson}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <FileJson className="w-4 h-4" />
              <span>Import JSON</span>
            </button>

            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#fbbc04] text-slate-950 font-black text-xs hover:bg-amber-400 transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-[#fbbc04]/20 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isCreating ? 'Membuat...' : 'Buat Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
