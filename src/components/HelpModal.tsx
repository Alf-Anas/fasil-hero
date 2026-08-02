import React, { useState } from 'react';
import { X, HelpCircle, Mail, Copy, Check, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => {
      setCopiedEmail(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 max-w-xl w-full shadow-2xl border border-slate-800 relative my-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#fbbc04]/10 text-[#fbbc04] border border-[#fbbc04]/20">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Bantuan & Kendala Teknis</h2>
              <p className="text-xs text-slate-400">
                Pusat dukungan resmi Facilitator Google Arcade 2026
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

        {/* Notice text */}
        <div className="space-y-2">
          <p className="text-xs text-slate-300 leading-relaxed font-medium">
            Jika menemui kendala selama masa persiapan maupun pelaksanaan program, silakan hubungi tim kami sesuai dengan kategori berikut:
          </p>
        </div>

        {/* Support Categories */}
        <div className="space-y-3">
          {/* Category 1: Dicoding Admin */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 hover:border-[#fbbc04]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#fbbc04]" />
                Kendala Program (Administrasi / Koordinasi)
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Dicoding Team
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Pertanyaan seputar pendaftaran, koordinasi grup, kuota peserta, dan laporan administrasi.
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <a
                href="mailto:arcade@dicoding.com"
                className="text-xs font-mono font-bold text-[#fbbc04] hover:underline flex items-center gap-1"
              >
                arcade@dicoding.com <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => handleCopy('arcade@dicoding.com')}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
              >
                {copiedEmail === 'arcade@dicoding.com' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Email</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Category 2: Google Platform */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2 hover:border-[#fbbc04]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#fbbc04]" />
                Kendala Platform / Teknis
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Google Arcade Team
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Kendala kredit Google Cloud Skills Boost, lencana tidak muncul, atau error platform. <strong className="text-amber-300">(Harap gunakan bahasa Inggris)</strong>
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <a
                href="mailto:arcade-facilitator@google.com"
                className="text-xs font-mono font-bold text-[#fbbc04] hover:underline flex items-center gap-1"
              >
                arcade-facilitator@google.com <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => handleCopy('arcade-facilitator@google.com')}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
              >
                {copiedEmail === 'arcade-facilitator@google.com' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-[#fbbc04] hover:bg-amber-400 text-slate-950 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
