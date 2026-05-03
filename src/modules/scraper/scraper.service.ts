import { Injectable, Logger } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as archiver from 'archiver';
import axios from 'axios';
import { Response } from 'express';

/**
 * Service responsible for web scraping operations and archive creation.
 * Uses Puppeteer for dynamic content rendering and archiver for ZIP generation.
 */
@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  /**
   * Scrapes the provided URL for images, links, videos, and H1 tags.
   * Handles lazy-loading by auto-scrolling and special-cases YouTube/Vimeo.
   * @param url The website URL to analyze
   */
  async scrape(url: string) {
    this.logger.log(`🔍 Scraping URL: ${url}`);

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ],
    });

    try {
      const page = await browser.newPage();

      // Set realistic User-Agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Set more comprehensive headers to avoid bot detection
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'en-US,en;q=0.9',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      });

      await page.setViewport({ width: 1440, height: 900 });
      
      try {
        await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      } catch (e) {
        this.logger.warn(`Navigation timeout or error for ${url}, proceeding anyway...`);
        await page.waitForTimeout(5000); // Wait a bit more if networkidle failed
      }

      // Auto-scroll to trigger lazy loading
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight || totalHeight > 5000) { // Limit to 5k pixels or end
              clearInterval(timer);
              resolve(true);
            }
          }, 100);
        });
      });

      // Extract Images (Improved)
      const images = await page.evaluate(() => {
        const results = new Set<string>();

        // Check all images
        document.querySelectorAll('img').forEach((img) => {
          const src = img.src || img.currentSrc;
          if (src && src.startsWith('http')) results.add(src);

          // Handle srcset (pick the last one usually highest quality)
          if (img.srcset) {
            const sources = img.srcset.split(',').map(s => s.trim().split(' ')[0]);
            sources.forEach(src => {
              if (src.startsWith('http')) results.add(src);
              else if (src.startsWith('/')) results.add(window.location.origin + src);
            });
          }

          // Handle data-src or data-original (lazy loading)
          ['data-src', 'data-original', 'data-lazy', 'data-fallback', 'data-original-res'].forEach(attr => {
            const val = img.getAttribute(attr);
            if (val) {
              if (val.startsWith('http')) results.add(val);
              else if (val.startsWith('/')) results.add(window.location.origin + val);
              else if (val.startsWith('//')) results.add('https:' + val);
            }
          });
        });

        // Check picture tags
        document.querySelectorAll('picture source').forEach((source: any) => {
          if (source.srcset) {
            const sources = source.srcset.split(',').map(s => s.trim().split(' ')[0]);
            sources.forEach(src => {
              if (src.startsWith('http')) results.add(src);
            });
          }
        });

        return Array.from(results);
      });

      // Extract Links
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a'))
          .map((a) => ({ text: a.innerText.trim(), href: a.href }))
          .filter((link) => link.href && link.href.startsWith('http'));
      });

      // Extract Videos (Improved)
      const videos = await page.evaluate(() => {
        const results = new Set<string>();

        document.querySelectorAll('video').forEach(v => {
          if (v.src && !v.src.startsWith('blob:')) results.add(v.src);
          v.querySelectorAll('source').forEach(s => {
            if (s.src && !s.src.startsWith('blob:')) results.add(s.src);
          });
        });

        document.querySelectorAll('iframe').forEach(iframe => {
          if (iframe.src && (iframe.src.includes('youtube.com') || iframe.src.includes('vimeo.com') || iframe.src.includes('video'))) {
            results.add(iframe.src);
          }
        });

        return Array.from(results);
      });

      // Special handling for YouTube/Vimeo URLs directly
      if (url.includes('youtube.com/watch') || url.includes('youtu.be/')) {
        const videoId = url.includes('v=')
          ? url.split('v=')[1]?.split('&')[0]
          : url.split('/').pop()?.split('?')[0];

        if (videoId) {
          const ytUrl = `https://www.youtube.com/embed/${videoId}`;
          if (!videos.includes(ytUrl)) videos.push(ytUrl);
          const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
          if (!images.includes(thumbUrl)) images.push(thumbUrl);
        }
      } else if (url.includes('vimeo.com/')) {
        const vimeoId = url.split('/').pop()?.split('?')[0];
        if (vimeoId && !isNaN(Number(vimeoId))) {
          const vimeoUrl = `https://player.vimeo.com/video/${vimeoId}`;
          if (!videos.includes(vimeoUrl)) videos.push(vimeoUrl);
        }
      }

      // Extract H1 Tags
      const h1s = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('h1'))
          .map((h1) => h1.innerText.trim())
          .filter((text) => text.length > 0);
      });

      return {
        images,
        links,
        videos,
        h1s,
      };
    } catch (error) {
      this.logger.error(`❌ Failed to scrape ${url}: ${error.message}`);
      throw error;
    } finally {
      await browser.close();
    }
  }

  /**
   * Creates a ZIP archive containing the provided media URLs and streams it to the response.
   * @param urls Array of media URLs to include in the ZIP
   * @param res Express Response object to pipe the archive to
   */
  async createZip(urls: string[], res: Response) {
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.on('error', (err) => {
      this.logger.error(`Archive error: ${err.message}`);
      res.status(500).send({ error: 'Failed to create archive' });
    });

    res.attachment('scraped-media.zip');
    archive.pipe(res);

    for (const [index, url] of urls.entries()) {
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
        const extension = url.split('.').pop().split(/\#|\?/)[0] || 'jpg';
        archive.append(Buffer.from(response.data), { name: `media-${index}.${extension}` });
      } catch (error) {
        this.logger.error(`Failed to download ${url}: ${error.message}`);
      }
    }

    await archive.finalize();
  }
}
