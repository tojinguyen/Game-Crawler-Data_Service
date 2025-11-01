// modules/crawl/crawl.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import gplay from 'google-play-scraper';
import { App } from './app.entity';

@Injectable()
export class CrawlService {
  private readonly logger = new Logger(CrawlService.name);

  constructor(
    @InjectRepository(App)
    private readonly appRepo: Repository<App>,
  ) {}

  // Cron job chạy mỗi 0h (00:00)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    this.logger.log('🚀 Bắt đầu crawl dữ liệu Google Play...');

    try {
      const result = await gplay.search({
        term: 'top free games',
        num: 10,
        country: 'us',
        lang: 'en',
      });

      const apps = result.map((a) =>
        this.appRepo.create({
          appId: a.appId,
          title: a.title,
          developer: a.developer,
          score: a.score,
        }),
      );

      await this.appRepo.save(apps);
      this.logger.log(`✅ Đã lưu ${apps.length} ứng dụng vào database.`);
    } catch (err) {
      this.logger.error('❌ Lỗi khi crawl dữ liệu:', err);
    }
  }
}
