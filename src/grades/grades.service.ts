import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from '../entities/grade.entity';

@Injectable()
export class GradesService {
  constructor(@InjectRepository(Grade) private readonly repo: Repository<Grade>) {}
  findAll() { return this.repo.find({ order: { number: 'ASC' } }); }
  async findOne(id: number) { const x = await this.repo.findOne({ where: { id } }); if (!x) throw new NotFoundException('Grade not found'); return x; }
  async create(dto: any) { const exists = await this.repo.findOne({ where: [{ name: dto.name }, { number: dto.number }] }); if (exists) throw new ConflictException('Grade name or number already exists'); return this.repo.save(this.repo.create(dto)); }
  async update(id: number, dto: any) { const x = await this.findOne(id); Object.assign(x, dto); return this.repo.save(x); }
  async remove(id: number) { const x = await this.findOne(id); await this.repo.remove(x); return { message: 'Grade deleted successfully' }; }
}
