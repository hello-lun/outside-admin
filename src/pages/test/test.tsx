import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { translateText } from '@/utils/translator';
import { addNewWord } from '@/service/novel';
import { Button } from 'antd';
import { queryOpenai } from '@/service/openai';
import { OpenaiModel } from '@/configs/constants';

function isEnglish(str: string) {
  return /^[A-Za-z]{2,}$/.test(str);
}

let nums = 0;

const noTranslotions: any[] = [];

const OCRComponent = () => {
  const [ocrText, setOcrText] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const trans = async function(text: any) {
    try {
      const data = await translateText(text);
      const tempText = data.translation?.[0];
      const pText = data?.basic?.explains || [];
      const webText = data.web || [];
      await addNewWord({
        text,
        translation: tempText,
        othersTranslation: pText.join('@'),
        extra: webText.map((i: any) => `${i.key}：${i.value.toString()}`)?.join('@'),
      });
      nums++;
      console.log(`%c${text}: ${tempText} ---- 上传成功 ----- ${nums}`, 'color: green;');
      return Promise.resolve();
    } catch(e) {
      return Promise.reject();
    }
  }

  const handleImageUpload = (event: any) => {
    const imageFile = event.target.files[0];

    if (imageFile) {
      setIsProcessing(true);
      Tesseract.recognize(
        imageFile,
        'eng',
        {
          // logger: m => console.log(m)
        }
      ).then(async ({ data }) => {
        for (const item of data.words) {
          if(isEnglish(item.text)) {
            try {
              await trans(item.text);
            } catch(e) {
              trans(item.text).catch(() => {
                console.log(`%c${item.text} ---- 上传失败 ----- ${nums}`, 'color: red;');
                noTranslotions.push(item.text);
              });
            }
          }
        }

        add();
        // const wordList = data.words.filter(async (item: any, index) => {
        //   if(isEnglish(item.text)) {
        //     trans(item.text);
        //   }
        // });
        // setOcrText(wordList);
        // console.log('wordList: ', wordList);
        setIsProcessing(false);
      }).catch(error => {
        console.error('OCR Error:', error);
        setIsProcessing(false);
      });
    }
  };

  const add = async () => {
    while (noTranslotions.length > 0) {
      const text = noTranslotions.shift(); // 移除数组的第一个元素
      try {
        await trans(text); // 假设这是一个异步处理函数
      } catch(e) {
        trans(text).catch(() => {
          noTranslotions.push(text);
        });
      }
    }
  }

  const cons = async () => {
    console.log('noTranslotions: ', noTranslotions);
    const a = await queryOpenai({
      model: 'gpt-3.5-turbo-1106',
      word: 'input'
    });
    console.log('word: ', a);
  }
  return (
    <div>
      <input type="file" onChange={handleImageUpload} accept="image/*" />
      {isProcessing && <p>正在处理图像...</p>}
      <p>OCR 结果：</p>
      <div>{
        ocrText.map(item => <p>{item.text}</p>)
      }</div>
      <Button onClick={add}>重新翻译&录入</Button>
      <Button onClick={cons}>剩余未翻译&录入的数据</Button>
    </div>
  );
};

export default OCRComponent;
