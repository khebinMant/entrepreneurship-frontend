export interface EntrepreneurshipPortal {
  entrepreneurshipPortalId: number;
  entrepreneurshipId: number;
  subdomain: string;
  themeId: number;
  themeName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntrepreneurshipPortalDto {
  entrepreneurshipId: number;
  subdomain: string;
  themeId: number;
  isActive: boolean;
}

export interface UpdateEntrepreneurshipPortalDto {
  subdomain?: string;
  themeId?: number;
  isActive?: boolean;
}
