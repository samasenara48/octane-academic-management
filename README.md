# Octane Academic Management System

## Run
1. Create a MySQL database named `octane_academic_management` (or change `.env`).
2. Copy `.env.example` to `.env` and set MySQL credentials.
3. `npm install`
4. `npm run build`
5. `npm run start:dev`
6. In another terminal: `npm run seed:admin`

## URLs
- Website: http://localhost:3000
- Health: http://localhost:3000/api/health
- Swagger: http://localhost:3000/swagger

## Default admin
- Email: `admin@octane.com`
- Password: `Admin@123`

## Features
JWT access token (1h), refresh token (7d), bcrypt passwords, logout, `/auth/me`, role-based authorization, CRUD for grades/teachers/students/subjects, teacher-subject assignment, student enrollment rules, MySQL/TypeORM and Swagger documentation.
