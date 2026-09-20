import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { AssignSubjectsDto, CreateTeacherDto, UpdateTeacherDto } from './teachers.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; import { RolesGuard } from '../common/roles.guard'; import { Roles } from '../common/roles.decorator';
@ApiTags('Teachers') @ApiBearerAuth() @UseGuards(JwtAuthGuard, RolesGuard) @Controller('teachers')
export class TeachersController {
 constructor(private readonly service: TeachersService) {}
 @Get() @Roles('admin','teacher') findAll(){ return this.service.findAll(); }
 @Get(':id') @Roles('admin','teacher') findOne(@Param('id',ParseIntPipe) id:number){ return this.service.findOne(id); }
 @Post() @Roles('admin') create(@Body() dto:CreateTeacherDto){ return this.service.create(dto); }
 @Patch(':id') @Roles('admin') update(@Param('id',ParseIntPipe) id:number,@Body() dto:UpdateTeacherDto){ return this.service.update(id,dto); }
 @Delete(':id') @Roles('admin') remove(@Param('id',ParseIntPipe) id:number){ return this.service.remove(id); }
 @Post(':id/subjects') @Roles('admin') assign(@Param('id',ParseIntPipe) id:number,@Body() dto:AssignSubjectsDto){ return this.service.assignSubjects(id,dto.subjectIds); }
 @Get(':id/subjects') @Roles('admin','teacher') subjects(@Param('id',ParseIntPipe) id:number){ return this.service.getSubjects(id); }
}
