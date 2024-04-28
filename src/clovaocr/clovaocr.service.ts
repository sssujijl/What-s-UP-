import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';
import { Place } from 'src/places/entities/place.entity';

@Injectable()
export class ClovaocrService {
  async requestWithFile(file: Express.Multer.File) {
    try {
      const format = file.mimetype.split('/')[1];

      if (format !== 'jpg' && format !== 'jpeg' && format !== 'png') {
        throw new Error('jpg, jpeg, png 이미지 파일만 가능합니다.');
      }
      
      const message = {
        images: [
          {
            format,
            name: file.originalname,
          },
        ],
        requestId: 'str',
        timestamp: Date.now(),
        version: 'V2',
      };

      const formData = new FormData();

      formData.append('file', fs.createReadStream(file.path), {
        filename: file.originalname,
      });
      formData.append('message', JSON.stringify(message));

      const response = await axios.post(
        process.env.APIGW_INVOKE_URL,
        formData,
        {
          headers: {
            'X-OCR-SECRET': process.env.OCR_SECRET,
            ...formData.getHeaders(),
          },
        },
      );

      const result = response.data;

      let text: string = '';
      const fields = result.images[0].fields;
      for (const field of fields) {
        text += field.inferText;
      }

      return text;
    } catch (error) {
      console.warn('requestWithFile error', error.response);
      throw error;
    }
  }

  async test1(text: string, place: Place) {
    const title = place.title.split(' ');
    const address = place.address.split(' ');
    const roadAddress = place.roadAddress.split(' ');
    console.log(text);
    const words = [...title, ...address, ...roadAddress];

    const wordCount = words.length;
    const matchedCount = words.filter((word) => {
      return text.includes(word);
    }).length;
    const percentage = (matchedCount / wordCount) * 100;
    return percentage >= 70;
  }

  async test2(text: string, place: Place) {
    const pattern = /(\S+?)(도|시|구|동|로|길)|(\d+(?:-\d+)?)(?=\s|$)/g;

    const address = place.address.match(pattern);
    const roadAddress = place.roadAddress.match(pattern);
    const title = place.title.split(' ');

    const titleLength = title.filter((a) => {
      return text.includes(a);
    }).length;
    const addressLength = address.filter((a) => {
      return text.includes(a);
    }).length;
    const roadAddressLength = roadAddress.filter((a) => {
      return text.includes(a);
    }).length;

    console.log(text, titleLength, addressLength, roadAddressLength);
    console.log(title, address, roadAddress);

    let compare = 0;
    let matchedCount = 0;

    if (addressLength > roadAddressLength) {
      matchedCount += addressLength + titleLength;
      compare += address.length + title.length;

    } else if (addressLength > roadAddressLength) {
      matchedCount += roadAddressLength + titleLength;
      compare += roadAddress.length + title.length;

    } else if (addressLength === roadAddressLength) {
        matchedCount += addressLength + roadAddressLength + titleLength;
        compare += address.length + roadAddress.length + title.length
    }

    const percentage = (matchedCount / compare) * 100;

    if (percentage < 60) {
        throw new Error('영수증 인증에 실패하였습니다.');
    }

    return;
  }
}
