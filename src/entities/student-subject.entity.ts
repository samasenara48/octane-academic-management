import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';

import { Student } from './student.entity';
import { Subject } from './subject.entity';

@Entity('student_subjects')
@Unique(['student', 'subject', 'academicYear'])
export class StudentSubject {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Student, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  student: Student;

  @ManyToOne(() => Subject, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  subject: Subject;

  @Column()
  academicYear: string;
}