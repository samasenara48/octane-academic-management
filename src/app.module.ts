import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './entities/user.entity'; import { Grade } from './entities/grade.entity'; import { Student } from './entities/student.entity'; import { Teacher } from './entities/teacher.entity'; import { Subject } from './entities/subject.entity'; import { StudentSubject } from './entities/student-subject.entity';
import { AuthModule } from './auth/auth.module'; import { GradesModule } from './grades/grades.module'; import { TeachersModule } from './teachers/teachers.module'; import { StudentsModule } from './students/students.module'; import { SubjectsModule } from './subjects/subjects.module'; import { EnrollmentModule } from './enrollment/enrollment.module';
@Module({imports:[ConfigModule.forRoot({isGlobal:true}),TypeOrmModule.forRoot({type:'mysql',host:process.env.DB_HOST||'localhost',port:Number(process.env.DB_PORT||3306),username:process.env.DB_USERNAME||'root',password:process.env.DB_PASSWORD||'',database:process.env.DB_NAME||'octane_academic_management',autoLoadEntities:true,synchronize:true}),TypeOrmModule.forFeature([User,Grade,Student,Teacher,Subject,StudentSubject]),AuthModule,GradesModule,TeachersModule,StudentsModule,SubjectsModule,EnrollmentModule,ServeStaticModule.forRoot({rootPath:join(__dirname,'..','public')})],controllers:[AppController],providers:[AppService]})
export class AppModule {}
