export interface UserContact {
  userContactId: number;
  userId: number;
  contactTypeId: number;
  contactValue: string;
  isPrimary: boolean;
}

export interface EventUser {
  userId: number;
  keycloakId?: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  email?: string;
  contacts?: UserContact[];
}

export interface CatalogueValueBrief {
  catalogueValueId: number;
  code: string;
  name: string;
  description?: string | null;
  parentValueId?: number | null;
  parentValueName?: string | null;
  catalogueTypeId?: number;
  catalogueTypeCode?: string;
}

export interface Event {
  eventId: number;
  name: string;
  description: string;
  eventTypeId: number;
  eventTypeName?: string;
  eventType?: CatalogueValueBrief;
  eventVisibilityId: number;
  eventVisibilityName?: string;
  eventVisibility?: CatalogueValueBrief;
  isPaid: boolean;
  price?: number;
  virtualLink?: string | null;
  startDatetime: string;
  endDatetime: string;
  countryId: number;
  countryName?: string;
  country?: CatalogueValueBrief;
  provinceId: number;
  provinceName?: string;
  province?: CatalogueValueBrief;
  cityId: number;
  cityName?: string;
  city?: CatalogueValueBrief;
  addressLine?: string;
  maxAttendees?: number;
  maxEntrepreneurships?: number;
  createdByUserId: number;
  createdByUser?: EventUser;
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
