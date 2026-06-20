import { PHOTO_STAGES, type PhotoStage, type ProjectPhoto } from '@/database/schema/projects';

export interface WarrantyPhotoStageStatus {
  id: PhotoStage;
  label: string;
  count: number;
  isComplete: boolean;
}

export interface WarrantyPhotoStatus {
  requiredCount: number;
  completedCount: number;
  isQualified: boolean;
  stages: WarrantyPhotoStageStatus[];
  missingStages: WarrantyPhotoStageStatus[];
}

export const WARRANTY_PHOTO_STAGES = PHOTO_STAGES;

export function getWarrantyPhotoStatus(photos: ProjectPhoto[]): WarrantyPhotoStatus {
  const stages = WARRANTY_PHOTO_STAGES.map((stage) => {
    const count = photos.filter((photo) => photo.stage === stage.id).length;
    return {
      id: stage.id,
      label: stage.label,
      count,
      isComplete: count > 0,
    };
  });

  const completedCount = stages.filter((stage) => stage.isComplete).length;

  return {
    requiredCount: stages.length,
    completedCount,
    isQualified: completedCount === stages.length,
    stages,
    missingStages: stages.filter((stage) => !stage.isComplete),
  };
}

export function getWarrantySummaryText(status: WarrantyPhotoStatus): string {
  if (status.isQualified) {
    return 'Stage photo record complete for warranty review.';
  }

  const missing = status.missingStages.map((stage) => stage.label).join(', ');
  return `Missing warranty photos: ${missing}.`;
}
