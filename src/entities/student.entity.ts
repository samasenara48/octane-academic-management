import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { User } from './user.entity';
import { Grade } from './grade.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column()
  academicYear: string;

  @ManyToOne(() => Grade, {
    nullable: false,
  })
  @JoinColumn()
  grade: Grade;
}