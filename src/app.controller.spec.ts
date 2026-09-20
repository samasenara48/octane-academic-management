import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = module.get<AppController>(AppController);
  });

  describe('getHealth', () => {
    it('should return API health information', () => {
      expect(appController.getHealth()).toEqual({
        company: 'Octane',
        project: 'Academic Management System',
        status: 'Running',
      });
    });
  });
});