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

export interface EventParticipant {
  eventEntrepreneurshipParticipantId: number;
  eventId: number;
  eventName?: string;
  entrepreneurshipId: number;
  entrepreneurshipName?: string;
  entrepreneurshipImageUrl?: string;
  entrepreneurshipImageId?: number;
  participationStatusId: number;
  participationStatusName?: string;
  spaceCode?: string;
  invitedAt: string;
  respondedAt?: string;
}
