import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';

import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';

import { Teacher } from '../entities/teacher.entity';
import { Subject } from '../entities/subject.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    TypeOrmModule.forFeature([
      Teacher,
      Subject,
      User,
    ]),
  ],

  controllers: [TeachersController],

  providers: [TeachersService],

  exports: [TeachersService],
})
export class TeachersModule {}