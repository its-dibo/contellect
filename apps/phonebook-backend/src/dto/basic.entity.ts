import { ApiHideProperty } from '@nestjs/swagger';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

export class BasicEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiHideProperty()
  id: string;

  @CreateDateColumn()
  @ApiHideProperty()
  created_at: Date;

  @UpdateDateColumn()
  @ApiHideProperty()
  updated_at: Date;

  /**
   * for soft delete
   */
  @DeleteDateColumn()
  @ApiHideProperty()
  deleted_at: Date;

  /**
   * the version number of the updated row
   * @example 1
   */
  @VersionColumn()
  @ApiHideProperty()
  _version: number;
}
