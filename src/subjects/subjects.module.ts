import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';

import { Subject } from '../entities/subject.entity';
import { Grade } from '../entities/grade.entity';
import { Teacher } from '../entities/teacher.entity';
import { StudentSubject } from '../entities/student-subject.entity';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    TypeOrmModule.forFeature([
      Subject,
      Grade,
      Teacher,
      StudentSubject,
    ]),
  ],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [SubjectsService],
})
export class SubjectsModule {}