import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Phone,
  Mail,
  Award,
  BookOpen,
  Gamepad2,
  Calendar,
  CheckCircle,
  XCircle,
  MessageSquare,
  Sparkles,
  PhoneCall,
  User,
  ShieldCheck,
  Save,
} from 'lucide-react';
import { ParticipantRecord } from '../types';
import { db } from '../db';

interface ParticipantDetailModalProps {
  participant: ParticipantRecord | null;
  onClose: () => void;
  onUpdated: () => void;
}

export const ParticipantDetailModal: React.FC<ParticipantDetailModalProps> = ({
  participant,
  onClose,
  onUpdated,
}) => {
  if (!participant) return null;

  const [notes, setNotes] = useState(participant.notes || '');
  const [waInvited, setWaInvited] = useState(participant.wa_invited || false);
  const [isSaving, setIsSaving] = useState(false);

  const totalCombined = participant.skill_badges_count + participant.arcade_games_count;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await db.participants.update(participant.email, {
        notes,
        wa_invited: waInvited,
      });
      setIsSaving(false);
      onUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update participant', err);
      setIsSaving(false);
    }
  };

  const getWaLink = (phone: string, name: string) => {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    const message = encodeURIComponent(
      `Halo Kak ${name}! 👋\n\n` +
      `Saya Fasilitator Google Arcade 2026. Mau mengecek progres pengerjaan lab & koin Arcade Kakak. ` +
      `Silakan beri tahu jika ada kendala ya! 🚀`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 relative my-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              {participant.name ? participant.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">{participant.name}</h2>
                {participant.access_code_status === 'Sudah Redeem' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-600" /> Sudah Redeem
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-rose-600" /> Belum Redeem
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1 font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {participant.email}
                </span>
                {participant.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {participant.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-center">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Badges & Games</p>
            <p className="text-2xl font-black text-blue-600">{totalCombined}</p>
          </div>
          <div className="border-x border-slate-200">
            <p className="text-[10px] uppercase font-bold text-slate-400">Skill Badges</p>
            <p className="text-2xl font-black text-emerald-600">{participant.skill_badges_count}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Arcade Games</p>
            <p className="text-2xl font-black text-amber-600">{participant.arcade_games_count}</p>
          </div>
        </div>

        {/* Profiles & Public Links */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Tautan Profil Google</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {participant.skills_profile_url ? (
              <a
                href={participant.skills_profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/50 transition-all text-xs text-slate-700 font-semibold group"
              >
                <span className="truncate">Profil Google Skills Boost</span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
              </a>
            ) : (
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-400">
                Profil Skills Boost tidak tersedia
              </div>
            )}

            {participant.developer_profile_url ? (
              <a
                href={participant.developer_profile_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-white hover:bg-blue-50/50 transition-all text-xs text-slate-700 font-semibold group"
              >
                <span className="truncate">Profil Google Developer</span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
              </a>
            ) : (
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-400">
                Profil Developer tidak tersedia
              </div>
            )}
          </div>
        </div>

        {/* Lists of Badges & Games */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Rincian Lencana</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1">
              <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" /> Skill Badges Diselesaikan
              </p>
              <p className="text-xs text-slate-600 leading-relaxed font-mono">
                {participant.skill_badges_names || 'Belum ada lencana keahlian yang tercatat.'}
              </p>
            </div>

            <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-1">
              <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-amber-600" /> Arcade Games Diselesaikan
              </p>
              <p className="text-xs text-slate-600 leading-relaxed font-mono">
                {participant.arcade_games_names || 'Belum ada Arcade Game yang tercatat.'}
              </p>
            </div>
          </div>
        </div>

        {/* Facilitator Tracking Fields */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Tracking Facilitator</h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <p className="text-xs font-bold text-slate-800">Status Invite WA Grup</p>
              <p className="text-[11px] text-slate-500">Tandai jika peserta sudah masuk ke grup WA Facilitator</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={waInvited}
                onChange={(e) => setWaInvited(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Catatan Khusus Facilitator
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Tambahkan catatan khusus progres, kendala, atau interaksi..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          {participant.phone ? (
            <a
              href={getWaLink(participant.phone, participant.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl hover:bg-emerald-600 transition-colors shadow-sm"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Hubungi via WhatsApp
            </a>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50"
            >
              Tutup
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
