// modules/crawl/crawl.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlService } from './google-play-scrapper/google-play.service';
import { App } from './google-play-scrapper/app.entity';

@Module({
  imports: [TypeOrmModule.forFeature([App])],
  providers: [CrawlService],
})
export class CrawlModule {}
