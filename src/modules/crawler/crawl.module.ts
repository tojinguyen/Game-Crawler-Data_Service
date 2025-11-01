// modules/crawl/crawl.module.ts
import { Module } from '@nestjs/common';
import { CrawlService } from './google-play-scrapper/google-play.service';

@Module({
  providers: [CrawlService],
})
export class CrawlModule {}
