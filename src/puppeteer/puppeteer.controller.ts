import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { PuppeteerService } from './puppeteer.service';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import axios from 'axios';

@ApiTags('Puppeteer')
@Controller('puppeteer')
export class PuppeteerController {
  constructor(private readonly puppeteerService: PuppeteerService) {}

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 스크래핑 실험 - 네이버 지도
   * 현재 상태: Body로 지역명을 받아 음식점과 카테고리를 배열 안에 저장한다.
   * @param Body 지역 정보
   * @returns
   */
  @Post('/map')
  @ApiBody({ schema: { example: { region: '부산 동래구' } } })
  async getNaver(@Body('region') region: string): Promise<string> {
    const browser = await this.puppeteerService.getBrowserInstance();
    const page = await browser.newPage();

    // URL 원형(어떻게 사용할지 고민 좀 해볼 것)
    // `https://pcmap.place.naver.com/restaurant/list?query=${단어(ex.음식점 %EC%9D%8C%EC%8B%9D%EC%A0%90)}&x=${경도}&y=${위도}`

    await page.goto(
      `https://pcmap.place.naver.com/restaurant/list?query=${region}%20%EC%9D%8C%EC%8B%9D%EC%A0%90`,
    );

    let hasNextPage = true;
    let isEndOfScroll = false;
    let pageIndex = 1;
    const restaurants = [];

    while (hasNextPage) {
      while (!isEndOfScroll) {
        await page.evaluate(() => {
          const scrollableElement = document.querySelector(
            '#_pcmap_list_scroll_container',
          );
          if (scrollableElement) {
            scrollableElement.scrollTop = scrollableElement.scrollHeight;
          }
        });

        await this.delay(1000);

        const listsBeforeScroll = await page.$$(
          '#_pcmap_list_scroll_container > ul > li',
        );

        await page.evaluate(() => {
          const scrollableElement = document.querySelector(
            '#_pcmap_list_scroll_container',
          );
          if (scrollableElement) {
            scrollableElement.scrollTop = scrollableElement.scrollHeight;
          }
        });

        await this.delay(1000);

        const listsAfterScroll = await page.$$(
          '#_pcmap_list_scroll_container > ul > li',
        );

        if (listsBeforeScroll.length === listsAfterScroll.length) {
          isEndOfScroll = true;
        }
      }

      await page.evaluate(() => {
        const scrollableElement = document.querySelector(
          '#_pcmap_list_scroll_container',
        );
        if (scrollableElement) {
          scrollableElement.scrollTop = scrollableElement.scrollHeight;
        }
      });

      const lists = await page.$$('#_pcmap_list_scroll_container > ul > li');

      await Promise.all(
        lists.map(async (list, index) => {
          const name = await list.$eval(
            'div.CHC5F > a > div > div > span.TYaxT',
            (node) => node.textContent.trim(),
          );
          const category = await list.$eval(
            'div.CHC5F > a > div > div > span.KCMnt',
            (node) => node.textContent.trim(),
          );
          restaurants.push({ name, category });
        }),
      );
      console.log(pageIndex, restaurants[restaurants.length - 1]);

      const nextButtons = await page.$$('.eUTV2[aria-disabled="false"]');
      if (nextButtons) {
        const indexNow = pageIndex;
        for (const nextButton of nextButtons) {
          const buttonText = await nextButton.$eval(
            'span.place_blind',
            (span) => span.textContent,
          );
          if (buttonText === '다음페이지') {
            await Promise.all([nextButton.click()]);
            await this.delay(1000);
            pageIndex++;
          }
        }
        if (indexNow === pageIndex) {
          hasNextPage = false;
        }
      } else {
        hasNextPage = false;
      }
    }

    await page.close();
    await browser.close();
    console.log(restaurants);
    return restaurants.length.toString();
  }

