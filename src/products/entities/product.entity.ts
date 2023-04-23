import { Exclude, Expose } from 'class-transformer';
import { User } from 'src/auth/entities/user.entity';
import { Payment } from 'src/invoices/entities/payment.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column({
    type: 'text',
  })
  description: string;

  @Column('float', {
    default: 0,
  })
  purchase_price: number;

  @Column('float', {
    default: 0,
  })
  sale_price: number;

  @Column('int', {
    default: 0,
  })
  stock: number;

  @ManyToOne(() => User, user => user.product, { eager: true, })
  user: User;

  @OneToMany(() => Payment, (payment) => payment.product)
  payment?: Payment;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at'})
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deletedAt: Date;
  @BeforeInsert()
  checkNameInsert() {
    this.name = this.name.toLowerCase();
  }

  @BeforeUpdate()
  checkNameUpdate() {
    this.name = this.name.toLowerCase();
  }
}
