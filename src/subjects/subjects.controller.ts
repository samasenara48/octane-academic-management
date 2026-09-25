import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import { SubjectsService } from './subjects.service';

import {
  CreateSubjectDto,
  UpdateSubjectDto,
} from './subjects.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller('subjects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubjectsController {

  constructor(
    private readonly subjectsService: SubjectsService,
  ) {}


  @Post()
  @Roles('admin')
  create(
    @Body() dto: CreateSubjectDto,
  ) {
    return this.subjectsService.create(dto);
  }


  @Get()
  findAll(
    @Query('gradeId') gradeId?: string,
  ) {

    if (gradeId) {

      return this.subjectsService.findByGrade(
        Number(gradeId),
      );
    }

    return this.subjectsService.findAll();
  }


  @Get(':id/students')
  getStudents(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.subjectsService.getStudents(id);
  }


  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.subjectsService.findOne(id);
  }


  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubjectDto,
  ) {
    return this.subjectsService.update(id, dto);
  }


  @Delete(':id')
  @Roles('admin')
  remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.subjectsService.remove(id);
  }
}