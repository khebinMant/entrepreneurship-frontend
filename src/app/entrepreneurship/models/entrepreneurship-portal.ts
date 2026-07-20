export interface EntityPortal {
  entityPortalId: number;
  entityId: number;
  subdomain?: string;
  themeId?: number;
  themeName?: string;
  isActive?: boolean;
  htmlContent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityPortalDto {
  entityId: number;
  subdomain?: string;
  themeId?: number;
  isActive?: boolean;
  htmlContent?: string;
}

export interface UpdateEntityPortalDto {
  entityId?: number;
  subdomain?: string;
  themeId?: number;
  isActive?: boolean;
  htmlContent?: string;
}
