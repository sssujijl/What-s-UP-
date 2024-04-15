import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
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
  private readonly logger = new Logger(PuppeteerController.name);
  constructor(private readonly puppeteerService: PuppeteerService) {}

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // SECTION - 최신 스크래핑 코드
  /**
   * 사용자 근처 음식점을 스크래핑한다.
   * @param Body 지역명, 위도, 경도
   * @returns
   */
  @ApiBody({
    schema: {
      example: {
        coordinate: '&x=129.0839281906404&y=35.201762680832985',
      },
    },
  })
  @Post('/scraping')
  async getPlaces(
    @Body()
    { coordinate }: { coordinate: string },
  ): Promise<string> {
    try {
      const startTime = Date.now();
      const browser = await this.puppeteerService.getBrowserInstance();

      const page = await browser.newPage();
      const restaurants = [];

      await page.goto(
        `https://pcmap.place.naver.com/restaurant/list?query=%EC%9D%8C%EC%8B%9D%EC%A0%90${coordinate}`,
      );
      console.log(`https://pcmap.place.naver.com/restaurant/list?query=%EC%9D%8C%EC%8B%9D%EC%A0%90${coordinate}`);
      let hasNextPage = true;
      let isEndOfScroll = false;
      let pageIndex = 1;

      page.waitForSelector('#_pcmap_list_scroll_container > ul > li');

      // 페이지 넘기는 while문
      while (hasNextPage) {
        // 스크롤하는 while문
        while (!isEndOfScroll) {
          const previousListLength = await page.$$eval(
            '#_pcmap_list_scroll_container > ul > li',
            (lists) => lists.length,
          );

          await page.evaluate(() => {
            const scrollableElement = document.querySelector(
              '#_pcmap_list_scroll_container',
            );
            if (scrollableElement) {
              scrollableElement.scrollTop = scrollableElement.scrollHeight;
            }
          });

          await page.waitForNetworkIdle();

          const currentListLength = await page.$$eval(
            '#_pcmap_list_scroll_container > ul > li',
            (lists) => lists.length,
          );

          if (previousListLength === currentListLength) {
            isEndOfScroll = true;
          }
        }

        const lists = await page.$$('#_pcmap_list_scroll_container > ul > li');
        await Promise.all(
          lists.map(async (list) => {
            const region = await page
              .$eval('.Pb4bU', (node) => node.textContent.trim())
              .catch(() => null);
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
            restaurants.push({ region, name, categoryId });
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
              await nextButton.click();
              await page.waitForNetworkIdle();
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

      for (const restaurant of restaurants) {
        const query = encodeURIComponent(
          restaurant.region + ' ' + restaurant.name,
        );

        try {
          // 메뉴 상세주소로 가기 위해 코드를 받아오는 작업
          await page.goto(
            `https://search.naver.com/search.naver?where=nexearch&sm=top_sly.hst&fbm=0&acr=3&ie=utf8&query=${query}`,
          );

          const storeCode = await page
            .evaluate(() => {
              const aTag = document.querySelector('#_title > a');
              const element = document.querySelector(
                'li[data-cbm-doc-id], li[data-loc_plc-doc-id]',
              );

              if (aTag) {
                const href = aTag.getAttribute('href');
                const match = href.match(/place\/(\d+)\?/);
                if (match) return match[1];
              }

              if (element) {
                return (
                  element.getAttribute('data-cbm-doc-id') ||
                  element.getAttribute('data-loc_plc-doc-id')
                );
              }

              return null;
            })
            .catch(() => null);

          if (!storeCode) {
            continue;
          }

          await page.goto(
            `https://pcmap.place.naver.com/restaurant/${storeCode}/home`,
          );

          page.waitForSelector('.PkgBl');

          const addressBtn = await page.$('.PkgBl');
          await addressBtn.click();
          page.waitForSelector('.Y31Sf');

          const [image, link, roadAddress, address] = await Promise.all([
            page
              .$eval('.K0PDV', (element) => {
                const backgroundImage = window
                  .getComputedStyle(element)
                  .getPropertyValue('background-image');
                return backgroundImage.match(/url\("(.+)"\)/)[1];
              })
              .catch(() => null),
            page
              .$eval('.jO09N', (element) => element.textContent)
              .catch(() => null),
            page
              .$eval('.LDgIH', (element) => element.textContent)
              .catch(() => null),
            page
              .$$('.nQ7Lh')
              .then((elements) => {
                if (elements[1]) {
                  return elements[1].evaluate((node) =>
                    node.textContent.slice(2, -2),
                  );
                }
                return null;
              })
              .catch(() => null),
          ]);

          const baseAddress = this.extractAddress(roadAddress);

          const restaurantData = {
            image: image,
            title: restaurant.name,
            foodCategoryId: restaurant.categoryId,
            link: link,
            address: baseAddress + ' ' + address,
            roadAddress: roadAddress,
            hasMenu: false,
          };
          await page.goto(
            `https://pcmap.place.naver.com/restaurant/${storeCode}/menu/list`,
          );

          // 더보기 버튼 클릭
          let button = await page.$('a.fvwqf');
          while (button) {
            await button.click();
            button = await page.$('a.fvwqf');
          }

          const menuContainers = await page.$$('.E2jtL');

          if (menuContainers.length !== 0) {
            restaurantData.hasMenu = true;
          }

          const newRestaurant =
            await this.puppeteerService.createRestaurant(restaurantData);
          if (!newRestaurant || newRestaurant.hasMenu === false) {
            continue;
          }

          const menuPromises = menuContainers.map(async (container) => {
            const menuName = await container
              .$eval('.lPzHi', (element) => element.textContent)
              .catch(() => null);
            const menuImage = await container
              .$eval('.K0PDV', (element) => {
                const backgroundImage = window
                  .getComputedStyle(element)
                  .getPropertyValue('background-image');
                return backgroundImage.match(/url\("(.+)"\)/)[1];
              })
              .catch(() => null);
            const menuDescription = await container
              .$eval('.kPogF', (element) => element.textContent)
              .catch(() => null);
            const menuPrice = await container
              .$eval('.GXS1X', (element) => element.textContent)
              .catch(() => null);

            return this.puppeteerService.createMenu({
              placeId: newRestaurant.id,
              name: menuName,
              images: menuImage,
              description: menuDescription,
              price: menuPrice,
            });
          });

          await Promise.all(menuPromises);
        } catch (error) {
          console.error('오류 발생!:', error);
          break;
        }
      }

      await page.close();
      await browser.close();
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      this.logger.log(`execution time: ${executionTime}ms`);
      this.logger.log('웹 스크래핑이 성공적으로 완료되었습니다.');
      return '웹 스크래핑이 성공적으로 완료되었습니다.';
    } catch (error) {
      this.logger.error('웹 스크래핑 중 오류가 발생했습니다:', error);
    }
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
        const previousListLength = await page.$$eval(
          '#_pcmap_list_scroll_container > ul > li',
          (lists) => lists.length,
        );

        await page.evaluate(() => {
          const scrollableElement = document.querySelector(
            '#_pcmap_list_scroll_container',
          );
          if (scrollableElement) {
            scrollableElement.scrollTop = scrollableElement.scrollHeight;
          }
        });

        await page.waitForNetworkIdle();

        const currentListLength = await page.$$eval(
          '#_pcmap_list_scroll_container > ul > li',
          (lists) => lists.length,
        );

        if (previousListLength === currentListLength) {
          isEndOfScroll = true;
        }
      }

      const lists = await page.$$('#_pcmap_list_scroll_container > ul > li');

      await Promise.all(
        lists.map(async (list) => {
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
            await nextButton.click();
            await page.waitForNetworkIdle();
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

    const gu = '충남 천안시 서북구 두정동';

    const restaurants = [];

    await page.goto(
      `https://pcmap.place.naver.com/restaurant/list?query=${gu}%20%EC%9D%8C%EC%8B%9D%EC%A0%90`,
    );

    let hasNextPage = true;
    let isEndOfScroll = false;
    let pageIndex = 1;

    while (hasNextPage) {
      while (!isEndOfScroll) {
        const previousListLength = await page.$$eval(
          '#_pcmap_list_scroll_container > ul > li',
          (lists) => lists.length,
        );

        await page.evaluate(() => {
          const scrollableElement = document.querySelector(
            '#_pcmap_list_scroll_container',
          );
          if (scrollableElement) {
            scrollableElement.scrollTop = scrollableElement.scrollHeight;
          }
        });

        await page.waitForNetworkIdle();

        const currentListLength = await page.$$eval(
          '#_pcmap_list_scroll_container > ul > li',
          (lists) => lists.length,
        );

        if (previousListLength === currentListLength) {
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
        lists.map(async (list) => {
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
            await nextButton.click();
            await page.waitForNetworkIdle();
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
          image: '',
          title: restaurant.name,
          foodCategoryId: restaurant.categoryId,
          link: data.link,
          description: data.description,
          address: data.address,
          roadAddress: data.roadAddress,
          mapx: data.mapx,
          mapy: data.mapy,
          hasMenu: true,
        };
        const newRestaurant =
          await this.puppeteerService.createRestaurant(restaurantData);
        savedPlaces.push(newRestaurant);
      } catch (error) {
        console.error('오류 발생!:', error);
      }
    }

    await page.close();
    await browser.close();
    return savedPlaces;
  }

  // SECTION - 최신 스크래핑 코드
  /**
   * 스크래핑 실험 - 통합
   * 현재 상태: 구 정보가 저장된 임의의 배열로 스크래핑한다.
   * @returns
   */
  @Get('/scrap')
  async getGu(): Promise<string> {
    try {
      const startTime = Date.now();
      const browser = await this.puppeteerService.getBrowserInstance();

      // 이게 맞나...싶지만 일차적으로 이렇게 했습니다ㅠㅠ
      const allGu = [
        // '서울 강남구',
        // '서울 강동구',
        // '서울 강북구',
        // '서울 강서구',
        // '서울 관악구',
        // '서울 광진구',
        // '서울 구로구',
        // '서울 금천구',
        // '서울 노원구',
        // '서울 도봉구',
        // '서울 동대문구',
        // '서울 동작구',
        // '서울 마포구',
        // '서울 서대문구',
        // '서울 서초구',
        // '서울 성동구',
        // '서울 성북구',
        // '서울 송파구',
        // '서울 양천구',
        // '서울 영등포구',
        // '서울 용산구',
        // '서울 은평구',
        // '서울 종로구',
        // '서울 중구',
        // '서울 중랑구',
        // '부산 강서구',
        // '부산 금정구',
        // '부산 남구',
        // '부산 동구',
        // '부산 동래구',
        // '부산 부산진구',
        // '부산 북구',
        // '부산 사상구',
        // '부산 사하구',
        // '부산 서구',
        // '부산 수영구',
        // '부산 연제구',
        // '부산 영도구',
        // '부산 중구',
        // '부산 해운대구',
        // '인천 중구',
        // '인천 동구',
        // '인천 미추홀구',
        // '인천 연수구',
        // '인천 남동구',
        // '인천 부평구',
        // '인천 계양구',
        // '인천 서구',
        // '대구 남구',
        // '대구 달서구',
        // '대구 동구',
        // '대구 북구',
        // '대구 서구',
        // '대구 수성구',
        // '대구 중구',
        // '광주 광산구',
        // '광주 남구',
        // '광주 동구',
        // '광주 북구',
        // '광주 서구',
        // '대전 대덕구',
        // '대전 동구',
        // '대전 서구',
        // '대전 유성구',
        // '대전 중구',
        // '울산 남구',
        // '울산 동구',
        // '울산 북구',
        // '울산 중구',
        // '수원 권선구',
        // '수원 영통구',
        // '수원 장안구',
        // '수원 팔달구',
        // '성남 분당구',
        // '성남 수정구',
        // '성남 중원구',
        // '안양 동안구',
        // '안양 만안구',
        // '고양 덕양구',
        // '고양 일산동구',
        // '고양 일산서구',
        // '안산 단원구',
        // '안산 상록구',
        // '용인 기흥구',
        // '용인 수지구',
        // '용인 처인구',
        // '부천 원미구',
        // '부천 소사구',
        // '부천 오정구',
        // '청주 상당구',
        // '청주 흥덕구',
        // '청주 청원구',
        // '청주 서원구',
        // '천안 동남구',
        // '천안 서북구',
        // '전주 덕진구',
        // '전주 완산구',
        // '포항 남구',
        // '포항 북구',
        // '창원 의창구',
        // '창원 성산구',
        // '창원 마산합포구',
        // '창원 마산회원구',
        '창원 진해구',
      ];
      const page = await browser.newPage();
      const restaurants = [];

      for (const gu of allGu) {
        await page.goto(
          `https://pcmap.place.naver.com/restaurant/list?query=${gu}%20%EC%9D%8C%EC%8B%9D%EC%A0%90`,
        );

        let hasNextPage = true;
        let isEndOfScroll = false;
        let pageIndex = 1;

        // 페이지 넘기는 while문
        while (hasNextPage) {
          // 스크롤하는 while문
          while (!isEndOfScroll) {
            const previousListLength = await page.$$eval(
              '#_pcmap_list_scroll_container > ul > li',
              (lists) => lists.length,
            );

            await page.evaluate(() => {
              const scrollableElement = document.querySelector(
                '#_pcmap_list_scroll_container',
              );
              if (scrollableElement) {
                scrollableElement.scrollTop = scrollableElement.scrollHeight;
              }
            });

            await page.waitForNetworkIdle();

            const currentListLength = await page.$$eval(
              '#_pcmap_list_scroll_container > ul > li',
              (lists) => lists.length,
            );

            if (previousListLength === currentListLength) {
              isEndOfScroll = true;
            }
          }

          const lists = await page.$$(
            '#_pcmap_list_scroll_container > ul > li',
          );

          await Promise.all(
            lists.map(async (list) => {
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
                await nextButton.click();
                await page.waitForNetworkIdle();
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

      // const savedPlaces = [];
      for (const restaurant of restaurants) {
        const query = encodeURIComponent(restaurant.gu + ' ' + restaurant.name);

        try {
          // 메뉴 상세주소로 가기 위해 코드를 받아오는 작업
          await page.goto(
            `https://search.naver.com/search.naver?where=nexearch&sm=top_sly.hst&fbm=0&acr=3&ie=utf8&query=${query}`,
          );

          const storeCode = await page
            .evaluate(() => {
              const aTag = document.querySelector('#_title > a');
              const element = document.querySelector(
                'li[data-cbm-doc-id], li[data-loc_plc-doc-id]',
              );

              if (aTag) {
                const href = aTag.getAttribute('href');
                const match = href.match(/place\/(\d+)\?/);
                if (match) return match[1];
              }

              if (element) {
                return (
                  element.getAttribute('data-cbm-doc-id') ||
                  element.getAttribute('data-loc_plc-doc-id')
                );
              }

              return null;
            })
            .catch(() => null);

          if (!storeCode) {
            continue;
          }

          await page.goto(
            `https://pcmap.place.naver.com/restaurant/${storeCode}/home`,
          );

          page.waitForSelector('.PkgBl');

          const addressBtn = await page.$('.PkgBl');
          await addressBtn.click();
          page.waitForSelector('.Y31Sf');

          const [link, roadAddress, address] = await Promise.all([
            page
              .$eval('.jO09N', (element) => element.textContent)
              .catch(() => null),
            page
              .$eval('.LDgIH', (element) => element.textContent)
              .catch(() => null),
            page
              .$$('.nQ7Lh')
              .then((elements) => {
                if (elements[1]) {
                  return elements[1].evaluate((node) =>
                    node.textContent.slice(2, -2),
                  );
                }
                return null;
              })
              .catch(() => null),
          ]);

          const baseAddress = this.extractAddress(roadAddress);

          const restaurantData = {
            image: '',
            title: restaurant.name,
            foodCategoryId: restaurant.categoryId,
            link: link,
            address: baseAddress + ' ' + address,
            roadAddress: roadAddress,
            hasMenu: false,
          };

          await page.goto(
            `https://pcmap.place.naver.com/restaurant/${storeCode}/menu/list`,
          );

          // 더보기 버튼 클릭
          let button = await page.$('a.fvwqf');
          while (button) {
            await button.click();
            button = await page.$('a.fvwqf');
          }

          await page.waitForSelector('.E2jtL');
          const menuContainers = await page.$$('.E2jtL');

          if (menuContainers.length !== 0) {
            restaurantData.hasMenu = true;
          }

          const newRestaurant =
            await this.puppeteerService.createRestaurant(restaurantData);
          // savedPlaces.push(newRestaurant);

          if (!newRestaurant || newRestaurant.hasMenu === false) {
            continue;
          }

          const menuPromises = menuContainers.map(async (container) => {
            const menuName = await container
              .$eval('.lPzHi', (element) => element.textContent)
              .catch(() => null);
            const menuImage = await container
              .$eval('.K0PDV', (element) => {
                const backgroundImage = window
                  .getComputedStyle(element)
                  .getPropertyValue('background-image');
                return backgroundImage.match(/url\("(.+)"\)/)[1];
              })
              .catch(() => null);
            const menuDescription = await container
              .$eval('.kPogF', (element) => element.textContent)
              .catch(() => null);
            const menuPrice = await container
              .$eval('.GXS1X', (element) => element.textContent)
              .catch(() => null);

            return this.puppeteerService.createMenu({
              placeId: newRestaurant.id,
              name: menuName,
              images: menuImage,
              description: menuDescription,
              price: menuPrice,
            });
          });

          await Promise.all(menuPromises);
        } catch (error) {
          console.error('오류 발생!:', error);
          break;
        }
      }

      await page.close();
      await browser.close();
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      this.logger.log(`execution time: ${executionTime}ms`);
      this.logger.log('웹 스크래핑이 성공적으로 완료되었습니다.');
      // 양이 상당히 많을 것이기 때문에 일단 개수로
      // return savedPlaces.length.toString();
      return '웹 스크래핑이 성공적으로 완료되었습니다.';
    } catch (error) {
      this.logger.error('웹 스크래핑 중 오류가 발생했습니다:', error);
    }
  }

  private extractAddress(fullAddress: string): string {
    const words = fullAddress.split(' ');
    const endingIndex = words.findIndex(
      (word) => word.endsWith('로') || word.endsWith('길'),
    );

    return words.slice(0, endingIndex).join(' ');
  }

  /**
   * api 적용 실험 - 네이버 검색 api
   * @returns
   */
  @Get('/search-api')
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

  /**
   * 스크래핑 실험 - 네이버, 네이버 지도
   * 현재 상태: 가게 이름을 받아 메뉴를 저장한다.
   * @param Body 가게 이름
   * @returns
   */
  @Post('/menu')
  @ApiBody({ schema: { example: { name: '서울 강남구 호보식당' } } })
  async getMenu(@Body('name') name: string): Promise<any[]> {
    const startTime = Date.now();
    const browser = await this.puppeteerService.getBrowserInstance();
    const page = await browser.newPage();

    await page.goto(
      `https://search.naver.com/search.naver?where=nexearch&sm=top_sly.hst&fbm=0&acr=3&ie=utf8&query=${name}`,
    );

    // console.log('Say cheese!');
    // await page.screenshot({ path: './screenshot.png' });

    const storeCode = await page.evaluate(() => {
      const aTag = document.querySelector('#_title > a');
      if (aTag) {
        const href = aTag.getAttribute('href');
        const match = href.match(/place\/(\d+)\?/);
        return match ? match[1] : null;
      }

      const element = document.querySelector(
        'li[data-cbm-doc-id], li[data-loc_plc-doc-id]',
      );
      if (element) {
        return (
          element.getAttribute('data-cbm-doc-id') ||
          element.getAttribute('data-loc_plc-doc-id')
        );
      }

      return null;
    });

    console.log(storeCode);
    if (storeCode) {
      await page.goto(
        `https://pcmap.place.naver.com/restaurant/${storeCode}/menu/list`,
      );

      // 더보기 버튼 모두 클릭
      let button = await page.$('a.fvwqf');
      while (button) {
        await button.click();
        button = await page.$('a.fvwqf');
        console.log('click!');
      }

      // console.log('Say cheese!');
      // await page.screenshot({ path: './screenshot.png' });
      await page.waitForSelector('.E2jtL');
      const menuContainers = await page.$$('.E2jtL');

      const menuPromises = menuContainers.map(async (container) => {
        const menuName = await container
          .$eval('.lPzHi', (element) => element.textContent)
          .catch(() => null);
        const menuImage = await container
          .$eval('.K0PDV', (element) => {
            const backgroundImage = window
              .getComputedStyle(element)
              .getPropertyValue('background-image');
            return backgroundImage.match(/url\("(.+)"\)/)[1];
          })
          .catch(() => null);
        const menuDescription = await container
          .$eval('.kPogF', (element) => element.textContent)
          .catch(() => null);
        const menuPrice = await container
          .$eval('.GXS1X', (element) => element.textContent)
          .catch(() => null);

        return {
          name: menuName,
          image: menuImage,
          description: menuDescription,
          price: menuPrice,
        };
      });

      const menus = await Promise.all(menuPromises);
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      this.logger.log(`execution time: ${executionTime}ms`);
      await page.close();
      return menus;
    }

    await page.close();
    return [];
  }

  /**
   * 스크래핑 실험 - 아이프레임
   * 목표: 아이프레임 사이를 오가기.
   * @param Body 지역 정보
   * @returns
   */
  @Post('/iframe')
  @ApiBody({ schema: { example: { region: '부산 동래구' } } })
  async frameChange(@Body('region') region: string): Promise<string> {
    const browser = await this.puppeteerService.getBrowserInstance();
    const page = await browser.newPage();

    await page.goto(
      `https://map.naver.com/p/search/${region}%20%EC%9D%8C%EC%8B%9D%EC%A0%90`,
    );

    await this.delay(1000);
    console.log('Say cheese!');
    await page.screenshot({ path: './mapScreenshot.png' });

    return 'Cheese!';
  }
}
