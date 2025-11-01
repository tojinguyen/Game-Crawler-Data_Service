import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import gplay from 'google-play-scraper';

@Injectable()
export class CrawlService {
  private readonly logger = new Logger(CrawlService.name);

  constructor() {}

  @Cron('*/10 * * * * *')
  async handleCron() {
    this.logger.log('🚀 Start crawl data from google play (every 10s)...');

    try {
      const result = await gplay.search({
        term: 'top free games',
        num: 10,
        country: 'us',
        lang: 'en',
      });

      this.logger.log(`✅ Found ${result.length} apps from Google Play.`);
      if (result && result.length > 0) {
        this.logger.log(JSON.stringify(result, null, 2));
      }
    } catch (err) {
      this.logger.error('❌ Lỗi khi crawl dữ liệu:', err);
    }
  }
}
