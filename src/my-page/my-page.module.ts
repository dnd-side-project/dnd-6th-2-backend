import { Module } from '@nestjs/common';
import { MyPageController } from './my-page.controller';
import { MyPageService } from './my-page.service';

@Module({
  controllers: [MyPageController],
  providers: [MyPageService],
})
export class MyPageModule {}
