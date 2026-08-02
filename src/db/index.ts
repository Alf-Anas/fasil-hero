import Dexie, { Table } from 'dexie';
import { ParticipantRecord, ProjectRecord, SnapshotRecord } from '../types';

export class FasilHeroDatabase extends Dexie {
  projects!: Table<ProjectRecord, string>;
  snapshots!: Table<SnapshotRecord, number>;
  participants!: Table<ParticipantRecord, [string, string]>;

  constructor() {
    super('FasilHeroDB');

    // Version 1 (Legacy schema)
    this.version(1).stores({
      projects: 'id, name, created_at',
      snapshots: '++id, project_id, snapshot_date, [project_id+snapshot_date]',
      participants: 'email, project_id, name, phone, wa_invited, first_seen_date, [project_id+email]',
    });

    // Version 2: Drop old participants table to allow primary key change
    this.version(2).stores({
      participants: null,
    });

    // Version 3: Re-create participants table with compound primary key [project_id+email]
    this.version(3).stores({
      projects: 'id, name, created_at',
      snapshots: '++id, project_id, snapshot_date, [project_id+snapshot_date]',
      participants: '[project_id+email], project_id, email, name, phone, wa_invited, first_seen_date',
    });
  }
}

export const db = new FasilHeroDatabase();

// Automatic error recovery for IndexedDB primary key or schema migration issues
db.open().catch(async (err) => {
  console.warn('Dexie open error detected, auto-healing IndexedDB...', err);
  if (
    err.name === 'UpgradeError' ||
    err.name === 'SchemaError' ||
    err.message?.includes('primary key')
  ) {
    try {
      await Dexie.delete('FasilHeroDB');
      await db.open();
      console.log('FasilHeroDB successfully reset and reopened.');
    } catch (resetErr) {
      console.error('Failed to reset database:', resetErr);
    }
  }
});
