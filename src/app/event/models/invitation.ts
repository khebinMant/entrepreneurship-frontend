export interface Invitation {
  id: string;
  eventId: string;
  eventTitle: string;
  entrepreneurId: string;
  entrepreneurName: string;
  status: InvitationStatus;
  sentAt: string;
  respondedAt?: string;
}

export type InvitationStatus = 'pending' | 'accepted' | 'declined';
