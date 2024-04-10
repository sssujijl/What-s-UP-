import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';

@Injectable()
export class ClovaocrService {
    async requestWithFile() {
        try {
            const filePath = '/Users/t2023-m0003/Desktop/sparta/team/Whats_up/example.jpg'; // 이미지 파일 경로
            const fileStream = fs.createReadStream(filePath);

            const message = {
                images: [
                    {
                        format: 'jpg', // file format
                        name: 'example.jpg' // file name
                    }
                ],
                requestId: 'str', // unique string
                timestamp: Date.now(), // 현재 시간
                version: 'V2'
            };
            const formData = new FormData();

            formData.append('file', fileStream);
            formData.append('message', JSON.stringify(message));

            const response = await axios.post(
                'https://edp0tsvahd.apigw.ntruss.com/custom/v1/29906/ab55a60854e1b699c68a692f0a4980dbc5771ac32e641c89b636c00bb05c7cf5/general', // APIGW Invoke URL
                formData,
                {
                    headers: {
                        'X-OCR-SECRET': 'YWx5blhobnlPcVZZa1hSRlpTU0xIRG1UbXZKZWZXbEg=', // 시크릿 키
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

            // 매장명 추출
            const storeNameStartIndex = text.indexOf("[매장명]") + "[매장명]".length;
            const storeNameEndIndex = text.indexOf("[주소]");
            const storeName = text.substring(storeNameStartIndex, storeNameEndIndex).split('/')[0].trim();

            // 주소 추출
            const addressStartIndex = text.indexOf("[주소]") + "[주소]".length;
            const addressEndIndex = text.indexOf("[대표자]");
            const address = text.substring(addressStartIndex, addressEndIndex).split('.')[0].trim();

            // 매출일 추출
            const salesDateStartIndex = text.indexOf("[매출일]") + "[매출일]".length;
            const salesDate = text.substring(salesDateStartIndex, salesDateStartIndex + 10);

            // 결과 출력
            console.log("매장명:", storeName);
            console.log("주소:", address);
            console.log("매출일:", salesDate);

            return text;
        } catch (error) {
            console.warn('requestWithFile error', error.response);
            throw error;
        }
    }
}
