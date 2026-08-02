import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Users, PieChart as PieIcon, Activity } from 'lucide-react';
import { ParticipantRecord, SnapshotRecord } from '../types';

interface AnalyticsChartsProps {
  snapshots: SnapshotRecord[];
  participants: ParticipantRecord[];
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ snapshots, participants }) => {
  // Sort snapshots chronologically
  const sortedSnapshots = [...snapshots].sort(
    (a, b) => new Date(a.snapshot_date).getTime() - new Date(b.snapshot_date).getTime()
  );

  // Line Chart Data
  const lineChartData = sortedSnapshots.map((s) => ({
    date: s.snapshot_date,
    'Skill Badges': s.total_skill_badges,
    'Arcade Games': s.total_arcade_games,
    'Total Combined': s.total_combined,
  }));

  // Bar Chart Data
  const newParticipantsByDateMap = new Map<string, number>();
  participants.forEach((p) => {
    if (p.first_seen_date) {
      newParticipantsByDateMap.set(
        p.first_seen_date,
        (newParticipantsByDateMap.get(p.first_seen_date) || 0) + 1
      );
    }
  });

  const barChartData = Array.from(newParticipantsByDateMap.entries())
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([date, count]) => ({
      date,
      'Peserta Baru': count,
    }));

  // Pie Chart Data 1: Access Code Status
  let redeemedCount = 0;
  let notRedeemedCount = 0;

  participants.forEach((p) => {
    if (p.access_code_status === 'Sudah Redeem') {
      redeemedCount++;
    } else {
      notRedeemedCount++;
    }
  });

  const redeemPieData = [
    { name: 'Sudah Redeem', value: redeemedCount, color: '#34A853' },
    { name: 'Belum Redeem', value: notRedeemedCount, color: '#EA4335' },
  ];

  // Pie Chart Data 2: WA Invite Status
  let waInvitedCount = 0;
  let waNotInvitedCount = 0;

  participants.forEach((p) => {
    if (p.wa_invited) {
      waInvitedCount++;
    } else {
      waNotInvitedCount++;
    }
  });

  const waPieData = [
    { name: 'Sudah Invited', value: waInvitedCount, color: '#4285F4' },
    { name: 'Belum Invited', value: waNotInvitedCount, color: '#FBBC04' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Analisis & Visualisasi Tren Facilitator
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Grafik akumulasi pencapaian, laju pertumbuhan peserta baru, dan rasio konversi redeem.
          </p>
        </div>
      </div>

      {/* Grid Row 1: Line Chart & Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Tren Akumulasi Badges vs Arcade Games
            </h3>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
              {snapshots.length} Snapshot
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px', color: '#cbd5e1' }} />
                <Line
                  type="monotone"
                  dataKey="Skill Badges"
                  stroke="#34A853"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Arcade Games"
                  stroke="#FBBC04"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="Total Combined"
                  stroke="#4285F4"
                  strokeWidth={3}
                  strokeDasharray="4 4"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              Pertumbuhan Peserta Baru per Tanggal
            </h3>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-950 px-2.5 py-0.5 rounded-full border border-slate-800">
              Total {participants.length} Peserta
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Peserta Baru" fill="#4285F4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid Row 2: 2 Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart 1: Redeem Status */}
        <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-amber-400" />
            Rasio Status Redeem Kode Akses
          </h3>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={redeemPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {redeemPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 text-xs pt-2 border-t border-slate-800 font-medium text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#34A853]" />
              <span>Sudah: <strong className="text-white">{redeemedCount}</strong> ({participants.length ? Math.round((redeemedCount / participants.length) * 100) : 0}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#EA4335]" />
              <span>Belum: <strong className="text-white">{notRedeemedCount}</strong> ({participants.length ? Math.round((notRedeemedCount / participants.length) * 100) : 0}%)</span>
            </div>
          </div>
        </div>

        {/* Pie Chart 2: WA Invite Status */}
        <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-blue-400" />
            Rasio Status WA Invite Grup
          </h3>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={waPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {waPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    borderColor: '#334155',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 text-xs pt-2 border-t border-slate-800 font-medium text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#4285F4]" />
              <span>Invited: <strong className="text-white">{waInvitedCount}</strong> ({participants.length ? Math.round((waInvitedCount / participants.length) * 100) : 0}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#FBBC04]" />
              <span>Belum: <strong className="text-white">{waNotInvitedCount}</strong> ({participants.length ? Math.round((waNotInvitedCount / participants.length) * 100) : 0}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
