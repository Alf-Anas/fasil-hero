import { db, DEFAULT_PROJECT_ID, ensureDefaultProjectExists } from '../db';
import { ParticipantRecord, RawParticipantRow, SnapshotRecord } from '../types';

export const SAMPLE_PARTICIPANTS_DATA: Array<{
  name: string;
  email: string;
  phone: string;
  skills_url: string;
  dev_url: string;
  access_code_status: string;
  gear_badge: string;
  first_seen: string;
  snapshots: Array<{
    date: string;
    skill_badges: number;
    skill_names: string;
    arcade_games: number;
    arcade_names: string;
  }>;
  wa_invited: boolean;
  notes: string;
}> = [
  {
    name: 'Budi Santoso',
    email: 'budi.santoso@gmail.com',
    phone: '081234567890',
    skills_url: 'https://www.cloudskillsboost.google/public_profiles/budi-santoso-101',
    dev_url: 'https://developers.google.com/profile/u/budi-santoso',
    access_code_status: 'Sudah Redeem',
    gear_badge: 'Level 1 Swag Pack',
    first_seen: '2026-07-20',
    wa_invited: true,
    notes: 'Sangat aktif di grup, bercita-cita capai Milestone 4!',
    snapshots: [
      {
        date: '2026-07-20',
        skill_badges: 12,
        skill_names: 'Perform Foundational Infrastructure Tasks in Google Cloud, Create and Manage Cloud Resources',
        arcade_games: 8,
        arcade_names: 'Trivia July 2026, Level 1 Data Analytics',
      },
      {
        date: '2026-07-27',
        skill_badges: 18,
        skill_names: 'Set Up and Configure a Cloud Environment, Build and Secure Networks',
        arcade_games: 12,
        arcade_names: 'Trivia July 2026, Level 1 Data Analytics, Level 2 Security',
      },
      {
        date: '2026-08-02',
        skill_badges: 24,
        skill_names: 'Deploy and Manage Cloud Environments with Google Cloud, Generative AI Fundamentals',
        arcade_games: 15,
        arcade_names: 'Trivia July 2026, Level 1 Data Analytics, Level 2 Security, Level 3 Vertex AI',
      },
    ],
  },
  {
    name: 'Siti Rahmawati',
    email: 'siti.rahmawati@yahoo.com',
    phone: '085678901234',
    skills_url: 'https://www.cloudskillsboost.google/public_profiles/siti-rahma-202',
    dev_url: 'https://developers.google.com/profile/u/siti-rahma',
    access_code_status: 'Sudah Redeem',
    gear_badge: 'Level 1 Swag Pack',
    first_seen: '2026-07-20',
    wa_invited: true,
    notes: 'Perlu diingatkan untuk klaim koin trivia mingguan',
    snapshots: [
      {
        date: '2026-07-20',
        skill_badges: 10,
        skill_names: 'Baseline: Infrastructure, Cloud Speech API: 3 Ways',
        arcade_games: 6,
        arcade_names: 'Trivia July 2026 Week 1',
      },
      {
        date: '2026-07-27',
        skill_badges: 15,
        skill_names: 'Baseline: Infrastructure, BigQuery Basics, Cloud Speech API',
        arcade_games: 10,
        arcade_names: 'Trivia July 2026 Week 1, Trivia July 2026 Week 2',
      },
      {
        date: '2026-08-02',
        skill_badges: 20,
        skill_names: 'Prompt Engineering on Vertex AI, Generative AI Essentials',
        arcade_games: 14,
        arcade_names: 'Trivia July 2026 Week 1-3, Level 1 GenAI',
      },
    ],
  },
  {
    name: 'Ahmad Rizky Pratama',
    email: 'ahmad.rizky@gmail.com',
    phone: '082198765432',
    skills_url: 'https://www.cloudskillsboost.google/public_profiles/ahmad-rizky-303',
    dev_url: 'https://developers.google.com/profile/u/ahmad-rizky',
    access_code_status: 'Belum Redeem',
    gear_badge: 'Belum Ada',
    first_seen: '2026-07-20',
    wa_invited: false,
    notes: 'Belum meredeem kode akses. Kirim link panduan via WA.',
    snapshots: [
      {
        date: '2026-07-20',
        skill_badges: 2,
        skill_names: 'A Tour of Google Cloud Hands-on Labs',
        arcade_games: 1,
        arcade_names: 'Arcade Welcome Game',
      },
      {
        date: '2026-07-27',
        skill_badges: 3,
        skill_names: 'A Tour of Google Cloud Hands-on Labs',
        arcade_games: 1,
        arcade_names: 'Arcade Welcome Game',
      },
      {
        date: '2026-08-02',
        skill_badges: 4,
        skill_names: 'Cloud Engineering Essentials',
        arcade_games: 2,
        arcade_names: 'Arcade Welcome Game, Trivia Week 1',
      },
    ],
  },
  {
    name: 'Dewi Lestari',
    email: 'dewi.lestari@outlook.com',
    phone: '087811223344',
    skills_url: 'https://www.cloudskillsboost.google/public_profiles/dewi-lestari-404',
    dev_url: 'https://developers.google.com/profile/u/dewi-lestari',
    access_code_status: 'Sudah Redeem',
    gear_badge: 'Level 2 Swag Pack',
    first_seen: '2026-07-20',
    wa_invited: true,
    notes: 'Fokus pada sertifikasi Associate Cloud Engineer juga.',
    snapshots: [
      {
        date: '2026-07-20',
        skill_badges: 20,
        skill_names: 'Kubernetes in Google Cloud, Terraform on GCP',
        arcade_games: 15,
        arcade_names: 'Level 1 DevOps, Level 2 Cloud Architect',
      },
      {
        date: '2026-07-27',
        skill_badges: 28,
        skill_names: 'Kubernetes, Terraform, Anthos Specialist',
        arcade_games: 20,
        arcade_names: 'Level 1 DevOps, Level 2 Cloud Architect, Trivia All Weeks',
      },
      {
        date: '2026-08-02',
        skill_badges: 35,
        skill_names: 'Kubernetes, Terraform, Anthos Specialist, Multi-Cloud DevOps',
        arcade_games: 25,
        arcade_names: 'Level 1 DevOps, Level 2 Cloud Architect, Level 3 Specialist',
      },
    ],
  },
  {
    name: 'Fajar Nugraha',
    email: 'fajar.nugraha@gmail.com',
    phone: '081344556677',
    skills_url: 'https://www.cloudskillsboost.google/public_profiles/fajar-nugraha-505',
    dev_url: 'https://developers.google.com/profile/u/fajar-nugraha',
    access_code_status: 'Sudah Redeem',
    gear_badge: 'Level 1 Swag Pack',
    first_seen: '2026-07-27',
    wa_invited: true,
    notes: 'Peserta gabung minggu kedua (27 Juli). Progres sangat cepat!',
    snapshots: [
      {
        date: '2026-07-20',
        skill_badges: 0,
        skill_names: '',
        arcade_games: 0,
        arcade_names: '',
      },
      {
        date: '2026-07-27',
        skill_badges: 8,
        skill_names: 'Cloud Speech API, BigQuery Data Analysis',
        arcade_games: 5,
        arcade_names: 'Trivia July 2026 Week 2',
      },
      {
        date: '2026-08-02',
        skill_badges: 16,
        skill_names: 'Cloud Speech API, BigQuery Data Analysis, Dataproc Spark',
        arcade_games: 11,
        arcade_names: 'Trivia July 2026 Week 2 & 3, Level 1 Data',
      },
    ],
  },
  {
    name: 'Gita Gutawa Putri',
    email: 'gita.gutawa@gmail.com',
    phone: '081599001122',
    skills_url: 'https://www.cloudskillsboost.google/public_profiles/gita-gutawa-606',
    dev_url: 'https://developers.google.com/profile/u/gita-gutawa',
    access_code_status: 'Belum Redeem',
    gear_badge: 'Belum Ada',
    first_seen: '2026-08-02',
    wa_invited: false,
    notes: 'Peserta baru mendaftar pada upload snapshot 2 Agustus.',
    snapshots: [
      {
        date: '2026-07-20',
        skill_badges: 0,
        skill_names: '',
        arcade_games: 0,
        arcade_names: '',
      },
      {
        date: '2026-07-27',
        skill_badges: 0,
        skill_names: '',
        arcade_games: 0,
        arcade_names: '',
      },
      {
        date: '2026-08-02',
        skill_badges: 5,
        skill_names: 'Google Cloud Big Data and Machine Learning Fundamentals',
        arcade_games: 3,
        arcade_names: 'Arcade Starter Game',
      },
    ],
  },
  {
    name: 'Hendra Wijaya',
    email: 'hendra.wijaya@gmail.com',
    phone: '081288776655',
    skills_url: 'https://www.cloudskillsboost.google/public_profiles/hendra-wijaya-707',
    dev_url: 'https://developers.google.com/profile/u/hendra-wijaya',
    access_code_status: 'Sudah Redeem',
    gear_badge: 'Level 3 Swag Pack + Top Performer',
    first_seen: '2026-07-20',
    wa_invited: true,
    notes: 'Contributor aktif membantu teman-teman yang terkendala lab.',
    snapshots: [
      {
        date: '2026-07-20',
        skill_badges: 25,
        skill_names: 'Vertex AI Model Training, Cloud Architecture',
        arcade_games: 18,
        arcade_names: 'Level 1-3 AI & Cloud',
      },
      {
        date: '2026-07-27',
        skill_badges: 42,
        skill_names: 'Vertex AI Model Training, Cloud Architecture, Gemini Pro Vision',
        arcade_games: 28,
        arcade_names: 'Level 1-3 AI & Cloud, All Trivia Games',
      },
      {
        date: '2026-08-02',
        skill_badges: 58,
        skill_names: 'Vertex AI Model Training, Advanced MLOps, Gemini API Mastery',
        arcade_games: 36,
        arcade_names: 'Level 1-3 AI & Cloud, All Trivia Games, Special Hero Game',
      },
    ],
  },
  {
    name: 'Indah Permata',
    email: 'indah.permata@gmail.com',
    phone: '081722334455',
    skills_url: 'https://www.cloudskillsboost.google/public_profiles/indah-permata-808',
    dev_url: 'https://developers.google.com/profile/u/indah-permata',
    access_code_status: 'Sudah Redeem',
    gear_badge: 'Level 1 Swag Pack',
    first_seen: '2026-07-20',
    wa_invited: true,
    notes: 'Konsisten menyelesaikan 3 skill badges tiap minggu.',
    snapshots: [
      {
        date: '2026-07-20',
        skill_badges: 9,
        skill_names: 'Cloud Storage, BigQuery Basics',
        arcade_games: 5,
        arcade_names: 'Trivia Week 1',
      },
      {
        date: '2026-07-27',
        skill_badges: 14,
        skill_names: 'Cloud Storage, BigQuery Basics, Looker Studio',
        arcade_games: 8,
        arcade_names: 'Trivia Week 1 & 2',
      },
      {
        date: '2026-08-02',
        skill_badges: 19,
        skill_names: 'Cloud Storage, BigQuery Basics, Looker Studio, Vertex AI Fundamentals',
        arcade_games: 12,
        arcade_names: 'Trivia Week 1-3, Level 1 Game',
      },
    ],
  },
];

