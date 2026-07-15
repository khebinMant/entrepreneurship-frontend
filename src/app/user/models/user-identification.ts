export interface UserIdentification {
  userIdentificationId: number;
  userId: number;
  identificationTypeId: number;
  identificationTypeName?: string;
  identificationNumber: string;
  issuedCountryId?: number;
  issuedCountryName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserIdentificationDto {
  userId: number;
  identificationTypeId: number;
  identificationNumber: string;
  issuedCountryId?: number;
}

export interface UpdateUserIdentificationDto {
  userId?: number;
  identificationTypeId?: number;
  identificationNumber?: string;
  issuedCountryId?: number;
}
