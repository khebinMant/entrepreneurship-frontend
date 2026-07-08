export interface UserSession {
  userId: string;
  username: string;
  email: string;
  roles: string[];
  accessToken: string;
  refreshToken: string;
}
