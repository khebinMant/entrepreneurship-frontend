export interface CreateEventDto {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  type: string;
  maxAttendees?: number;
  coverUrl?: string;
}

export interface UpdateEventDto {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  type?: string;
  status?: string;
  maxAttendees?: number;
  coverUrl?: string;
}

export interface SendInvitationDto {
  entrepreneurId: string;
  message?: string;
}
