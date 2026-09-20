import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Teacher } from '../entities/teacher.entity';
import { User, UserRole } from '../entities/user.entity';
import { Subject } from '../entities/subject.entity';
import { CreateTeacherDto, UpdateTeacherDto } from './teachers.dto';

@Injectable()
export class TeachersService {
  constructor(@InjectRepository(Teacher) private teacherRepo: Repository<Teacher>, @InjectRepository(User) private userRepo: Repository<User>, @InjectRepository(Subject) private subjectRepo: Repository<Subject>) {}
  async findAll() { return this.teacherRepo.find({ relations: { user: true, subjects: { grade: true, teacher: { user: true } } } }); }
  async findOne(id: number) { const x = await this.teacherRepo.findOne({ where: { id }, relations: { user: true, subjects: { grade: true, teacher: { user: true } } } }); if (!x) throw new NotFoundException('Teacher not found'); return x; }
  async create(dto: CreateTeacherDto) {
    if (await this.userRepo.findOne({ where: { email: dto.email } })) throw new ConflictException('Email is already registered');
    const user = await this.userRepo.save(this.userRepo.create({ fullName: dto.fullName, email: dto.email, password: await bcrypt.hash(dto.password, 10), phone: dto.phone, role: UserRole.TEACHER }));
    return this.teacherRepo.save(this.teacherRepo.create({ user }));
  }
  async update(id: number, dto: UpdateTeacherDto) { const teacher = await this.findOne(id); if (dto.email && dto.email !== teacher.user.email && await this.userRepo.findOne({ where: { email: dto.email } })) throw new ConflictException('Email is already registered'); Object.assign(teacher.user, { fullName: dto.fullName ?? teacher.user.fullName, email: dto.email ?? teacher.user.email, phone: dto.phone ?? teacher.user.phone }); if (dto.password) teacher.user.password = await bcrypt.hash(dto.password, 10); await this.userRepo.save(teacher.user); return this.findOne(id); }
  async remove(id: number) { const teacher = await this.findOne(id); await this.teacherRepo.remove(teacher); await this.userRepo.delete(teacher.user.id); return { message: 'Teacher deleted successfully' }; }
  async assignSubjects(id: number, subjectIds: number[]) { const teacher = await this.findOne(id); const subjects = await this.subjectRepo.find({ where: subjectIds.map(s => ({ id: s })) }); if (subjects.length !== subjectIds.length) throw new NotFoundException('One or more subjects not found'); for (const s of subjects) s.teacher = teacher; await this.subjectRepo.save(subjects); return this.findOne(id); }
  async getSubjects(id: number) { const teacher = await this.findOne(id); return teacher.subjects; }
}
