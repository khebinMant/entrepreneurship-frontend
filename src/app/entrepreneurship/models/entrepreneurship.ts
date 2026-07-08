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
  createdAt: string;
  updatedAt: string;
}

export interface EntrepreneurshipSearchFilters {
  name?: string;
  categoryId?: number;
  isPhysical?: boolean;
  isDigital?: boolean;
  page?: number;
  size?: number;
}
