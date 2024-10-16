/**
 * the basic entity for db queries
 */

export interface DB {
  id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  _version: number;
}
