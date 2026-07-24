export interface UserContact {
  userContactId: number;
  userId: number;
  contactTypeId: number;
  contactValue: string;
  isPrimary: boolean;
}

export interface CreatedByUser {
  userId: number;
  keycloakId?: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  email?: string;
  contacts?: UserContact[];
}

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
  createdByUser?: CreatedByUser;
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
    mapsUrl?: string;
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
