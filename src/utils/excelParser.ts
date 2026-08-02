import * as XLSX from 'xlsx';
import { db } from '../db';
import { ParticipantRecord, RawParticipantRow, SnapshotRecord } from '../types';
import { calculateHighestMilestone } from './milestones';

/**
 * Normalizes keys of an object to handle varied column headers from Excel/CSV exports
 */
export function normalizeKey(key: string): string {
  return key
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Helper to extract number from cell value
 */
function parseNumberCell(val: any): number {
  if (val === undefined || val === null || val === '') return 0;
  const num = Number(val);
  return isNaN(num) ? 0 : num;
}

/**
 * Helper to normalize access code status
 */
function normalizeAccessCodeStatus(status: any): string {
  if (!status) return 'Belum Redeem';
  const str = String(status).trim();
  const lower = str.toLowerCase();
  if (lower.includes('sudah') || lower.includes('redeemed') || lower.includes('yes') || lower.includes('ya')) {
    return 'Sudah Redeem';
  }
  return 'Belum Redeem';
}

/**
 * Parses XLSX/CSV ArrayBuffer into structured RawParticipantRow array
 */
export function parseExcelOrCsvBuffer(buffer: ArrayBuffer): RawParticipantRow[] {
  const workbook = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  return jsonData.map((row) => {
    const normalizedRow: Record<string, any> = {};
    Object.keys(row).forEach((k) => {
      normalizedRow[k.trim()] = row[k];
    });

    // Helper map lookup
    const findVal = (...possibleHeaders: string[]) => {
      for (const ph of possibleHeaders) {
        const phNorm = normalizeKey(ph);
        for (const rk of Object.keys(normalizedRow)) {
          if (normalizeKey(rk) === phNorm || rk.toLowerCase().includes(ph.toLowerCase())) {
            return normalizedRow[rk];
          }
        }
      }
      return '';
    };

    return {
      'Nama Peserta': String(findVal('Nama Peserta', 'Nama', 'Participant Name', 'Name') || '').trim(),
      'Email Peserta': String(findVal('Email Peserta', 'Email', 'Email Address', 'Participant Email') || '').trim(),
      'Nomor HP Peserta': String(findVal('Nomor HP Peserta', 'Nomor HP', 'Phone', 'WhatsApp', 'No HP') || '').trim(),
      'URL Profil Google Skills': String(findVal('URL Profil Google Skills', 'Google Skills URL', 'Skills Profile URL', 'Skills Boost Profile') || '').trim(),
      'Status Google Skills URL Profil': String(findVal('Status Google Skills URL Profil', 'Status Google Skills', 'Skills Status') || 'Valid').trim(),
      'URL Profil Google Developer': String(findVal('URL Profil Google Developer', 'Google Developer URL', 'Developer Profile URL') || '').trim(),
      'Status URL Profil Google Developer': String(findVal('Status URL Profil Google Developer', 'Status Developer URL', 'Developer Status') || 'Valid').trim(),
      'Status Redeem Kode Akses': String(findVal('Status Redeem Kode Akses', 'Status Redeem', 'Redeem Code Status', 'Access Code Status') || 'Belum Redeem').trim(),
      'Milestone yang diraih': String(findVal('Milestone yang diraih', 'Milestone', 'Milestone Reached') || '').trim(),
      'Bonus Milestone yang diraih': String(findVal('Bonus Milestone yang diraih', 'Bonus Milestone') || '').trim(),
      'Status Verifikasi AI Agent': String(findVal('Status Verifikasi AI Agent', 'Status Verifikasi AI', 'AI Verification') || '').trim(),
      'Lencana Digital GEAR yang diraih': String(findVal('Lencana Digital GEAR yang diraih', 'GEAR Badge', 'Digital Badge') || '').trim(),
      'Jumlah Lencana Keahlian yang diselesaikan': parseNumberCell(findVal('Jumlah Lencana Keahlian yang diselesaikan', 'Jumlah Lencana Keahlian', 'Skill Badges Count', 'Skill Badges')),
      'Nama Lencana Keahlian yang diselesaikan': String(findVal('Nama Lencana Keahlian yang diselesaikan', 'Nama Lencana Keahlian', 'Skill Badges Names') || '').trim(),
      'Jumlah Arcade Game yang diselesaikan': parseNumberCell(findVal('Jumlah Arcade Game yang diselesaikan', 'Jumlah Arcade Game', 'Arcade Games Count', 'Arcade Games')),
      'Nama Arcade Game yang diselesaikan': String(findVal('Nama Arcade Game yang diselesaikan', 'Nama Arcade Game', 'Arcade Games Names') || '').trim(),
    };
  });
}

/**
 * Process raw spreadsheet rows, save snapshot & update participants database with diff detection
 */
export async function processAndSaveSnapshot(
  projectId: string,
  snapshotDate: string,
  rows: RawParticipantRow[]
): Promise<{ snapshotId: number; newParticipantsCount: number; totalCombined: number }> {
  // Fetch existing participants in project to preserve wa_invited, notes, first_seen_date
  const existingParticipantsMap = new Map<string, ParticipantRecord>();
  const existingRecords = await db.participants.where('project_id').equals(projectId).toArray();
  existingRecords.forEach((p) => existingParticipantsMap.set(p.email.toLowerCase(), p));

  let totalSkillBadges = 0;
  let totalArcadeGames = 0;
  let newParticipantsCount = 0;

  const updatedParticipantsToPut: ParticipantRecord[] = [];

  for (const row of rows) {
    const rawEmail = row['Email Peserta'] || '';
    if (!rawEmail) continue; // Skip rows without email

    const email = rawEmail.toLowerCase().trim();
    const existing = existingParticipantsMap.get(email);

    const skillBadges = parseNumberCell(row['Jumlah Lencana Keahlian yang diselesaikan']);
    const arcadeGames = parseNumberCell(row['Jumlah Arcade Game yang diselesaikan']);

    totalSkillBadges += skillBadges;
    totalArcadeGames += arcadeGames;

    const isNew = !existing;
    if (isNew) {
      newParticipantsCount++;
    }

    const firstSeenDate = existing ? existing.first_seen_date : snapshotDate;
    const waInvited = existing ? existing.wa_invited : false;
    const notes = existing ? existing.notes : '';

    const updatedRecord: ParticipantRecord = {
      email,
      project_id: projectId,
      name: row['Nama Peserta'] || email,
      phone: row['Nomor HP Peserta'] || '',
      skills_profile_url: row['URL Profil Google Skills'] || '',
      skills_profile_status: row['Status Google Skills URL Profil'] || 'Valid',
      developer_profile_url: row['URL Profil Google Developer'] || '',
      developer_profile_status: row['Status URL Profil Google Developer'] || 'Valid',
      access_code_status: normalizeAccessCodeStatus(row['Status Redeem Kode Akses']),
      milestone_reached: row['Milestone yang diraih'] || '',
      bonus_milestone_reached: row['Bonus Milestone yang diraih'] || '',
      ai_agent_verification_status: row['Status Verifikasi AI Agent'] || '',
      gear_digital_badge: row['Lencana Digital GEAR yang diraih'] || '',
      skill_badges_count: skillBadges,
      skill_badges_names: row['Nama Lencana Keahlian yang diselesaikan'] || '',
      arcade_games_count: arcadeGames,
      arcade_games_names: row['Nama Arcade Game yang diselesaikan'] || '',
      wa_invited: waInvited,
      notes: notes,
      first_seen_date: firstSeenDate,
      last_updated_date: snapshotDate,
    };

    updatedParticipantsToPut.push(updatedRecord);
  }

  // Save participants batch
  await db.participants.bulkPut(updatedParticipantsToPut);

  // Check if snapshot for same date exists; if so, update or delete previous
  const existingSnapshot = await db.snapshots
    .where('[project_id+snapshot_date]')
    .equals([projectId, snapshotDate])
    .first();

  if (existingSnapshot && existingSnapshot.id) {
    await db.snapshots.delete(existingSnapshot.id);
  }

  const snapshotRecord: SnapshotRecord = {
    project_id: projectId,
    snapshot_date: snapshotDate,
    created_at: new Date().toISOString(),
    total_participants: updatedParticipantsToPut.length,
    total_skill_badges: totalSkillBadges,
    total_arcade_games: totalArcadeGames,
    total_combined: totalSkillBadges + totalArcadeGames,
    raw_data_json: JSON.stringify(rows),
  };

  const snapshotId = await db.snapshots.add(snapshotRecord);

  // Recalculate whole project data to ensure chronological ordering and clean state
  await recalculateProjectData(projectId);

  return {
    snapshotId: typeof snapshotId === 'number' ? snapshotId : 0,
    newParticipantsCount,
    totalCombined: totalSkillBadges + totalArcadeGames,
  };
}

/**
 * Recalculates all participant records and snapshot stats for a project
 * based on remaining snapshots ordered chronologically.
 * Preserves custom/manual participant attributes (notes, wa_invited, custom phone).
 */
export async function recalculateProjectData(projectId: string): Promise<{
  participantsCount: number;
  snapshotsCount: number;
}> {
  // 1. Map existing participant manual attributes before clearing
  const existingManualMap = new Map<string, { wa_invited: boolean; notes: string; phone: string }>();
  const existingParticipants = await db.participants.where('project_id').equals(projectId).toArray();
  existingParticipants.forEach((p) => {
    existingManualMap.set(p.email.toLowerCase().trim(), {
      wa_invited: p.wa_invited,
      notes: p.notes,
      phone: p.phone,
    });
  });

  // 2. Fetch all remaining snapshots for this project
  const snapshots = await db.snapshots
    .where('project_id')
    .equals(projectId)
    .toArray();

  // Sort snapshots chronologically (ascending: earliest first)
  snapshots.sort((a, b) => {
    const dateDiff = a.snapshot_date.localeCompare(b.snapshot_date);
    if (dateDiff !== 0) return dateDiff;
    return (a.id || 0) - (b.id || 0);
  });

  if (snapshots.length === 0) {
    // Delete all participants for this project if no snapshots remain
    await db.participants.where('project_id').equals(projectId).delete();
    return { participantsCount: 0, snapshotsCount: 0 };
  }

  // 3. Process snapshots chronologically to build updated participant records
  const recalculatedParticipantsMap = new Map<string, ParticipantRecord>();

  for (const snap of snapshots) {
    let rows: RawParticipantRow[] = [];
    try {
      rows = JSON.parse(snap.raw_data_json || '[]');
    } catch (e) {
      rows = [];
    }

    let snapSkillBadges = 0;
    let snapArcadeGames = 0;
    let snapParticipantCount = 0;

    for (const row of rows) {
      const rawEmail = row['Email Peserta'] || '';
      if (!rawEmail) continue;

      const email = rawEmail.toLowerCase().trim();
      snapParticipantCount++;

      const skillBadges = parseNumberCell(row['Jumlah Lencana Keahlian yang diselesaikan']);
      const arcadeGames = parseNumberCell(row['Jumlah Arcade Game yang diselesaikan']);

      snapSkillBadges += skillBadges;
      snapArcadeGames += arcadeGames;

      const existingInRecalc = recalculatedParticipantsMap.get(email);
      const manualInfo = existingManualMap.get(email);

      // first_seen_date is the snapshot_date of the earliest snapshot where this user appears
      const firstSeenDate = existingInRecalc
        ? existingInRecalc.first_seen_date
        : snap.snapshot_date;

      const waInvited = existingInRecalc
        ? existingInRecalc.wa_invited
        : manualInfo
        ? manualInfo.wa_invited
        : false;

      const notes = existingInRecalc
        ? existingInRecalc.notes
        : manualInfo
        ? manualInfo.notes
        : '';

      const phone = row['Nomor HP Peserta'] ||
        (existingInRecalc ? existingInRecalc.phone : manualInfo ? manualInfo.phone : '');

      // Milestone calculation & snapshot date tracking
      let m1_date = existingInRecalc?.milestone_1_date;
      let m2_date = existingInRecalc?.milestone_2_date;
      let m3_date = existingInRecalc?.milestone_3_date;
      let ult_date = existingInRecalc?.ultimate_milestone_date;

      if (arcadeGames >= 6 && skillBadges >= 14 && !m1_date) {
        m1_date = snap.snapshot_date;
      }
      if (arcadeGames >= 8 && skillBadges >= 28 && !m2_date) {
        m2_date = snap.snapshot_date;
      }
      if (arcadeGames >= 10 && skillBadges >= 42 && !m3_date) {
        m3_date = snap.snapshot_date;
      }
      if (arcadeGames >= 12 && skillBadges >= 56 && !ult_date) {
        ult_date = snap.snapshot_date;
      }

      const calculatedMilestone = calculateHighestMilestone(arcadeGames, skillBadges);

      const updatedRecord: ParticipantRecord = {
        email,
        project_id: projectId,
        name: row['Nama Peserta'] || email,
        phone,
        skills_profile_url: row['URL Profil Google Skills'] || '',
        skills_profile_status: row['Status Google Skills URL Profil'] || 'Valid',
        developer_profile_url: row['URL Profil Google Developer'] || '',
        developer_profile_status: row['Status URL Profil Google Developer'] || 'Valid',
        access_code_status: normalizeAccessCodeStatus(row['Status Redeem Kode Akses']),
        milestone_reached: row['Milestone yang diraih'] || '',
        bonus_milestone_reached: row['Bonus Milestone yang diraih'] || '',
        ai_agent_verification_status: row['Status Verifikasi AI Agent'] || '',
        gear_digital_badge: row['Lencana Digital GEAR yang diraih'] || '',
        skill_badges_count: skillBadges,
        skill_badges_names: row['Nama Lencana Keahlian yang diselesaikan'] || '',
        arcade_games_count: arcadeGames,
        arcade_games_names: row['Nama Arcade Game yang diselesaikan'] || '',
        calculated_milestone: calculatedMilestone,
        milestone_1_date: m1_date,
        milestone_2_date: m2_date,
        milestone_3_date: m3_date,
        ultimate_milestone_date: ult_date,
        wa_invited: waInvited,
        notes: notes,
        first_seen_date: firstSeenDate,
        last_updated_date: snap.snapshot_date,
      };

      recalculatedParticipantsMap.set(email, updatedRecord);
    }

    // Update snapshot record stats
    snap.total_participants = snapParticipantCount;
    snap.total_skill_badges = snapSkillBadges;
    snap.total_arcade_games = snapArcadeGames;
    snap.total_combined = snapSkillBadges + snapArcadeGames;
    await db.snapshots.put(snap);
  }

  // 4. Wipe current participant records for this project and put recalculated ones
  await db.participants.where('project_id').equals(projectId).delete();
  const newParticipantRecords = Array.from(recalculatedParticipantsMap.values());
  if (newParticipantRecords.length > 0) {
    await db.participants.bulkPut(newParticipantRecords);
  }

  return {
    participantsCount: newParticipantRecords.length,
    snapshotsCount: snapshots.length,
  };
}

/**
 * Deletes a snapshot by ID and triggers automatic recalculation of project participant data
 */
export async function deleteSnapshot(snapshotId: number, projectId: string) {
  await db.snapshots.delete(snapshotId);
  return await recalculateProjectData(projectId);
}

/**
 * Export participant data to Excel (.xlsx)
 */
export function exportParticipantsToExcel(
  participants: ParticipantRecord[],
  filename: string = 'FasilHero_Participant_Data.xlsx'
) {
  const exportRows = participants.map((p, idx) => ({
    'No': idx + 1,
    'Nama Peserta': p.name,
    'Email Peserta': p.email,
    'Nomor HP Peserta': p.phone,
    'Status WA Invited': p.wa_invited ? 'Sudah Invited' : 'Belum Invited',
    'Catatan Fasilitator': p.notes || '-',
    'Tanggal Pertama Ditemukan': p.first_seen_date,
    'Status Redeem Kode Akses': p.access_code_status,
    'Jumlah Skill Badges': p.skill_badges_count,
    'Jumlah Arcade Games': p.arcade_games_count,
    'Total Badges + Games': p.skill_badges_count + p.arcade_games_count,
    'Nama Skill Badges': p.skill_badges_names || '-',
    'Nama Arcade Games': p.arcade_games_names || '-',
    'URL Profil Skills': p.skills_profile_url || '-',
    'URL Profil Developer': p.developer_profile_url || '-',
    'Kalkulasi Milestone': p.calculated_milestone || 'Belum Milestone',
    'Tanggal Milestone 1': p.milestone_1_date || '-',
    'Tanggal Milestone 2': p.milestone_2_date || '-',
    'Tanggal Milestone 3': p.milestone_3_date || '-',
    'Tanggal Ultimate Milestone': p.ultimate_milestone_date || '-',
    'Milestone Raw Spreadsheet': p.milestone_reached || '-',
    'Lencana GEAR': p.gear_digital_badge || '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');

  // Auto column width
  const max_widths = Object.keys(exportRows[0] || {}).map((key) => ({
    wch: Math.max(key.length, 15),
  }));
  worksheet['!cols'] = max_widths;

  XLSX.writeFile(workbook, filename);
}

/**
 * Generates a downloadable Template / Sample Excel file for Facilitators
 */
export function downloadSampleExcelTemplate() {
  const sampleData: RawParticipantRow[] = [
    {
      'Nama Peserta': 'Andi Wijaya',
      'Email Peserta': 'andi.wijaya@example.com',
      'Nomor HP Peserta': '081234567891',
      'URL Profil Google Skills': 'https://www.cloudskillsboost.google/public_profiles/sample1',
      'Status Google Skills URL Profil': 'Valid',
      'URL Profil Google Developer': 'https://developers.google.com/profile/u/sample1',
      'Status URL Profil Google Developer': 'Valid',
      'Status Redeem Kode Akses': 'Sudah Redeem',
      'Milestone yang diraih': 'Tier 1',
      'Bonus Milestone yang diraih': 'Belum',
      'Status Verifikasi AI Agent': 'Terverifikasi',
      'Lencana Digital GEAR yang diraih': 'Level 1 Swag',
      'Jumlah Lencana Keahlian yang diselesaikan': 8,
      'Nama Lencana Keahlian yang diselesaikan': 'Baseline: Infrastructure, BigQuery Basics',
      'Jumlah Arcade Game yang diselesaikan': 5,
      'Nama Arcade Game yang diselesaikan': 'Trivia July 2026 Week 1, Week 2',
    },
    {
      'Nama Peserta': 'Bina Lestari',
      'Email Peserta': 'bina.lestari@example.com',
      'Nomor HP Peserta': '085678901235',
      'URL Profil Google Skills': 'https://www.cloudskillsboost.google/public_profiles/sample2',
      'Status Google Skills URL Profil': 'Valid',
      'URL Profil Google Developer': 'https://developers.google.com/profile/u/sample2',
      'Status URL Profil Google Developer': 'Valid',
      'Status Redeem Kode Akses': 'Belum Redeem',
      'Milestone yang diraih': 'Belum',
      'Bonus Milestone yang diraih': 'Belum',
      'Status Verifikasi AI Agent': 'Pending',
      'Lencana Digital GEAR yang diraih': 'Belum',
      'Jumlah Lencana Keahlian yang diselesaikan': 2,
      'Nama Lencana Keahlian yang diselesaikan': 'A Tour of Google Cloud Hands-on Labs',
      'Jumlah Arcade Game yang diselesaikan': 1,
      'Nama Arcade Game yang diselesaikan': 'Arcade Starter Game',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Google Arcade Data');
  XLSX.writeFile(workbook, 'Template_Google_Arcade_Facilitator_2026.xlsx');
}
