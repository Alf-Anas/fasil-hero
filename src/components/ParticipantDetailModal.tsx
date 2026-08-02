import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Phone,
  Mail,
  BookOpen,
  Gamepad2,
  CheckCircle,
  XCircle,
  PhoneCall,
  Save,
  Trophy,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { ParticipantRecord } from '../types';
import { db } from '../db';
import { PARTICIPANT_MILESTONES_CONFIG, getMilestoneTierProgress } from '../utils/milestones';

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
      await db.participants
        .where({ project_id: participant.project_id, email: participant.email })
        .modify({
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

  const getWaDirectUrl = (phone: string) => {
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.slice(1);
    }
    return `https://wa.me/${cleanPhone}`;
  };

  const getWaMessageLink = (phone: string, name: string) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-3xl p-5 sm:p-6 max-w-2xl w-full shadow-2xl border border-slate-800 relative my-8 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
              {participant.name ? participant.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">{participant.name}</h2>
                {participant.access_code_status === 'Sudah Redeem' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" /> Sudah Redeem
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                    <XCircle className="w-3 h-3 text-rose-400" /> Belum Redeem
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                <span className="flex items-center gap-1 font-mono">
                  <Mail className="w-3.5 h-3.5 text-slate-500" /> {participant.email}
                </span>
                {participant.phone && (
                  <a
                    href={getWaDirectUrl(participant.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-emerald-400 hover:underline font-mono"
                    title="Buka WhatsApp"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> {participant.phone}
                    <ExternalLink className="w-3 h-3 text-emerald-400" />
                  </a>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Poin</p>
            <p className="text-xl sm:text-2xl font-black text-blue-400">{totalCombined}</p>
          </div>
          <div className="border-x border-slate-800">
            <p className="text-[10px] uppercase font-bold text-slate-400">Skill Badges</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-400">{participant.skill_badges_count}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400">Arcade Games</p>
            <p className="text-xl sm:text-2xl font-black text-amber-400">{participant.arcade_games_count}</p>
          </div>
        </div>

        {/* Profiles & Public Links */}
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Tautan & Status Profil Google</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {participant.skills_profile_url ? (
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex flex-col justify-between gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 truncate">Profil Google Skills Boost</span>
                  <a
                    href={participant.skills_profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-blue-400 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    participant.skills_profile_status === 'All Good'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {participant.skills_profile_status || 'All Good'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-500">
                Profil Skills Boost tidak tersedia
              </div>
            )}

            {participant.developer_profile_url ? (
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 flex flex-col justify-between gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200 truncate">Profil Google Developer</span>
                  <a
                    href={participant.developer_profile_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-blue-400 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    participant.developer_profile_status === 'All Good'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {participant.developer_profile_status || 'All Good'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-slate-800 bg-slate-950 text-xs text-slate-500">
                Profil Developer tidak tersedia
              </div>
            )}
          </div>
        </div>

        {/* Participant Milestones & Snapshot Achievement History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#fbbc04]" />
              Pencapaian Milestone Peserta & Snapshot
            </h3>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
              Poin: {participant.arcade_games_count} Arcade • {participant.skill_badges_count} Skills
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PARTICIPANT_MILESTONES_CONFIG.map((cfg) => {
              const dateMap: Record<string, string | undefined> = {
                m1: participant.milestone_1_date,
                m2: participant.milestone_2_date,
                m3: participant.milestone_3_date,
                ultimate: participant.ultimate_milestone_date,
              };

              const snapshotAchievedDate = dateMap[cfg.id];
              const prog = getMilestoneTierProgress(
                participant.arcade_games_count,
                participant.skill_badges_count,
                cfg.requiredArcade,
                cfg.requiredSkill
              );

              return (
                <div
                  key={cfg.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    prog.isAchieved
                      ? `${cfg.bgClass} ${cfg.borderClass}`
                      : 'bg-slate-950/80 border-slate-800/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{cfg.badgeEmoji}</span>
                      <div>
                        <h4 className="text-xs font-extrabold text-white">{cfg.name}</h4>
                        <p className="text-[10px] text-slate-400">
                          Syarat: <strong>{cfg.requiredArcade} Arcade</strong> & <strong>{cfg.requiredSkill} Skills</strong>
                        </p>
                      </div>
                    </div>

                    {prog.isAchieved ? (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${cfg.badgeClass}`}>
                        Selesai
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-900 text-slate-400 border border-slate-800 shrink-0">
                        Belum
                      </span>
                    )}
                  </div>

                  {prog.isAchieved ? (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] font-semibold text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-[#fbbc04] shrink-0" />
                      <span>
                        Dicapai pada Snapshot:{' '}
                        <strong className="text-white font-mono">{snapshotAchievedDate || participant.first_seen_date || 'Terbaru'}</strong>
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2 space-y-1.5">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Arcade: {participant.arcade_games_count}/{cfg.requiredArcade}</span>
                        <span>Skills: {participant.skill_badges_count}/{cfg.requiredSkill}</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden flex border border-slate-800">
                        <div
                          className="bg-amber-400 h-full transition-all"
                          style={{ width: `${prog.arcadeProgress}%` }}
                        />
                        <div
                          className="bg-emerald-400 h-full transition-all"
                          style={{ width: `${prog.skillProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-500 italic">
                        Kurang: {prog.arcadeNeeded > 0 ? `${prog.arcadeNeeded} Arcade` : ''} {prog.arcadeNeeded > 0 && prog.skillNeeded > 0 ? ' & ' : ''} {prog.skillNeeded > 0 ? `${prog.skillNeeded} Skill Badges` : ''}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional Arcade Status Badges */}
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Status & Program Arcade</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Lencana GEAR</span>
              <span className="text-xs font-bold text-[#fbbc04] line-clamp-1" title={participant.gear_digital_badge || 'No Badge'}>
                {participant.gear_digital_badge || 'No Badge'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Milestone Diraih</span>
              <span className="text-xs font-bold text-slate-200">
                {participant.milestone_reached || 'None'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
              <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Verifikasi AI Agent</span>
              <span className="text-xs font-bold text-slate-300">
                {participant.ai_agent_verification_status || 'Not yet submitted'}
              </span>
            </div>
          </div>
        </div>

        {/* Lists of Badges & Games */}
        <div className="space-y-2">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Rincian Lencana</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" /> Skill Badges
              </p>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {participant.skill_badges_names || 'Belum ada lencana keahlian yang tercatat.'}
              </p>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-1">
              <p className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-amber-400" /> Arcade Games
              </p>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {participant.arcade_games_names || 'Belum ada Arcade Game yang tercatat.'}
              </p>
            </div>
          </div>
        </div>

        {/* Facilitator Tracking Fields */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Tracking Facilitator</h3>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-200">Status Invite WA Grup</p>
              <p className="text-[11px] text-slate-400">Tandai jika peserta sudah masuk ke grup WA Facilitator</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={waInvited}
                onChange={(e) => setWaInvited(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Catatan Khusus Facilitator
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Tambahkan catatan khusus progres, kendala, atau interaksi..."
              className="w-full p-3 text-xs bg-slate-950 text-slate-100 border border-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          {participant.phone ? (
            <a
              href={getWaMessageLink(participant.phone, participant.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-500 transition-colors shadow-xs cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Kirim Chat WA
            </a>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-300 rounded-xl border border-slate-800 hover:bg-slate-800 cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500 shadow-md shadow-blue-500/20 disabled:opacity-50 cursor-pointer"
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
