export interface EventInvitation {
  eventInvitationId: number;
  eventId: number;
  eventName?: string;
  entrepreneurshipId: number;
  entrepreneurshipName?: string;
  invitationStatusId: number;
  invitationStatusName?: string;
  sentAt: string;
  respondedAt?: string;
}

export interface CreateEventInvitationDto {
  eventId: number;
  entrepreneurshipId: number;
  invitationStatusId: number;
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
