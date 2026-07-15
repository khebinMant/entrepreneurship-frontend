export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePictureUrl?: string;
}

export interface ChangePasswordRequestDto {
  newPassword: string;
}
