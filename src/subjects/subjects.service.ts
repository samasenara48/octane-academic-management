import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Subject } from '../entities/subject.entity';
import { Grade } from '../entities/grade.entity';
import { Teacher } from '../entities/teacher.entity';
import { StudentSubject } from '../entities/student-subject.entity';

import {
  CreateSubjectDto,
  UpdateSubjectDto,
} from './subjects.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,

    @InjectRepository(Grade)
    private readonly gradeRepository: Repository<Grade>,

    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,

    @InjectRepository(StudentSubject)
    private readonly studentSubjectRepository: Repository<StudentSubject>,
  ) {}

  // ==========================================
  // CREATE SUBJECT
  // ==========================================

  async create(dto: CreateSubjectDto) {
    const grade = await this.gradeRepository.findOne({
      where: {
        id: dto.gradeId,
      },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    const teacher = await this.teacherRepository.findOne({
      where: {
        id: dto.teacherId,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const existingSubject = await this.subjectRepository.findOne({
      where: {
        name: dto.name,
        grade: {
          id: dto.gradeId,
        },
      },
    });

    if (existingSubject) {
      throw new ConflictException(
        'Subject already exists in this grade',
      );
    }

    const subject = this.subjectRepository.create({
      name: dto.name,
      description: dto.description,
      grade: grade,
      teacher: teacher,
    });

    return this.subjectRepository.save(subject);
  }

  // ==========================================
  // GET ALL SUBJECTS
  // ==========================================

  async findAll() {
    return this.subjectRepository.find({
      relations: {
        grade: true,
        teacher: true,
      },
    });
  }

  // ==========================================
  // GET SUBJECTS BY GRADE
  // ==========================================

  async findByGrade(gradeId: number) {
    const grade = await this.gradeRepository.findOne({
      where: {
        id: gradeId,
      },
    });

    if (!grade) {
      throw new NotFoundException('Grade not found');
    }

    return this.subjectRepository.find({
      where: {
        grade: {
          id: gradeId,
        },
      },

      relations: {
        grade: true,
        teacher: true,
      },
    });
  }

  // ==========================================
  // GET SUBJECT BY ID
  // ==========================================

  async findOne(id: number) {
    const subject = await this.subjectRepository.findOne({
      where: {
        id,
      },

      relations: {
        grade: true,
        teacher: true,
      },
    });

    if (!subject) {
      throw new NotFoundException('Subject not found');
    }

    return subject;
  }

  // ==========================================
  // UPDATE SUBJECT
  // ==========================================

  async update(
    id: number,
    dto: UpdateSubjectDto,
  ) {
    const subject = await this.findOne(id);

    // ------------------------------------------
    // Update Grade
    // ------------------------------------------

    if (dto.gradeId !== undefined) {
      const grade = await this.gradeRepository.findOne({
        where: {
          id: dto.gradeId,
        },
      });

      if (!grade) {
        throw new NotFoundException('Grade not found');
      }

      subject.grade = grade;
    }

    // ------------------------------------------
    // Update Teacher
    // ------------------------------------------

    if (dto.teacherId !== undefined) {
      const teacher = await this.teacherRepository.findOne({
        where: {
          id: dto.teacherId,
        },
      });

      if (!teacher) {
        throw new NotFoundException('Teacher not found');
      }

      subject.teacher = teacher;
    }

    // ------------------------------------------
    // Update Name
    // ------------------------------------------

    if (dto.name !== undefined) {
      subject.name = dto.name;
    }

    // ------------------------------------------
    // Update Description
    // ------------------------------------------

    if (dto.description !== undefined) {
      subject.description = dto.description;
    }

    // ------------------------------------------
    // Check duplicate subject in same grade
    // ------------------------------------------

    const gradeId = subject.grade?.id;

    if (subject.name && gradeId) {
      const duplicate = await this.subjectRepository.findOne({
        where: {
          name: subject.name,
          grade: {
            id: gradeId,
          },
        },
      });

      if (duplicate && duplicate.id !== subject.id) {
        throw new ConflictException(
          'Subject already exists in this grade',
        );
      }
    }

    return this.subjectRepository.save(subject);
  }

  // ==========================================
  // DELETE SUBJECT
  // ==========================================

  async remove(id: number) {
    const subject = await this.findOne(id);

    const enrolledStudents =
      await this.studentSubjectRepository.count({
        where: {
          subject: {
            id,
          },
        },
      });

    if (enrolledStudents > 0) {
      throw new ConflictException(
        'Cannot delete subject because students are enrolled in it',
      );
    }

    await this.subjectRepository.remove(subject);

    return {
      message: 'Subject deleted successfully',
    };
  }

  // ==========================================
  // GET ENROLLED STUDENTS
  // ==========================================

  async getStudents(id: number) {
    await this.findOne(id);

    const enrollments =
      await this.studentSubjectRepository.find({
        where: {
          subject: {
            id,
          },
        },

        relations: {
          student: true,
          subject: true,
        },
      });

    return enrollments.map(
      (enrollment) => enrollment.student,
    );
  }
}