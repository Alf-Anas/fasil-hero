import React, { useState } from 'react';
import {
  HelpCircle,
  Calendar,
  Layers,
  ArrowLeft,
} from 'lucide-react';
import { ProjectRecord, SnapshotRecord } from '../types';

interface NavbarProps {
  currentProject: ProjectRecord | null;
  snapshots: SnapshotRecord[];
  selectedSnapshotDate: string;
  isProjectViewActive: boolean;
  onGoToProjectList: () => void;
  onSelectSnapshotDate: (date: string) => void;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentProject,
  snapshots,
  selectedSnapshotDate,
  isProjectViewActive,
  onGoToProjectList,
  onSelectSnapshotDate,
  onOpenHelp,
}) => {
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo & Brand Name - ALWAYS goes to Home / List Project */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <button
              onClick={onGoToProjectList}
              className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
              title="Halaman Awal (Daftar Project)"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800 p-1 border border-slate-700/80 shadow-inner flex items-center justify-center shrink-0 overflow-hidden relative group-hover:border-[#fbbc04]/50 transition-colors">
                {!logoError ? (
                  <img
                    src="/logo.png"
                    alt="FasilHero Logo"
                    className="w-full h-full object-contain"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#fbbc04] to-amber-600 rounded-lg flex items-center justify-center text-slate-950 font-black text-lg">
                    F
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-white tracking-tight leading-none group-hover:text-[#fbbc04] transition-colors">
                    FasilHero
                  </h1>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-[#fbbc04] text-slate-950 shadow-xs">
                    2026
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium line-clamp-1">
                  Google Arcade Facilitator Tracking
                </p>
              </div>
            </button>
          </div>

          {/* Right Header Area */}
          <div className="flex items-center gap-2">
            {!isProjectViewActive && currentProject && (
              <>
                {/* Snapshot Date Selector */}
                {snapshots.length > 0 && (
                  <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-[#fbbc04] ml-1 shrink-0" />
                    <select
                      value={selectedSnapshotDate}
                      onChange={(e) => onSelectSnapshotDate(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none pr-1 cursor-pointer max-w-[130px] truncate"
                    >
                      {snapshots.map((s) => (
                        <option key={s.snapshot_date} value={s.snapshot_date} className="bg-slate-900 text-slate-100">
                          {s.snapshot_date}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Back to Project List button */}
                <button
                  onClick={onGoToProjectList}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-extrabold transition-all cursor-pointer"
                  title="Kembali ke Daftar Project"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#fbbc04]" />
                  <span className="hidden sm:inline">Daftar Project</span>
                </button>
              </>
            )}

            {/* Help Button */}
            <button
              onClick={onOpenHelp}
              className="p-2 text-slate-400 hover:text-[#fbbc04] rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Bantuan & Kendala"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
