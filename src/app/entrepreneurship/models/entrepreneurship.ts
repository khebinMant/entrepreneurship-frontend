export interface Entrepreneurship {
  entrepreneurshipId: number;
  userId: number;
  categoryId: number;
  categoryName?: string;
  name: string;
  description: string;
  logoUrl?: string;
  isPhysical: boolean;
  isDigital: boolean;
  imageUrl?: string;
  imageId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntrepreneurshipDto {
  userId: number;
  categoryId: number;
  name: string;
  description: string;
  logoUrl?: string | null;
  isPhysical: boolean;
  isDigital: boolean;
  socialLinks: {
    socialPlatformId: number;
    url: string;
  }[];
  locations: {
    countryId: number;
    provinceId: number;
    cityId: number;
    parishId?: number;
    addressLine: string;
    latitude?: number;
    longitude?: number;
  }[];
  portal?: {
    subdomain?: string;
    themeId?: number;
    isActive?: boolean;
    htmlContent?: string;
  };
}

export interface EntrepreneurshipSearchFilters {
  name?: string;
  categoryId?: number;
  isPhysical?: boolean;
  isDigital?: boolean;
  page?: number;
  size?: number;
}
