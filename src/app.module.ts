import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CrawlModule } from './modules/crawler/crawl.module';

@Module({
  imports: [ScheduleModule.forRoot(), CrawlModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
