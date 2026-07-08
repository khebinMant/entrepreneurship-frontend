export interface CatalogueType {
  catalogueTypeId: number;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCatalogueTypeDto {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateCatalogueTypeDto {
  name?: string;
  code?: string;
  description?: string;
}
