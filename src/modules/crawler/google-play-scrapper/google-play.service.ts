import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import gplay, {
  IFnAppOptions,
  IFnDeveloperOptions,
  IFnListOptions,
  IFnDatasafetyOptions,
  IFnPermissionsOptions,
  IFnReviewsOptions,
  IFnSearchOptions,
  IFnSimilarOptions,
  IFnSuggestOptions,
} from 'google-play-scraper';

type SearchOptions = IFnSearchOptions;
type AppDetailsOptions = Omit<IFnAppOptions, 'appId'>;
type DeveloperOptions = Omit<IFnDeveloperOptions, 'devId'>;
type ListOptions = IFnListOptions;
type ReviewsOptions = Omit<IFnReviewsOptions, 'appId'>;
type SimilarOptions = Omit<IFnSimilarOptions, 'appId'>;
type SuggestOptions = Omit<IFnSuggestOptions, 'term'>;
type PermissionsOptions = Omit<IFnPermissionsOptions, 'appId'>;
type DataSafetyOptions = Omit<IFnDatasafetyOptions, 'appId'>;

@Injectable()
export class GooglePlayService {
  private readonly logger = new Logger(GooglePlayService.name);

  async searchApps(options: SearchOptions) {
    return gplay.search(options);
  }

  async getAppDetails(appId: string, options: AppDetailsOptions = {}) {
    return gplay.app({ appId, ...options });
  }

  async getDeveloperApps(devId: string, options: DeveloperOptions = {}) {
    return gplay.developer({ devId, ...options });
  }

  async listApps(options: ListOptions = {}) {
    return gplay.list(options);
  }

  async suggestApps(term: string, options: SuggestOptions = {}) {
    return gplay.suggest({ term, ...options });
  }

  async getAppReviews(appId: string, options: ReviewsOptions = {}) {
    return gplay.reviews({
      appId,
      sort: options.sort,
      num: options.num,
      country: options.country,
      lang: options.lang,
      paginate: options.paginate,
      nextPaginationToken: options.nextPaginationToken,
    });
  }

  async getSimilarApps(appId: string, options: SimilarOptions = {}) {
    return gplay.similar({ appId, ...options });
  }

  async getAppPermissions(appId: string, options: PermissionsOptions = {}) {
    return gplay.permissions({ appId, ...options });
  }

  getCollections() {
    return Object.entries(gplay.collection).map(([key, value]) => ({
      key,
      value,
    }));
  }

  getCategories() {
    return Object.entries(gplay.category).map(([key, value]) => ({
      key,
      value,
    }));
  }

  getSortOptions() {
    return Object.entries(gplay.sort).map(([key, value]) => ({ key, value }));
  }

  async getAppDataSafety(appId: string, options: DataSafetyOptions = {}) {
    return gplay.datasafety({ appId, ...options });
  }
}
