export interface Fair {
  id: string;
  eventId: string;
  schedule: FairSchedule[];
  boothCount: number;
  availableBooths: number;
}

export interface FairSchedule {
  time: string;
  activity: string;
  description?: string;
  speaker?: string;
}