/**
 * Seed sample data into Dexie IndexedDB if database is empty
 */
export async function seedSampleData(force = false, targetProjectId: string = DEFAULT_PROJECT_ID): Promise<void> {
  await ensureDefaultProjectExists();

  const existingSnapshots = await db.snapshots.where('project_id').equals(targetProjectId).count();
  if (existingSnapshots > 0 && !force) {
    return;
  }

  if (force) {
    await db.snapshots.where('project_id').equals(targetProjectId).delete();
    await db.participants.where('project_id').equals(targetProjectId).delete();
  }

  const snapshotDates = ['2026-07-20', '2026-07-27', '2026-08-02'];

  for (const sDate of snapshotDates) {
    // Collect active participants on this snapshot date
    const rowsForSnapshot: RawParticipantRow[] = [];
    let totalSkillBadges = 0;
    let totalArcadeGames = 0;

    for (const p of SAMPLE_PARTICIPANTS_DATA) {
      const snapObj = p.snapshots.find((s) => s.date === sDate);
      if (snapObj && (snapObj.skill_badges > 0 || snapObj.arcade_games > 0 || p.first_seen <= sDate)) {
        totalSkillBadges += snapObj.skill_badges;
        totalArcadeGames += snapObj.arcade_games;

        rowsForSnapshot.push({
          'Nama Peserta': p.name,
          'Email Peserta': p.email,
          'Nomor HP Peserta': p.phone,
          'URL Profil Google Skills': p.skills_url,
          'Status Google Skills URL Profil': 'Valid',
          'URL Profil Google Developer': p.dev_url,
          'Status URL Profil Google Developer': 'Valid',
          'Status Redeem Kode Akses': p.access_code_status,
          'Milestone yang diraih': snapObj.skill_badges + snapObj.arcade_games >= 50 ? 'Tier 3' : 'Tier 1',
          'Bonus Milestone yang diraih': 'Belum',
          'Status Verifikasi AI Agent': 'Terverifikasi',
          'Lencana Digital GEAR yang diraih': p.gear_badge,
          'Jumlah Lencana Keahlian yang diselesaikan': snapObj.skill_badges,
          'Nama Lencana Keahlian yang diselesaikan': snapObj.skill_names,
          'Jumlah Arcade Game yang diselesaikan': snapObj.arcade_games,
          'Nama Arcade Game yang diselesaikan': snapObj.arcade_names,
        });

        // Update participant record in db
        await db.participants.put({
          email: p.email,
          project_id: targetProjectId,
          name: p.name,
          phone: p.phone,
          skills_profile_url: p.skills_url,
          skills_profile_status: 'Valid',
          developer_profile_url: p.dev_url,
          developer_profile_status: 'Valid',
          access_code_status: p.access_code_status,
          milestone_reached: snapObj.skill_badges + snapObj.arcade_games >= 50 ? 'Tier 3' : 'Tier 1',
          bonus_milestone_reached: 'Belum',
          ai_agent_verification_status: 'Terverifikasi',
          gear_digital_badge: p.gear_badge,
          skill_badges_count: snapObj.skill_badges,
          skill_badges_names: snapObj.skill_names,
          arcade_games_count: snapObj.arcade_games,
          arcade_games_names: snapObj.arcade_names,
          wa_invited: p.wa_invited,
          notes: p.notes,
          first_seen_date: p.first_seen,
          last_updated_date: sDate,
        });
      }
    }

    const snapshotRecord: SnapshotRecord = {
      project_id: targetProjectId,
      snapshot_date: sDate,
      created_at: new Date(sDate + 'T10:00:00Z').toISOString(),
      total_participants: rowsForSnapshot.length,
      total_skill_badges: totalSkillBadges,
      total_arcade_games: totalArcadeGames,
      total_combined: totalSkillBadges + totalArcadeGames,
      raw_data_json: JSON.stringify(rowsForSnapshot),
    };

    await db.snapshots.add(snapshotRecord);
  }
}
