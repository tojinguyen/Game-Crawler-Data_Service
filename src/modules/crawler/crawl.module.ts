// modules/crawl/crawl.module.ts
import { Module } from '@nestjs/common';
import { GooglePlayController } from './google-play-scrapper/google-play.controller';
import { GooglePlayService } from './google-play-scrapper/google-play.service';

@Module({
  controllers: [GooglePlayController],
  providers: [GooglePlayService],
  exports: [GooglePlayService],
})
export class CrawlModule {}
