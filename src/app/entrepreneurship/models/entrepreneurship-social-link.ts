export interface EntrepreneurshipSocialLink {
  entrepreneurshipSocialLinkId: number;
  entrepreneurshipId: number;
  socialPlatformId: number;
  socialPlatformName?: string;
  url: string;
}

export interface CreateEntrepreneurshipSocialLinkDto {
  entrepreneurshipId: number;
  socialPlatformId: number;
  url: string;
}

export interface UpdateEntrepreneurshipSocialLinkDto {
  socialPlatformId?: number;
  url?: string;
}
