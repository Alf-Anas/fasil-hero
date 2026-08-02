import React, { useState } from 'react';
import { X, HelpCircle, Mail, Copy, Check, ExternalLink, UserPlus, MessageSquare, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(text);
    setTimeout(() => {
      setCopiedLink(null);
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
              <h2 className="text-lg font-black text-white">Bantuan & Informasi Program</h2>
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

        {/* Promotional Links Section */}
        <div className="p-4 bg-gradient-to-br from-amber-500/10 via-slate-950 to-slate-950 border border-amber-500/30 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#fbbc04]" />
              Gabung / Daftar Sebagai Peserta Facilitator
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-[#fbbc04]/20 text-[#fbbc04] border border-[#fbbc04]/30 uppercase tracking-wider">
              Link Referral
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Ingin bergabung atau mengajak rekan mendaftar sebagai peserta dalam program Facilitator Google Arcade? Gunakan link pendaftaran dan grup WhatsApp resmi berikut:
          </p>

          <div className="space-y-2 pt-1">
            {/* Registration Link */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-300 block">Link Pendaftaran Peserta</span>
                  <a
                    href="https://s.id/GoogleArcadeFacilitator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono font-extrabold text-[#fbbc04] hover:underline truncate block"
                  >
                    https://s.id/GoogleArcadeFacilitator
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href="https://s.id/GoogleArcadeFacilitator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
                  title="Buka Link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleCopy('https://s.id/GoogleArcadeFacilitator')}
                  className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Salin Link"
                >
                  {copiedLink === 'https://s.id/GoogleArcadeFacilitator' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* WA Group Link */}
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 shrink-0">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-slate-300 block">Link Grup WhatsApp Peserta</span>
                  <a
                    href="https://s.id/GoogleArcadeWAGroup"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono font-extrabold text-[#fbbc04] hover:underline truncate block"
                  >
                    https://s.id/GoogleArcadeWAGroup
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href="https://s.id/GoogleArcadeWAGroup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors"
                  title="Buka Link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => handleCopy('https://s.id/GoogleArcadeWAGroup')}
                  className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Salin Link"
                >
                  {copiedLink === 'https://s.id/GoogleArcadeWAGroup' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Support Section Heading */}
        <div className="space-y-1 pt-1 border-t border-slate-800">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Kendala Teknis & Bantuan Resmi</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
            Jika menemui kendala selama masa persiapan maupun pelaksanaan program, silakan hubungi tim terkait berikut:
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
                {copiedLink === 'arcade@dicoding.com' ? (
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
                {copiedLink === 'arcade-facilitator@google.com' ? (
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

