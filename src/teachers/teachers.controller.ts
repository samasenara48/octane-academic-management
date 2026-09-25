import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { TeachersService } from './teachers.service';
import {
  CreateTeacherDto,
  UpdateTeacherDto,
} from './teachers.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller('teachers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeachersController {

  constructor(
    private readonly teachersService: TeachersService,
  ) {}


  @Post()
  @Roles('admin')
  create(
    @Body() dto: CreateTeacherDto,
  ) {
    return this.teachersService.create(dto);
  }


  @Get()
  findAll() {
    return this.teachersService.findAll();
  }


  @Get(':id/subjects')
  getSubjects(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.teachersService.getSubjects(id);
  }


  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.teachersService.findOne(id);
  }


  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTeacherDto,
  ) {
    return this.teachersService.update(id, dto);
  }


  @Delete(':id')
  @Roles('admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.teachersService.remove(id);
  }
}