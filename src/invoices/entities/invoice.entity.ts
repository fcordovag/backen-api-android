import { User } from 'src/auth/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @OneToMany(() => Payment, (payment) => payment.invoice)
  @JoinTable()
  payments: Payment[];

  @ManyToOne(() => User, (user) => user.invoice, { eager: true })
  customer: User;
}