  /**
   * 스크래핑 실험 - 네이버 지도, 검색 API 혼합
   * 현재 상태: 강남구의 가게를 검색하여 데이터베이스에 넣는다.
   * @returns
   */
  @Get('/mini')
  async getOne(): Promise<string[]> {
    const browser = await this.puppeteerService.getBrowserInstance();
    const page = await browser.newPage();

    const gu = '서울 강남구';

    const restaurants = [];

    await page.goto(
      `https://pcmap.place.naver.com/restaurant/list?query=${gu}%20%EC%9D%8C%EC%8B%9D%EC%A0%90`,
    );

    let hasNextPage = true;
    let isEndOfScroll = false;
    let pageIndex = 1;

    while (hasNextPage) {
      while (!isEndOfScroll) {
        await page.evaluate(() => {
          const scrollableElement = document.querySelector(
            '#_pcmap_list_scroll_container',
          );
          if (scrollableElement) {
            scrollableElement.scrollTop = scrollableElement.scrollHeight;
          }
        });

        await this.delay(1000);

        const listsBeforeScroll = await page.$$(
          '#_pcmap_list_scroll_container > ul > li',
        );

        await page.evaluate(() => {
          const scrollableElement = document.querySelector(
            '#_pcmap_list_scroll_container',
          );
          if (scrollableElement) {
            scrollableElement.scrollTop = scrollableElement.scrollHeight;
          }
        });

        await this.delay(1000);

        const listsAfterScroll = await page.$$(
          '#_pcmap_list_scroll_container > ul > li',
        );

        if (listsBeforeScroll.length === listsAfterScroll.length) {
          isEndOfScroll = true;
        }
      }

      await page.evaluate(() => {
        const scrollableElement = document.querySelector(
          '#_pcmap_list_scroll_container',
        );
        if (scrollableElement) {
          scrollableElement.scrollTop = scrollableElement.scrollHeight;
        }
      });

      const lists = await page.$$('#_pcmap_list_scroll_container > ul > li');

      await Promise.all(
        lists.map(async (list, index) => {
          const name = await list.$eval(
            'div.CHC5F > a > div > div > span.TYaxT',
            (node) => node.textContent.trim(),
          );
          const category = await list.$eval(
            'div.CHC5F > a > div > div > span.KCMnt',
            (node) => node.textContent.trim(),
          );
          const categoryId = (
            await this.puppeteerService.saveCategoryIfNotExists(category)
          ).id;
          restaurants.push({ gu, name, categoryId });
        }),
      );
      console.log(pageIndex, restaurants[restaurants.length - 1]);

      const nextButtons = await page.$$('.eUTV2[aria-disabled="false"]');
      if (nextButtons) {
        const indexNow = pageIndex;
        for (const nextButton of nextButtons) {
          const buttonText = await nextButton.$eval(
            'span.place_blind',
            (span) => span.textContent,
          );
          if (buttonText === '다음페이지') {
            await Promise.all([nextButton.click()]);
            await this.delay(1000);
            pageIndex++;
          }
        }
        if (indexNow === pageIndex) {
          hasNextPage = false;
        }
      } else {
        hasNextPage = false;
      }
    }

    const savedPlaces = [];
    for (const restaurant of restaurants) {
      const query = encodeURIComponent(gu + restaurant.name);

      try {
        await this.delay(100);
        const response = await axios.get(
          `https://openapi.naver.com/v1/search/local?query=${query}`,
          {
            headers: {
              'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
              'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
            },
          },
        );

        const data = response.data.items[0];
        const restaurantData = {
          title: restaurant.name,
          foodCategoryId: restaurant.categoryId,
          link: data.link,
          description: data.description,
          address: data.address,
          roadAddress: data.roadAddress,
          mapx: data.mapx,
          mapy: data.mapy,
        };
        const newRestaurant =
          await this.puppeteerService.createRestaurant(restaurantData);
        savedPlaces.push(newRestaurant);
      } catch (error) {
        console.error('Error occurred while fetching additional info:', error);
        break;
      }
    }

    await page.close();
    await browser.close();
    return savedPlaces;
  }

