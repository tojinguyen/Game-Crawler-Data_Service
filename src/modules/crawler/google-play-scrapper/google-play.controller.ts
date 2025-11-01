import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import gplay from 'google-play-scraper';
import type { IFnListOptions, IFnReviewsOptions } from 'google-play-scraper';
import { GooglePlayService } from './google-play.service';

const COLLECTION_MAP = gplay.collection as unknown as Record<
  string,
  IFnListOptions['collection']
>;
const CATEGORY_MAP = gplay.category as unknown as Record<
  string,
  IFnListOptions['category']
>;
const SORT_MAP = gplay.sort as unknown as Record<
  string,
  IFnReviewsOptions['sort']
>;
const COLLECTION_KEYS = Object.keys(COLLECTION_MAP);
const CATEGORY_KEYS = Object.keys(CATEGORY_MAP);
const SORT_KEYS = Object.keys(SORT_MAP);
const PRICE_KEYS = ['all', 'free', 'paid'] as const;
type PriceKey = (typeof PRICE_KEYS)[number];
const PRICE_OPTIONS: Record<PriceKey, PriceKey> = {
  all: 'all',
  free: 'free',
  paid: 'paid',
};

@ApiTags('google-play')
@Controller('google-play')
export class GooglePlayController {
  constructor(private readonly googlePlayService: GooglePlayService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search apps on Google Play by term' })
  @ApiQuery({ name: 'term', required: true, description: 'Search keyword' })
  @ApiQuery({
    name: 'num',
    required: false,
    type: Number,
    description: 'Maximum number of results',
  })
  @ApiQuery({
    name: 'country',
    required: false,
    description: 'Two letter country code',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Two letter language code',
  })
  @ApiQuery({
    name: 'fullDetail',
    required: false,
    type: Boolean,
    description: 'Return full app detail',
  })
  @ApiQuery({
    name: 'price',
    required: false,
    enum: PRICE_KEYS,
    description: 'Filter by price',
  })
  async search(
    @Query('term') term?: string,
    @Query('num') num?: string,
    @Query('country') country?: string,
    @Query('lang') lang?: string,
    @Query('fullDetail') fullDetail?: string,
    @Query('price') price?: string,
  ) {
    const trimmedTerm = term?.trim();
    if (!trimmedTerm) {
      throw new BadRequestException('term query parameter is required');
    }

    const parsedNum = this.parseNumber(num, 'num');
    const parsedFullDetail = this.parseBoolean(fullDetail, 'fullDetail');
    const resolvedPrice = price
      ? this.resolveEnumValue(
          PRICE_OPTIONS as Record<string, PriceKey>,
          price,
          'price',
        )
      : undefined;

    return this.googlePlayService.searchApps({
      term: trimmedTerm,
      num: parsedNum,
      country,
      lang,
      fullDetail: parsedFullDetail,
      price: resolvedPrice,
    });
  }

  @Get('apps/:appId')
  @ApiOperation({ summary: 'Retrieve app detail from Google Play' })
  @ApiParam({
    name: 'appId',
    description: 'Unique application id (e.g. com.supercell.clashofclans)',
  })
  @ApiQuery({
    name: 'country',
    required: false,
    description: 'Two letter country code',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Two letter language code',
  })
  async getAppDetail(
    @Param('appId') appId: string,
    @Query('country') country?: string,
    @Query('lang') lang?: string,
  ) {
    const trimmedAppId = this.requiredParam(appId, 'appId');

    return this.googlePlayService.getAppDetails(trimmedAppId, {
      country,
      lang,
    });
  }

  @Get('developers/:devId/apps')
  @ApiOperation({ summary: 'List apps by developer id' })
  @ApiParam({
    name: 'devId',
    description: 'Developer id as shown in play.google.com/store/apps/dev?id=',
  })
  @ApiQuery({
    name: 'num',
    required: false,
    type: Number,
    description: 'Maximum number of results',
  })
  @ApiQuery({
    name: 'country',
    required: false,
    description: 'Two letter country code',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Two letter language code',
  })
  @ApiQuery({
    name: 'fullDetail',
    required: false,
    type: Boolean,
    description: 'Return full app detail',
  })
  async getDeveloperApps(
    @Param('devId') devId: string,
    @Query('num') num?: string,
    @Query('country') country?: string,
    @Query('lang') lang?: string,
    @Query('fullDetail') fullDetail?: string,
  ) {
    const trimmedDevId = this.requiredParam(devId, 'devId');

    return this.googlePlayService.getDeveloperApps(trimmedDevId, {
      num: this.parseNumber(num, 'num'),
      country,
      lang,
      fullDetail: this.parseBoolean(fullDetail, 'fullDetail'),
    });
  }

  @Get('list')
  @ApiOperation({ summary: 'Browse curated lists (top free, top paid, etc.)' })
  @ApiQuery({
    name: 'collection',
    required: false,
    enum: COLLECTION_KEYS,
    description: 'Collection key to retrieve',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    enum: CATEGORY_KEYS,
    description: 'App category filter',
  })
  @ApiQuery({
    name: 'num',
    required: false,
    type: Number,
    description: 'Maximum number of results',
  })
  @ApiQuery({
    name: 'country',
    required: false,
    description: 'Two letter country code',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Two letter language code',
  })
  @ApiQuery({
    name: 'fullDetail',
    required: false,
    type: Boolean,
    description: 'Return full app detail',
  })
  async listApps(
    @Query('collection') collection?: string,
    @Query('category') category?: string,
    @Query('num') num?: string,
    @Query('country') country?: string,
    @Query('lang') lang?: string,
    @Query('fullDetail') fullDetail?: string,
  ) {
    const resolvedCollection =
      this.resolveEnumValue(COLLECTION_MAP, collection, 'collection') ??
      COLLECTION_MAP.TOP_FREE;
    const resolvedCategory = this.resolveEnumValue(
      CATEGORY_MAP,
      category,
      'category',
    );

    return this.googlePlayService.listApps({
      collection: resolvedCollection as IFnListOptions['collection'],
      category: resolvedCategory as IFnListOptions['category'] | undefined,
      num: this.parseNumber(num, 'num'),
      country,
      lang,
      fullDetail: this.parseBoolean(fullDetail, 'fullDetail'),
    });
  }

  @Get('apps/:appId/reviews')
  @ApiOperation({ summary: 'Retrieve store reviews for an app' })
  @ApiParam({ name: 'appId', description: 'Unique application id' })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: SORT_KEYS,
    description: 'Sort order for reviews',
  })
  @ApiQuery({
    name: 'num',
    required: false,
    type: Number,
    description: 'Number of reviews to fetch',
  })
  @ApiQuery({
    name: 'country',
    required: false,
    description: 'Two letter country code',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Two letter language code',
  })
  @ApiQuery({
    name: 'paginate',
    required: false,
    type: Boolean,
    description: 'Enable pagination tokens in response',
  })
  @ApiQuery({
    name: 'nextPaginationToken',
    required: false,
    description: 'Token returned by a previous reviews call',
  })
  async getAppReviews(
    @Param('appId') appId: string,
    @Query('sort') sort?: string,
    @Query('num') num?: string,
    @Query('country') country?: string,
    @Query('lang') lang?: string,
    @Query('paginate') paginate?: string,
    @Query('nextPaginationToken') nextPaginationToken?: string,
  ) {
    const trimmedAppId = this.requiredParam(appId, 'appId');
    const resolvedSort = this.resolveEnumValue(SORT_MAP, sort, 'sort');

    return this.googlePlayService.getAppReviews(trimmedAppId, {
      sort: resolvedSort,
      num: this.parseNumber(num, 'num'),
      country,
      lang,
      paginate: this.parseBoolean(paginate, 'paginate'),
      nextPaginationToken: this.optionalString(nextPaginationToken),
    });
  }

  @Get('apps/:appId/similar')
  @ApiOperation({ summary: 'Find similar apps to the given app id' })
  @ApiParam({ name: 'appId', description: 'Unique application id' })
  @ApiQuery({
    name: 'country',
    required: false,
    description: 'Two letter country code',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Two letter language code',
  })
  @ApiQuery({
    name: 'fullDetail',
    required: false,
    type: Boolean,
    description: 'Return full app detail',
  })
  async getSimilarApps(
    @Param('appId') appId: string,
    @Query('country') country?: string,
    @Query('lang') lang?: string,
    @Query('fullDetail') fullDetail?: string,
  ) {
    const trimmedAppId = this.requiredParam(appId, 'appId');

    return this.googlePlayService.getSimilarApps(trimmedAppId, {
      country,
      lang,
      fullDetail: this.parseBoolean(fullDetail, 'fullDetail'),
    });
  }

  @Get('apps/:appId/permissions')
  @ApiOperation({ summary: 'List permissions requested by an app' })
  @ApiParam({ name: 'appId', description: 'Unique application id' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Two letter language code',
  })
  @ApiQuery({
    name: 'short',
    required: false,
    description: 'When set to true, returns compact permission groups',
  })
  async getAppPermissions(
    @Param('appId') appId: string,
    @Query('lang') lang?: string,
    @Query('short') shortParam?: string,
  ) {
    const trimmedAppId = this.requiredParam(appId, 'appId');

    const shortValue = this.parseBoolean(shortParam, 'short');

    return this.googlePlayService.getAppPermissions(trimmedAppId, {
      lang,
      short: typeof shortValue === 'boolean' ? String(shortValue) : undefined,
    });
  }

  @Get('apps/:appId/data-safety')
  @ApiOperation({
    summary: 'Fetch declared data safety information for an app',
  })
  @ApiParam({ name: 'appId', description: 'Unique application id' })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Two letter language code',
  })
  async getAppDataSafety(
    @Param('appId') appId: string,
    @Query('lang') lang?: string,
  ) {
    const trimmedAppId = this.requiredParam(appId, 'appId');

    return this.googlePlayService.getAppDataSafety(trimmedAppId, { lang });
  }

  @Get('suggest')
  @ApiOperation({
    summary: 'Retrieve autocomplete suggestions based on a search term',
  })
  @ApiQuery({
    name: 'term',
    required: true,
    description: 'Partial search term',
  })
  @ApiQuery({
    name: 'country',
    required: false,
    description: 'Two letter country code',
  })
  @ApiQuery({
    name: 'lang',
    required: false,
    description: 'Two letter language code',
  })
  async suggest(
    @Query('term') term?: string,
    @Query('country') country?: string,
    @Query('lang') lang?: string,
  ) {
    const trimmedTerm = term?.trim();
    if (!trimmedTerm) {
      throw new BadRequestException('term query parameter is required');
    }

    return this.googlePlayService.suggestApps(trimmedTerm, { country, lang });
  }

  @Get('collections')
  @ApiOperation({ summary: 'List available collection constants' })
  async getCollections() {
    return this.googlePlayService.getCollections();
  }

  @Get('categories')
  @ApiOperation({ summary: 'List available category constants' })
  async getCategories() {
    return this.googlePlayService.getCategories();
  }

  @Get('reviews/sort-options')
  @ApiOperation({ summary: 'List available review sort constants' })
  async getReviewSortOptions() {
    return this.googlePlayService.getSortOptions();
  }

  private parseNumber(value: string | undefined, fieldName: string) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      throw new BadRequestException(`${fieldName} must be a valid number`);
    }

    return parsed;
  }

  private parseBoolean(value: string | undefined, fieldName: string) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const normalized = value.toLowerCase();
    if (normalized === 'true' || normalized === '1') {
      return true;
    }

    if (normalized === 'false' || normalized === '0') {
      return false;
    }

    throw new BadRequestException(
      `${fieldName} must be either true/false or 1/0`,
    );
  }

  private resolveEnumValue<T>(
    enumMap: Record<string, T>,
    value: string | undefined,
    fieldName: string,
  ): T | undefined {
    if (!value) {
      return undefined;
    }

    const direct = enumMap[value];
    if (direct !== undefined) {
      return direct;
    }

    const normalizedKey = value.replace(/[-\s]/g, '_').toUpperCase();
    const normalized = enumMap[normalizedKey];
    if (normalized !== undefined) {
      return normalized;
    }

    for (const enumValue of Object.values(enumMap)) {
      if (typeof enumValue === 'string') {
        if (
          enumValue.toUpperCase() === normalizedKey ||
          enumValue.toLowerCase() === value.toLowerCase()
        ) {
          return enumValue;
        }
      }

      if (typeof enumValue === 'number' && `${enumValue}` === value) {
        return enumValue;
      }
    }

    throw new BadRequestException(
      `${fieldName} must be one of: ${Object.keys(enumMap).join(', ')}`,
    );
  }

  private optionalString(value: string | undefined) {
    if (value === undefined || value === null) {
      return undefined;
    }

    const trimmed = value.trim();
    if (trimmed === '') {
      return undefined;
    }

    return trimmed;
  }

  private requiredParam(value: string, fieldName: string) {
    const trimmed = value?.trim();
    if (!trimmed) {
      throw new BadRequestException(`${fieldName} is required`);
    }

    return trimmed;
  }
}
