import { Test, TestingModule } from '@nestjs/testing';
import { MyArticleService } from './my-article.service';

describe('MyArticleService', () => {
  let service: MyArticleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyArticleService],
    }).compile();

    service = module.get<MyArticleService>(MyArticleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
