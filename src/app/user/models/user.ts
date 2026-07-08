export interface User {
  userId: number;
  keycloakId: string;
  firstName: string;
  lastName: string;
  email?: string;
  imageUrl?: string;
  imageId?: number;
  createdAt: string;
  updatedAt: string;
}
