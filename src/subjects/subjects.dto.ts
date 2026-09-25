import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSubjectDto {

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1)
  gradeId: number;

  @IsInt()
  @Min(1)
  teacherId: number;
}


export class UpdateSubjectDto {

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  gradeId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  teacherId?: number;
}