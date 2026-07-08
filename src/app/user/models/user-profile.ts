export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
}
