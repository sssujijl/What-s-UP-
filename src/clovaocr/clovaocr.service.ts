import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs';
import FormData from 'form-data';
import { Place } from 'src/places/entities/place.entity';
import { async } from 'rxjs';

@Injectable()
export class ClovaocrService {
    async requestWithFile() {
        try {
            const filePath = '/Users/t2023-m0003/Desktop/sparta/team/Whats_up/팔각도.jpeg'; // 이미지 파일 경로
            const fileStream = fs.createReadStream(filePath);

            const message = {
                images: [
                    {
                        format: 'jpeg', // file format
                        name: '팔각도.jpeg' // file name
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
        const matchedCount = words.filter((word) => {return text.includes(word)}).length;
        const percentage = (matchedCount / wordCount) * 100;
        return percentage >= 70;
    }

    async test2(text: string, place: Place) {
        // const pattern = /(\S+?)(도|시|구|동|로|길)(?:\s+(\S+?)(\d+(?:-\d+)?|\d+-?\d+))?/g;
        const pattern = /(\S+?)(도|시|구|동|로|길)|(\d+(?:-\d+)?|\d+-?\d+)/g;

        // const pattern = /(\S+?)(도|시|구|동|로|길)/g;
        // const pattern = /(\d+(?:-\d+)?|\d+-?\d+)/;
        console.log(place.address, place.roadAddress);
        const address = place.address.match(pattern);
        const roadAddress = place.roadAddress.match(pattern);
        console.log(address, roadAddress);
        const title = place.title.split(' ');

        // const a = '충청남도 천안시 서북구 성환읍 272-8';
        // const b = a.match(pattern);
        // console.log(b);

        const test = title.filter((a) => {return text.includes(a)}).length;
        const test1 = address.filter((a) => {return text.includes(a)}).length;
        const test2 = roadAddress.filter((a) => {return text.includes(a)}).length;
        
        console.log(text, title, test, test1, test2);

        if (title.length !== test) {
            throw new Error('음식점 이름 다름');
        }
        
        if (test1 < 3 && test2 < 3) {
            throw new Error('지번, 도로명 모두 다름')
        }

        return true;
    }
    
}
