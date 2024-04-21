import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';
import { Place } from 'src/places/entities/place.entity';

@Injectable()
export class ClovaocrService {
    async requestWithFile() {
        try {
            const filePath = '/Users/t2023-m0003/Desktop/sparta/team/Whats_up/피제이피자.jpeg'; // 이미지 파일 경로
            const fileStream = fs.createReadStream(filePath);

            const message = {
                images: [
                    {
                        format: 'jpeg',
                        name: '피제이피자.jpeg'
                    }
                ],
                requestId: 'str',
                timestamp: Date.now(),
                version: 'V2'
            };
            const formData = new FormData();

            formData.append('file', fileStream);
            formData.append('message', JSON.stringify(message));

            const response = await axios.post(
                process.env.APIGW_Invoke_URL, // APIGW Invoke URL
                formData,
                {
                    headers: {
                        'X-OCR-SECRET': process.env.OCR_SECRET, // 시크릿 키
                        ...formData.getHeaders(), // FormData의 헤더 추가

                    },
                },
            );

            const result = response.data;

            let text: string = "";
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
        const matchedCount = words.filter((word) => { return text.includes(word) }).length;
        const percentage = (matchedCount / wordCount) * 100;
        return percentage >= 70;
    }

    async test2(text: string, place: Place) {
        const pattern = /(\S+?)(도|시|구|동|로|길)|(\d+(?:-\d+)?)(?=\s|$)/g;

        const address = place.address.match(pattern);
        const roadAddress = place.roadAddress.match(pattern);
        const title = place.title.split(' ');

        const titleLength = title.filter((a) => { return text.includes(a) }).length;
        const addressLength = address.filter((a) => { return text.includes(a) }).length;
        const roadAddressLength = roadAddress.filter((a) => { return text.includes(a) }).length;

        console.log(text, title, titleLength, addressLength, roadAddressLength);

        let compare = 0;
        let matchedCount = 0;

        if (addressLength > roadAddressLength) {
            matchedCount += addressLength + titleLength;
            compare += address.length + title.length
        } else {
            matchedCount += roadAddressLength + titleLength;
            compare += roadAddress.length + title.length;
        }
        const percentage = (matchedCount / compare) * 100;
        return percentage >= 60;

    }

}
