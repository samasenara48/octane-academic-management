import { IsEmail, IsOptional, IsString, MinLength, IsArray, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateTeacherDto { @ApiProperty() @IsString() fullName: string; @ApiProperty() @IsEmail() email: string; @ApiProperty({ minLength: 6 }) @IsString() @MinLength(6) password: string; @ApiPropertyOptional() @IsOptional() @IsString() phone?: string; }
export class UpdateTeacherDto { @ApiPropertyOptional() @IsOptional() @IsString() fullName?: string; @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string; @ApiPropertyOptional({ minLength: 6 }) @IsOptional() @IsString() @MinLength(6) password?: string; @ApiPropertyOptional() @IsOptional() @IsString() phone?: string; }
export class AssignSubjectsDto { @ApiProperty({ type: [Number], example: [1, 2] }) @IsArray() @IsInt({ each: true }) subjectIds: number[]; }
