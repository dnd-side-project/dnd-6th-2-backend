import { Test, TestingModule } from '@nestjs/testing';
import { MyArticleController } from './my-article.controller';

describe('MyArticleController', () => {
  let controller: MyArticleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyArticleController],
    }).compile();

    controller = module.get<MyArticleController>(MyArticleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
