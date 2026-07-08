export interface UserContact {
  userContactId: number;
  userId: number;
  contactTypeId: number;
  contactTypeName?: string;
  contactValue: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserContactDto {
  userId: number;
  contactTypeId: number;
  contactValue: string;
  isPrimary: boolean;
}

export interface UpdateUserContactDto {
  contactTypeId?: number;
  contactValue?: string;
  isPrimary?: boolean;
}
