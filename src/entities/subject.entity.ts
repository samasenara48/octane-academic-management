import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Grade } from './grade.entity';
import { Teacher } from './teacher.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Grade, {
    nullable: false,
  })
  @JoinColumn()
  grade: Grade;

  @ManyToOne(() => Teacher, {
    nullable: false,
  })
  @JoinColumn()
  teacher: Teacher;
}