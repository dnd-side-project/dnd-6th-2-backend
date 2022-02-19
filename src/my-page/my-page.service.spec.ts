import { Test, TestingModule } from '@nestjs/testing';
import { MyPageService } from './my-page.service';

describe('MyPageService', () => {
  let service: MyPageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyPageService],
    }).compile();

    service = module.get<MyPageService>(MyPageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