  /**
   * 스크래핑 실험 - 네이버 지도
   * 현재 상태: 구 정보가 저장된 임의의 배열로 스크래핑한다.
   * @returns
   */
  @Get('/map')
  async getGu(): Promise<string[]> {
    const browser = await this.puppeteerService.getBrowserInstance();
    const page = await browser.newPage();

    // 이게 맞나...싶지만 일차적으로 이렇게 했습니다ㅠㅠ
    const allGu = [
      '서울 강남구',
      '서울 강동구',
      '서울 강북구',
      '서울 강서구',
      '서울 관악구',
      '서울 광진구',
      '서울 구로구',
      '서울 금천구',
      '서울 노원구',
      '서울 도봉구',
      '서울 동대문구',
      '서울 동작구',
      '서울 마포구',
      '서울 서대문구',
      '서울 서초구',
      '서울 성동구',
      '서울 성북구',
      '서울 송파구',
      '서울 양천구',
      '서울 영등포구',
      '서울 용산구',
      '서울 은평구',
      '서울 종로구',
      '서울 중구',
      '서울 중랑구',
      '부산 강서구',
      '부산 금정구',
      '부산 남구',
      '부산 동구',
      '부산 동래구',
      '부산 부산진구',
      '부산 북구',
      '부산 사상구',
      '부산 사하구',
      '부산 서구',
      '부산 수영구',
      '부산 연제구',
      '부산 영도구',
      '부산 중구',
      '부산 해운대구',
      '인천 중구',
      '인천 동구',
      '인천 미추홀구',
      '인천 연수구',
      '인천 남동구',
      '인천 부평구',
      '인천 계양구',
      '인천 서구',
      '대구 남구',
      '대구 달서구',
      '대구 동구',
      '대구 북구',
      '대구 서구',
      '대구 수성구',
      '대구 중구',
      '광주 광산구',
      '광주 남구',
      '광주 동구',
      '광주 북구',
      '광주 서구',
      '대전 대덕구',
      '대전 동구',
      '대전 서구',
      '대전 유성구',
      '대전 중구',
      '울산 남구',
      '울산 동구',
      '울산 북구',
      '울산 중구',
      '수원 권선구',
      '수원 영통구',
      '수원 장안구',
      '수원 팔달구',
      '성남 분당구',
      '성남 수정구',
      '성남 중원구',
      '안양 동안구',
      '안양 만안구',
      '고양 덕양구',
      '고양 일산동구',
      '고양 일산서구',
      '안산 단원구',
      '안산 상록구',
      '용인 기흥구',
      '용인 수지구',
      '용인 처인구',
      '부천 원미구',
      '부천 소사구',
      '부천 오정구',
      '청주 상당구',
      '청주 흥덕구',
      '청주 청원구',
      '청주 서원구',
      '천안 동남구',
      '천안 서북구',
      '전주 덕진구',
      '전주 완산구',
      '포항 남구',
      '포항 북구',
      '창원 의창구',
      '창원 성산구',
      '창원 마산합포구',
      '창원 마산회원구',
      '창원 진해구',
    ];

    const restaurants = [];

    for (const gu of allGu) {
      await page.goto(
        `https://pcmap.place.naver.com/restaurant/list?query=${gu}%20%EC%9D%8C%EC%8B%9D%EC%A0%90`,
      );

      let hasNextPage = true;
      let isEndOfScroll = false;
      let pageIndex = 1;

      while (hasNextPage) {
        while (!isEndOfScroll) {
          await page.evaluate(() => {
            const scrollableElement = document.querySelector(
              '#_pcmap_list_scroll_container',
            );
            if (scrollableElement) {
              scrollableElement.scrollTop = scrollableElement.scrollHeight;
            }
          });

          await this.delay(1000);

          const listsBeforeScroll = await page.$$(
            '#_pcmap_list_scroll_container > ul > li',
          );

          await page.evaluate(() => {
            const scrollableElement = document.querySelector(
              '#_pcmap_list_scroll_container',
            );
            if (scrollableElement) {
              scrollableElement.scrollTop = scrollableElement.scrollHeight;
            }
          });

          await this.delay(1000);

          const listsAfterScroll = await page.$$(
            '#_pcmap_list_scroll_container > ul > li',
          );

          if (listsBeforeScroll.length === listsAfterScroll.length) {
            isEndOfScroll = true;
          }
        }

        await page.evaluate(() => {
          const scrollableElement = document.querySelector(
            '#_pcmap_list_scroll_container',
          );
          if (scrollableElement) {
            scrollableElement.scrollTop = scrollableElement.scrollHeight;
          }
        });

        const lists = await page.$$('#_pcmap_list_scroll_container > ul > li');

        await Promise.all(
          lists.map(async (list, index) => {
            const name = await list.$eval(
              'div.CHC5F > a > div > div > span.TYaxT',
              (node) => node.textContent.trim(),
            );
            const category = await list.$eval(
              'div.CHC5F > a > div > div > span.KCMnt',
              (node) => node.textContent.trim(),
            );
            const categoryId = (
              await this.puppeteerService.saveCategoryIfNotExists(category)
            ).id;
            restaurants.push({ name, categoryId });
          }),
        );
        console.log(pageIndex, restaurants[restaurants.length - 1]);

        const nextButtons = await page.$$('.eUTV2[aria-disabled="false"]');
        if (nextButtons) {
          const indexNow = pageIndex;
          for (const nextButton of nextButtons) {
            const buttonText = await nextButton.$eval(
              'span.place_blind',
              (span) => span.textContent,
            );
            if (buttonText === '다음페이지') {
              await Promise.all([nextButton.click()]);
              await this.delay(1000);
              pageIndex++;
            }
          }
          if (indexNow === pageIndex) {
            hasNextPage = false;
          }
        } else {
          hasNextPage = false;
        }
      }
    }

    await page.close();
    await browser.close();
    return restaurants;
  }

  /**
   * api 적용 실험 - 네이버 검색 api
   * @returns
   */
  @Get('/naver')
  async searchBlog(@Query('query') query: string, @Res() res): Promise<void> {
    const clientId = process.env.NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET;

    const api_url = `https://openapi.naver.com/v1/search/local?query=${encodeURI(query)}`;
    const headers = {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    };

    try {
      const response = await axios.get(api_url, { headers });
      res.status(HttpStatus.OK).json(response.data);
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status;
        res.status(statusCode).end();
        console.log('error = ' + statusCode);
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
        console.error('Error occurred while making request:', error);
      }
    }
  }
}
