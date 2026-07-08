export interface Pagination {
  page: number;
  pageSize: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: string[];
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}
