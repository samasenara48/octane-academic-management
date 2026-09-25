import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Teacher } from '../entities/teacher.entity';
import { Subject } from '../entities/subject.entity';
import {
  User,
  UserRole,
} from '../entities/user.entity';

import {
  CreateTeacherDto,
  UpdateTeacherDto,
} from './teachers.dto';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,

    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ==========================================
  // CREATE TEACHER
  // ==========================================

  async create(
    createTeacherDto: CreateTeacherDto,
  ) {
    // Check if email already exists
    const existingUser =
      await this.userRepository.findOne({
        where: {
          email: createTeacherDto.email,
        },
      });

    if (existingUser) {
      throw new ConflictException(
        'Teacher email already exists',
      );
    }

    // Create User
    const user =
      this.userRepository.create({
        email: createTeacherDto.email,
        fullName: createTeacherDto.fullName,
        phone: createTeacherDto.phone,
        password: '',
        role: UserRole.TEACHER,
      });

    const savedUser =
      await this.userRepository.save(user);

    // Create Teacher
    const teacher =
      this.teacherRepository.create({
        user: savedUser,
      });

    const savedTeacher =
      await this.teacherRepository.save(teacher);

    return this.findOne(savedTeacher.id);
  }

  // ==========================================
  // GET ALL TEACHERS
  // ==========================================

  async findAll() {
    return this.teacherRepository.find({
      relations: {
        user: true,
        subjects: true,
      },
    });
  }

  // ==========================================
  // GET TEACHER BY ID
  // ==========================================

  async findOne(id: number) {
    const teacher =
      await this.teacherRepository.findOne({
        where: {
          id,
        },

        relations: {
          user: true,
          subjects: true,
        },
      });

    if (!teacher) {
      throw new NotFoundException(
        'Teacher not found',
      );
    }

    return teacher;
  }

  // ==========================================
  // UPDATE TEACHER
  // ==========================================

  async update(
    id: number,
    updateTeacherDto: UpdateTeacherDto,
  ) {
    const teacher =
      await this.findOne(id);

    if (!teacher.user) {
      throw new NotFoundException(
        'Teacher user not found',
      );
    }

    // Check email uniqueness
    if (
      updateTeacherDto.email &&
      updateTeacherDto.email !==
        teacher.user.email
    ) {
      const existingUser =
        await this.userRepository.findOne({
          where: {
            email: updateTeacherDto.email,
          },
        });

      if (existingUser) {
        throw new ConflictException(
          'Teacher email already exists',
        );
      }
    }

    // Update full name
    if (
      updateTeacherDto.fullName !==
      undefined
    ) {
      teacher.user.fullName =
        updateTeacherDto.fullName;
    }

    // Update email
    if (
      updateTeacherDto.email !==
      undefined
    ) {
      teacher.user.email =
        updateTeacherDto.email;
    }

    // Update phone
    if (
      updateTeacherDto.phone !==
      undefined
    ) {
      teacher.user.phone =
        updateTeacherDto.phone;
    }

    await this.userRepository.save(
      teacher.user,
    );

    return this.findOne(id);
  }

  // ==========================================
  // DELETE TEACHER
  // ==========================================

  async remove(id: number) {
    const teacher =
      await this.findOne(id);

    // Check if teacher has subjects
    const subjects =
      await this.subjectRepository.count({
        where: {
          teacher: {
            id,
          },
        },
      });

    if (subjects > 0) {
      throw new ConflictException(
        'Cannot delete teacher because they are assigned to subjects',
      );
    }

    const user = teacher.user;

    // Delete Teacher
    await this.teacherRepository.remove(
      teacher,
    );

    // Delete linked User
    if (user) {
      await this.userRepository.remove(user);
    }

    return {
      message:
        'Teacher deleted successfully',
    };
  }

  // ==========================================
  // GET TEACHER SUBJECTS
  // ==========================================

  async getSubjects(id: number) {
    await this.findOne(id);

    return this.subjectRepository.find({
      where: {
        teacher: {
          id,
        },
      },

      relations: {
        grade: true,
        teacher: {
          user: true,
        },
      },
    });
  }
}