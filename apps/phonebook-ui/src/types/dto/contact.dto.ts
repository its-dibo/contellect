import { DB } from './db.dto';

export interface Contact extends DB {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
}
