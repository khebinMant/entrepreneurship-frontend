export interface UserAddress {
  userAddressId: number;
  userId: number;
  countryId: number;
  countryName?: string;
  provinceId: number;
  provinceName?: string;
  cityId: number;
  cityName?: string;
  parishId?: number;
  parishName?: string;
  addressLine: string;
  reference?: string;
  isPrimary: boolean;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserAddressDto {
  userId: number;
  countryId: number;
  provinceId: number;
  cityId: number;
  parishId?: number;
  addressLine: string;
  reference?: string;
  isPrimary: boolean;
}

export interface UpdateUserAddressDto {
  userId?: number;
  countryId?: number;
  provinceId?: number;
  cityId?: number;
  parishId?: number;
  addressLine?: string;
  reference?: string;
  isPrimary?: boolean;
}
