export interface PaginationInput {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export function getPaginationParams(query: Record<string, any>): PaginationInput {
  const page = Math.max(1, parseInt(query.page as string, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit as string, 10) || 10));
  return { page, limit };
}

export function buildPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    total,
    currentPage: page,
    pageSize: limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
