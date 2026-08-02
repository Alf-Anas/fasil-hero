import Dexie, { Table } from 'dexie';
import { ParticipantRecord, ProjectRecord, SnapshotRecord } from '../types';

export class FasilHeroDatabase extends Dexie {
  projects!: Table<ProjectRecord, string>;
  snapshots!: Table<SnapshotRecord, number>;
  participants!: Table<ParticipantRecord, string>;

  constructor() {
    super('FasilHeroDB');

    // Define tables and indexed keys
    this.version(1).stores({
      projects: 'id, name, created_at',
      snapshots: '++id, project_id, snapshot_date, [project_id+snapshot_date]',
      participants: 'email, project_id, name, phone, wa_invited, first_seen_date, [project_id+email]',
    });
  }
}

export const db = new FasilHeroDatabase();

// Default project ID for single-project fallback
export const DEFAULT_PROJECT_ID = 'proj_arcade_2026';

export async function ensureDefaultProjectExists(): Promise<ProjectRecord> {
  const existing = await db.projects.get(DEFAULT_PROJECT_ID);
  if (existing) {
    return existing;
  }

  const defaultProj: ProjectRecord = {
    id: DEFAULT_PROJECT_ID,
    name: 'Google Arcade Facilitator 2026',
    description: 'Dashboard Tracking Peserta Program Google Arcade Facilitator Indonesia 2026',
    created_at: new Date().toISOString(),
  };

  await db.projects.put(defaultProj);
  return defaultProj;
}
