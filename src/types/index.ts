export interface RawParticipantRow {
  'Nama Peserta'?: string;
  'Email Peserta'?: string;
  'Nomor HP Peserta'?: string;
  'URL Profil Google Skills'?: string;
  'Status Google Skills URL Profil'?: string;
  'URL Profil Google Developer'?: string;
  'Status URL Profil Google Developer'?: string;
  'Status Redeem Kode Akses'?: string;
  'Milestone yang diraih'?: string;
  'Bonus Milestone yang diraih'?: string;
  'Status Verifikasi AI Agent'?: string;
  'Lencana Digital GEAR yang diraih'?: string;
  'Jumlah Lencana Keahlian yang diselesaikan'?: number | string;
  'Nama Lencana Keahlian yang diselesaikan'?: string;
  'Jumlah Arcade Game yang diselesaikan'?: number | string;
  'Nama Arcade Game yang diselesaikan'?: string;
  [key: string]: any;
}

export interface ParticipantRecord {
  email: string;
  project_id: string;
  name: string;
  phone: string;
  skills_profile_url?: string;
  skills_profile_status?: string;
  developer_profile_url?: string;
  developer_profile_status?: string;
  access_code_status: string; // e.g., "Sudah Redeem", "Belum Redeem"
  milestone_reached?: string;
  bonus_milestone_reached?: string;
  ai_agent_verification_status?: string;
  gear_digital_badge?: string;
  skill_badges_count: number;
  skill_badges_names?: string;
  arcade_games_count: number;
  arcade_games_names?: string;
  
  // Custom Facilitator Fields
  wa_invited: boolean;
  notes: string;
  first_seen_date: string; // ISO format (YYYY-MM-DD)
  last_updated_date?: string;

  // Computed diff fields (populated on query against previous snapshot)
  is_new?: boolean;
  skill_badges_diff?: number;
  arcade_games_diff?: number;
  total_badges_diff?: number;
}

export interface SnapshotRecord {
  id?: number;
  project_id: string;
  snapshot_date: string; // YYYY-MM-DD
  created_at: string; // ISO Timestamp
  total_participants: number;
  total_skill_badges: number;
  total_arcade_games: number;
  total_combined: number;
  raw_data_json: string; // Serialized list of participants at this snapshot
}

export interface ProjectRecord {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface FacilitatorMilestone {
  id: number;
  title: string;
  targetCombined: number;
  recommendedArcade: number;
  recommendedSkill: number;
  badgeName: string;
  rewardDescription: string;
}

export interface SnapshotDiff {
  snapshot_date: string;
  previous_date?: string;
  new_participants_count: number;
  total_participants: number;
  total_skill_badges: number;
  total_arcade_games: number;
  total_combined: number;
  growth_skill_badges: number;
  growth_arcade_games: number;
  growth_combined: number;
}
