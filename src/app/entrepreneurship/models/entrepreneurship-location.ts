export interface EntrepreneurshipLocation {
  entrepreneurshipLocationId: number;
  entrepreneurshipId: number;
  countryId: number;
  countryName?: string;
  provinceId: number;
  provinceName?: string;
  cityId: number;
  cityName?: string;
  parishId?: number;
  parishName?: string;
  addressLine: string;
  latitude?: number;
  longitude?: number;
}

export interface CreateEntrepreneurshipLocationDto {
  entrepreneurshipId: number;
  countryId: number;
  provinceId: number;
  cityId: number;
  parishId?: number;
  addressLine: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateEntrepreneurshipLocationDto {
  countryId?: number;
  provinceId?: number;
  cityId?: number;
  parishId?: number;
  addressLine?: string;
  latitude?: number;
  longitude?: number;
}
