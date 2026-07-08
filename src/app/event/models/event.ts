export interface Event {
  eventId: number;
  name: string;
  description: string;
  eventTypeId: number;
  eventTypeName?: string;
  eventVisibilityId: number;
  eventVisibilityName?: string;
  isPaid: boolean;
  price?: number;
  startDatetime: string;
  endDatetime: string;
  countryId: number;
  countryName?: string;
  provinceId: number;
  provinceName?: string;
  cityId: number;
  cityName?: string;
  addressLine?: string;
  maxAttendees?: number;
  maxEntrepreneurships?: number;
  createdByUserId: number;
  organizerName?: string;
  imageUrl?: string;
  imageId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EventSearchFilters {
  name?: string;
  eventTypeId?: number;
  eventVisibilityId?: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  size?: number;
}
