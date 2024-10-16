/**
 * the response interface for the requests that response with "many" data
 */
export interface GetMany<T = any> {
  data: T[];
  count: number;
}
