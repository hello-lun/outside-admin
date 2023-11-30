import React, { useState, useRef, useEffect } from 'react';
import styles from './word.module.scss';
import { Pagination, Button, Input, Select, Tooltip, Modal } from 'antd';
import { useOnceEffect } from '@/hooks/onceEffect';
import { translatePDF, savePDFDetail, getPDFMarkDetail } from '../../service/translate';
import SpeakWord from '@/components/speakWord';
import { useNavigate } from 'react-router-dom';
import TranslateLayer from '@/components/translateLayer/translateLayer';
import { localStorageGetter } from '@/utils/helper';
import { getNewWord, editNewWord } from '@/service/novel';

const { TextArea } = Input;
const SAVA_TIMES = 1000 * 60;

const SIZE = 100;

let abc = false;

interface AnyObject {
  backgroundColor?: string;
  [key: string]: any;
}
interface WordObj {
  text: string;
  index?: number;
  notes: string;
  wordStyle: AnyObject;
  isTitle?: boolean
}

let itemData: any = null;

function useRequest<T>(p: (data: any) => Promise<T>, configs: any) {
  const res = p(configs);

  return [res, configs]
}

export default function Sample() {
  const [total, setTotal] = useState<number>(0);
  const [curPageNum, setPageNum] = useState<number>(1);
  const [curWord, setCurWord] = useState<string[]>([]);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [paginationDisabled, setPaginationDisabled] = useState<boolean>(false);
  const [words, setWords] = useState<any[]>([]);
  const navigate = useNavigate();
  const [interval, setInterval] = useState(2000);
  const [open, setOpen] = useState(false);
  const [editLoading, setEitLoading] = useState(false);
  const [textValue, setTextValue] = useState('');

  const getNewWords = async () => {
    setPaginationDisabled(true);
    try {
      const res = await getNewWord({
        page: curPageNum,
        size: SIZE,
        isRead: 0
      });
      const list = res?.list.map((item: any) => {
        return {
          ...item,
          extra: item.extra.split('@'),
          othersTranslation: item.othersTranslation.split('@'),
          active: false
        };
      });
      setTotal(res.total);
      setWords(list);
    } finally {
      setPaginationDisabled(false);
    }
  }

  useEffect(() => {
    setPageNum(localStorageGetter('englishNewWordInfo', 'wordCurrentPage') || 1);
    const handler = () => {
      setCurWord([]);
    }
    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('clikc', handler);
    }
  }, []);

  useEffect(() => {
    getNewWords();
  }, [curPageNum]);

  const onPageChange = (page: number) => {
    setPageNum(page);
  }
  
  function remberHandler() {
    localStorage.setItem(
      'englishNewWordInfo',
      JSON.stringify({
        ...localStorageGetter('englishNewWordInfo'),
        wordCurrentPage: curPageNum
      })
    );
  }

  function getFirstEnglishWord(str: string) {
    const match = str.match(/^[A-Za-z]+/); // 匹配开头的英文单词
    if (match) {
      return match[0];
    }
    return ''; // 如果没有匹配到英文单词，则返回空字符串
  }

  function speakWord(text: string) {
    const word = getFirstEnglishWord(text);
    if (!word) return;
    setCurWord([word]);
  }

  function textItemClick(text: string) {
    setInterval(0);
    speakWord(text);
  }

  function moreTrans(index?: number, e?: any) {
    e.stopPropagation();
    const cache = words.map((i: any, num) => {
      if (index === void 0 || index === num) {
        return {
          ...i,
          active: !i.active,
        };
      }
      return i;
    });
    setWords(cache);
  }

  function allActive() {
    moreTrans();
  }

  function autoRead(e: any) {
    e.stopPropagation();
    const list = words.map((item: any) => item.text);
    setCurWord(list);
  }

  function audioSuccese(index: number) {
    const length = curWord.length;
    if (length <= 1) return;
    const newWordWrapper = document.querySelectorAll('.new-word-text');
    if (index > 0) {
      const dom = newWordWrapper[index - 1] as HTMLElement;
      if (!dom) return;
      dom.style.color = '';
      dom.style.fontSize = '';
    }
    const newDom = (newWordWrapper[index] as HTMLElement);
    if (!newDom) return;
    newDom.style.color = 'blue';
    newDom.style.fontSize = '25px';
  }

  const handleOk = async () => {
    await editNewWord({
      id: itemData.id,
      translation: textValue
    });
    getNewWords();
    setOpen(false);
  }
  const handleCancel = () => {
    setOpen(false);
  }

  const edit = (data: any) => {
    setOpen(true);
    setTextValue(data.translation);
    itemData = data;
  }

  const read = async (data: any) => {
    await editNewWord({
      id: data.id,
      isRead: 1,
    });
    getNewWords();
    setOpen(false);
  }


  return (
    // <Spin tip='文档加载中...' spinning={spinning}>
      <div className={styles.main}>
        <Modal
        open={open}
        title="翻译"
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="submit" type="primary" loading={editLoading} onClick={handleOk}>
            编辑
          </Button>,
        ]}
      >
        <TextArea value={textValue} onChange={(e) => setTextValue(e.target.value)}></TextArea>
      </Modal>
        <TranslateLayer />
        <SpeakWord quickly interval={interval} words={curWord} onSuccese={audioSuccese}  />
        <div className={styles.pageWrapper}>
          <div className={styles.header}>
            <Pagination
              disabled={paginationDisabled}
              className={styles.pagination}
              showQuickJumper
              pageSize={SIZE}
              current={curPageNum}
              total={total}
              onChange={onPageChange}
            />
            <Button type='primary' onClick={remberHandler} className={styles.remberButton}>
              记住当前页 {curPageNum}
            </Button>
            <Button type='link' onClick={allActive} className={styles.remberButton}>
              详情模式
            </Button>
            <Button type='link' onClick={autoRead} className={styles.remberButton}>
              自动阅读
            </Button>
            <Select value={interval} onChange={setInterval} style={{verticalAlign: 'top', width: '60px'}}>
              <Select.Option value={1000}>1秒</Select.Option>
              <Select.Option value={2000}>2秒</Select.Option>
              <Select.Option value={3000}>3秒</Select.Option>
              <Select.Option value={4000}>4秒</Select.Option>
            </Select>
          </div>
          <div className={styles.word}>
            <div className={styles['word-content']}>
              {
                words.map((item: any, num: number) => (
                  <div className={styles['word-item']} key={item.id}>
                    <p onClick={() => textItemClick(item.text)}>
                      <span className={`${styles['word-text']} new-word-text`}>{item.text}</span>：
                      <Tooltip placement="top" color='#fff' title={<>
                        <Button size='small' style={{marginRight: '5px'}} onClick={() => edit(item)}>编辑</Button>
                        <Button size='small' onClick={() => read(item)}>熟悉了</Button>
                      </>}>
                        <span onClick={(e) => moreTrans(num, e)}>{item.translation}</span>
                      </Tooltip>
                    </p>
                    <div className={`${styles['word-extra']}`} style={{display: item.active ? 'block' : 'none'}}>
                      {
                        item.othersTranslation.map((i: any, index: number) => (
                          <div key={index} className={styles['word-extra--active']}>{i}</div>
                        ))
                      }
                      <div className={styles['dashed-border']}></div>
                      {
                        item.extra.map((i: any, index: number) => (
                          <div key={index} className={styles['word-extra--extra']}>{i}</div>
                        ))
                      }
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    // </Spin>
  );
}
