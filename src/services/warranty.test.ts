import type { ProjectPhoto } from '@/database/schema/projects';
import { getWarrantyPhotoStatus, getWarrantySummaryText, WARRANTY_PHOTO_STAGES } from '@/services/warranty';

function photo(stage: ProjectPhoto['stage']): ProjectPhoto {
  return {
    id: `photo-${stage}`,
    projectId: 'project-id',
    installerId: 'installer-id',
    stage,
    photoUrl: `file://${stage}.jpg`,
    storagePath: null,
    caption: null,
    takenAt: '2026-07-15T00:00:00.000Z',
  };
}

describe('warranty photo qualification', () => {
  it('requires one photo from every approved stage', () => {
    const status = getWarrantyPhotoStatus(WARRANTY_PHOTO_STAGES.map((stage) => photo(stage.id)));

    expect(status.requiredCount).toBe(6);
    expect(status.completedCount).toBe(6);
    expect(status.isQualified).toBe(true);
    expect(status.missingStages).toEqual([]);
    expect(getWarrantySummaryText(status)).toBe('Stage photo record complete for warranty review.');
  });

  it('names every missing stage and does not count duplicates twice', () => {
    const status = getWarrantyPhotoStatus([photo('substrate'), photo('substrate'), photo('primer')]);

    expect(status.completedCount).toBe(2);
    expect(status.isQualified).toBe(false);
    expect(status.missingStages.map((stage) => stage.id)).toEqual([
      'base_coat',
      'finish_coat',
      'sealed',
      'final',
    ]);
    expect(getWarrantySummaryText(status)).toContain('Scratch / Base Coat');
    expect(getWarrantySummaryText(status)).toContain('Final / Handover');
  });
});
