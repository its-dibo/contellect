import { BasicEntity } from '#dto/basic.entity';
import { Column, Entity } from 'typeorm';

@Entity('users')
export class UserEntity extends BasicEntity {
  /**
   * @example user1
   */
  @Column({ nullable: false })
  username: string;

  @Column({ select: false, nullable: false })
  pass: string;
}
