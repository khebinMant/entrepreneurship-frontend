export interface EventInvitation {
  invitationId: number;
  eventId: number;
  eventName?: string;
  entrepreneurshipId: number;
  entrepreneurship?: {
    entrepreneurshipId: number;
    name: string;
    imageUrl?: string;
    imageId?: number;
    categoryName?: string;
  };
  eventSpaceId?: number | null;
  invitationStatusId: number;
  sentAt: string;
  respondedAt?: string | null;
}

export interface CreateEventInvitationDto {
  eventId: number;
  entrepreneurshipId: number;
  invitationStatusId: number;
  email?: string | null;
  message?: string;
  eventSpaceId?: number | null;
}

export interface BulkCreateInvitationDto {
  invitations: CreateEventInvitationDto[];
}

export interface ParticipantEntrepreneurship {
  entrepreneurshipId: number;
  userId?: number;
  categoryId?: number;
  categoryName?: string;
  name: string;
  description?: string;
  logoUrl?: string;
  isPhysical?: boolean;
  isDigital?: boolean;
  imageUrl?: string;
  imageId?: number;
}

export interface EventParticipant {
  eventParticipantId: number;
  eventId: number;
  eventName?: string;
  entrepreneurshipId: number;
  entrepreneurship?: ParticipantEntrepreneurship;
  spaceCode?: string;
  participationStatusId: number;
  participationStatusName?: string;
  invitedAt: string;
  respondedAt?: string;
}
