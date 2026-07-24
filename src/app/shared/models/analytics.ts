export interface MonthlyActivity {
  year: number;
  month: number;
  count: number;
}

export interface CategoryCount {
  categoryId: number;
  categoryName: string;
  count: number;
}

export interface ByType {
  physical: number;
  digital: number;
  both: number;
}

export interface RecentEntity {
  entrepreneurshipId?: number;
  eventId?: number;
  name: string;
  createdAt: string;
}

export interface EntrepreneurshipGlobalAnalytics {
  totalEntrepreneurships: number;
  totalCategories: number;
  byCategory: CategoryCount[];
  byType: ByType;
  monthlyActivity: MonthlyActivity[];
  recentEntrepreneurships: RecentEntity[];
}

export interface EventTypeCount {
  id: number;
  name: string;
  count: number;
}

export interface EventVisibilityCount {
  id: number;
  name: string;
  count: number;
}

export interface EventGlobalAnalytics {
  totalEvents: number;
  byType: EventTypeCount[];
  byVisibility: EventVisibilityCount[];
  upcomingEvents: number;
  pastEvents: number;
  totalInvitationsSent: number;
  totalParticipants: number;
  monthlyActivity: MonthlyActivity[];
  recentEvents: RecentEntity[];
}

export interface UserEntrepreneurshipStats {
  totalEntrepreneurships: number;
  byCategory: CategoryCount[];
  byType: ByType;
  recentEntrepreneurships: RecentEntity[];
}

export interface UserEventStats {
  totalEvents: number;
  byType: EventTypeCount[];
  byVisibility: EventVisibilityCount[];
  upcomingEvents: number;
  pastEvents: number;
  totalInvitationsSent: number;
  totalParticipants: number;
  recentEvents: RecentEntity[];
}
