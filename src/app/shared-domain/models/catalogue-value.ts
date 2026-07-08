export interface CatalogueValue {
  catalogueValueId: number;
  catalogueTypeId: number;
  catalogueTypeCode: string;
  name: string;
  code: string;
  description?: string;
  parentId?: number;
  children?: CatalogueValue[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCatalogueValueDto {
  catalogueTypeId: number;
  name: string;
  code: string;
  description?: string;
  parentId?: number;
}

export interface UpdateCatalogueValueDto {
  name?: string;
  code?: string;
  description?: string;
  parentId?: number;
}
