export interface EntitySocialLink {
  entitySocialLinkId: number;
  entityId: number;
  socialPlatformId: number;
  socialPlatformName?: string;
  url: string;
}

export interface CreateEntitySocialLinkDto {
  entityId: number;
  socialPlatformId: number;
  url: string;
}

export interface UpdateEntitySocialLinkDto {
  entityId?: number;
  socialPlatformId?: number;
  url?: string;
}
