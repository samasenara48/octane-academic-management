import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from './entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepository = app.get<Repository<User>>(
    getRepositoryToken(User),
  );

  const existingAdmin = await userRepository.findOne({
    where: {
      email: 'admin@octane.com',
    },
  });

  if (existingAdmin) {
    console.log('Admin already exists.');
    await app.close();
    return;
  }

  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const admin = userRepository.create({
  fullName: 'Octane Admin',
  email: 'admin@octane.com',
  password: hashedPassword,
  role: UserRole.ADMIN,

  });

  await userRepository.save(admin);

  console.log('=================================');
  console.log('Admin account created successfully');
  console.log('Email: admin@octane.com');
  console.log('Password: Admin@123');
  console.log('=================================');

  await app.close();
}

bootstrap();