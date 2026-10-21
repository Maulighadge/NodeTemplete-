export const COMMON_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Record created successfully',
  UPDATED: 'Record updated successfully',
  DELETED: 'Record deleted successfully',
  NOT_FOUND: 'Requested resource not found',
  VALIDATION_ERROR: 'Validation failed for request parameters',
  UNAUTHORIZED: 'Authentication required or invalid credentials',
  FORBIDDEN: 'You do not have permission to perform this action',
  CONFLICT: 'A record with the given unique identifier already exists',
  INTERNAL_ERROR: 'An unexpected internal server error occurred',
  RATE_LIMIT: 'Too many requests, please try again later',
} as const;
