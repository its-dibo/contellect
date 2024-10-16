import { DB } from './db.dto';

export interface User extends DB {
  auth_token: string;
  username: string;
}
