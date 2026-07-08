export interface EventSpace {
  eventSpaceId: number;
  eventId: number;
  spaceCode: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventSpaceDto {
  eventId: number;
  spaceCode: string;
  isAvailable: boolean;
}

export interface UpdateEventSpaceDto {
  spaceCode?: string;
  isAvailable?: boolean;
}
