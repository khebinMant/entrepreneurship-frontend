export interface ImageGallery {
  imageId: number;
  entityType: 'USER' | 'ENTREPRENEURSHIP' | 'EVENT';
  entityId: number;
  imageUrl: string;
  storagePath: string;
  fileName: string;
  displayOrder: number;
  altText?: string;
  description?: string;
  widthPx?: number;
  heightPx?: number;
  fileSizeKb?: number;
  mimeType?: string;
  uploadedByUserId?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ImageUploadResponse {
  imageId: number;
  imageUrl: string;
  fileName: string;
  fileSizeKb: number;
  mimeType: string;
}

export interface ImageReorderRequest {
  entityType: string;
  entityId: number;
  orderedImageIds: number[];
}
