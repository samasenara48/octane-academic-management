import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@ApiTags('Grades')
@Controller('grades')
export class GradesController {
  constructor(private readonly service: GradesService) {}
  @Get() @ApiOperation({ summary: 'Get all grades' }) findAll() { return this.service.findAll(); }
  @Get(':id') @ApiOperation({ summary: 'Get grade by ID' }) findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') @Post() @ApiBearerAuth() @ApiBody({ schema: { example: { name: 'Grade 1', number: 1, description: 'First grade' } } }) create(@Body() dto: any) { return this.service.create(dto); }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') @Patch(':id') @ApiBearerAuth() update(@Param('id', ParseIntPipe) id: number, @Body() dto: any) { return this.service.update(id, dto); }
  @UseGuards(JwtAuthGuard, RolesGuard) @Roles('admin') @Delete(':id') @ApiBearerAuth() remove(@Param('id', ParseIntPipe) id: number) { return this.service.remove(id); }
}
