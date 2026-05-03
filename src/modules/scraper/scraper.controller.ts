import { Controller, Post, Body, BadRequestException, Res } from '@nestjs/common';
import { ScraperService } from './scraper.service';
import { Response } from 'express';

@Controller('scraper')
export class ScraperController {
  constructor(private readonly scraperService: ScraperService) {}

  @Post('analyze')
  async analyze(@Body('url') url: string) {
    if (!url) {
      throw new BadRequestException('URL is required');
    }

    try {
      return await this.scraperService.scrape(url);
    } catch (error) {
      throw new BadRequestException(`Failed to scrape: ${error.message}`);
    }
  }

  @Post('download')
  async download(@Body('urls') urls: string[], @Res() res: Response) {
    if (!urls || !Array.isArray(urls)) {
      throw new BadRequestException('URLs array is required');
    }

    try {
      await this.scraperService.createZip(urls, res);
    } catch (error) {
      throw new BadRequestException(`Failed to create ZIP: ${error.message}`);
    }
  }
}
