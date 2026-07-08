export interface UserIdentification {
  userIdentificationId: number;
  userId: number;
  identificationTypeId: number;
  identificationTypeName?: string;
  identificationValue: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserIdentificationDto {
  userId: number;
  identificationTypeId: number;
  identificationValue: string;
}

export interface UpdateUserIdentificationDto {
  identificationTypeId?: number;
  identificationValue?: string;
}
