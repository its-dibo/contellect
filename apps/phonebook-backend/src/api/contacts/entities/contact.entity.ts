import { BasicEntity } from '#dto/basic.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('contacts')
export class ContactEntity extends BasicEntity {
  /**
   * @example John
   */
  @Column({ nullable: false })
  name: string;

  /**
   * @example "0123456789"
   */
  @Column({ nullable: false })
  phone: string;

  /**
   * @example "Florida, USA"
   */
  @Column({ nullable: true })
  address: string;

  /**
   * @example "any arbitrary notes"
   */
  @Column({ nullable: true })
  notes: string;
}
