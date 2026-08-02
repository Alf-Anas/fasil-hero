import React from 'react';
import { X, Award, Database, Layers, Sparkles } from 'lucide-react';
import { FACILITATOR_MILESTONES } from './MilestoneCards';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl border border-slate-800 relative my-8 space-y-6 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 sticky top-0 bg-slate-900 z-10 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
              F
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">Tentang FasilHero</h2>
              <p className="text-xs text-slate-400">
                Aplikasi Dashboard Tracking Facilitator Google Arcade 2026
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

        {/* Program Overview */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            Apa itu FasilHero?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>FasilHero</strong> adalah aplikasi web client-side untuk para Facilitator program <strong>Google Arcade Facilitator 2026</strong>. Aplikasi ini membantu Facilitator dalam mengunggah laporan harian, melacak kenaikan skill badges dan game koin para peserta, serta mengelola status pendaftaran & komunikasi peserta secara lokal dan aman tanpa server eksternal.
          </p>
        </div>

        {/* Milestone Logic Explanation */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            Aturan & Skema Milestone Facilitator 2026
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Total Poin Gabungan dihitung dari: <br />
            <code className="bg-slate-950 text-blue-400 border border-slate-800 px-2 py-0.5 rounded font-mono font-bold">
              SUM(Jumlah Skill Badges) + SUM(Jumlah Arcade Games)
            </code>{' '}
            seluruh peserta pada snapshot terbaru.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {FACILITATOR_MILESTONES.map((m) => (
              <div key={m.id} className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-white">
                  <span>{m.title}</span>
                  <span className="text-blue-400">{m.targetCombined.toLocaleString()} Poin</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Rekomendasi: {m.recommendedArcade} Arcade + {m.recommendedSkill} Skill Badges
                </p>
                <p className="text-[10px] text-emerald-400 font-semibold pt-1 border-t border-slate-800">
                  🎁 {m.badgeName}: {m.rewardDescription}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* IndexedDB Data Privacy */}
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Penyimpanan Lokal 100% Client-Side (Dexie IndexedDB)</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Seluruh data peserta, snapshot harian, serta catatan khusus Facilitator tersimpan dengan aman di browser lokal Anda menggunakan IndexedDB (Dexie.js). Tidak ada data pribadi peserta yang dikirim ke server luar.
          </p>
        </div>

        {/* CSV Columns Specs */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            16 Kolom Laporan Standar Google Arcade
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono bg-slate-950 p-3 rounded-xl border border-slate-800">
            <ol className="list-decimal list-inside space-y-1">
              <li>Nama Peserta</li>
              <li>Email Peserta (Unique PK)</li>
              <li>Nomor HP Peserta</li>
              <li>URL Profil Google Skills</li>
              <li>Status Google Skills URL Profil</li>
              <li>URL Profil Google Developer</li>
              <li>Status URL Profil Google Developer</li>
              <li>Status Redeem Kode Akses</li>
            </ol>
            <ol start={9} className="list-decimal list-inside space-y-1">
              <li>Milestone yang diraih</li>
              <li>Bonus Milestone yang diraih</li>
              <li>Status Verifikasi AI Agent</li>
              <li>Lencana Digital GEAR yang diraih</li>
              <li>Jumlah Lencana Keahlian (Number)</li>
              <li>Nama Lencana Keahlian</li>
              <li>Jumlah Arcade Game (Number)</li>
              <li>Nama Arcade Game</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-extrabold text-white bg-blue-600 rounded-xl hover:bg-blue-500 shadow-md shadow-blue-500/20 cursor-pointer"
          >
            Mengerti & Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
