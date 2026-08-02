import { db } from '../db';
import { ParticipantRecord, ProjectRecord, SnapshotRecord } from '../types';

export interface ProjectBackupData {
  version: string;
  exported_at: string;
  project: ProjectRecord;
  snapshots: SnapshotRecord[];
  participants: ParticipantRecord[];
}

/**
 * Exports the specified project, its snapshots, and participants into a downloadable JSON file.
 */
export async function exportProjectToJson(projectId: string): Promise<void> {
  const project = await db.projects.get(projectId);
  if (!project) {
    throw new Error('Project tidak ditemukan.');
  }

  const snapshots = await db.snapshots.where('project_id').equals(projectId).toArray();
  const participants = await db.participants.where('project_id').equals(projectId).toArray();

  const backupData: ProjectBackupData = {
    version: '1.0',
    exported_at: new Date().toISOString(),
    project,
    snapshots,
    participants,
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const cleanName = project.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `FasilHero_Backup_${cleanName}_${new Date().toISOString().split('T')[0]}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Imports project backup JSON into Dexie IndexedDB.
 */
export async function importProjectFromJson(jsonContent: string): Promise<{ projectId: string; projectName: string; snapshotCount: number; participantCount: number }> {
  let parsed: ProjectBackupData;
  try {
    parsed = JSON.parse(jsonContent);
  } catch (e) {
    throw new Error('File JSON tidak valid atau rusak.');
  }

  if (!parsed.project || !parsed.project.id || !parsed.project.name) {
    throw new Error('Format file backup tidak sesuai (Project metadata hilang).');
  }

  const projectToSave: ProjectRecord = parsed.project;
  const snapshotsToSave: SnapshotRecord[] = Array.isArray(parsed.snapshots) ? parsed.snapshots : [];
  const participantsToSave: ParticipantRecord[] = Array.isArray(parsed.participants) ? parsed.participants : [];

  // Save project
  await db.projects.put(projectToSave);

  // Bulk put snapshots
  if (snapshotsToSave.length > 0) {
    await db.snapshots.bulkPut(snapshotsToSave);
  }

  // Bulk put participants
  if (participantsToSave.length > 0) {
    await db.participants.bulkPut(participantsToSave);
  }

  return {
    projectId: projectToSave.id,
    projectName: projectToSave.name,
    snapshotCount: snapshotsToSave.length,
    participantCount: participantsToSave.length,
  };
}
