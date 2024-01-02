import React, { useState, useRef, useEffect } from 'react';
import styles from './word.module.scss';
import { Pagination, Button, Input, Select, Tooltip, Modal, Checkbox } from 'antd';
import { useOnceEffect } from '@/hooks/onceEffect';
import { translatePDF, savePDFDetail, getPDFMarkDetail } from '../../service/translate';
import SpeakWord from '@/components/speakWord';
import { useNavigate } from 'react-router-dom';
import TranslateLayer from '@/components/translateLayer/translateLayer';
import { localStorageGetter } from '@/utils/helper';
import { getNewWord, editNewWord, removeNewWord } from '@/service/novel';
import { useUserStore } from '@/store/user';
import { translateText } from '@/utils/translator';

const { TextArea } = Input;
const SAVA_TIMES = 1000 * 60;

const SIZE = 100;

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

type IReqFormData = {
  text?: string;
  translation?: string
  extra?: Array<string>
  othersTranslation?: Array<string>
}


type IFormData = {
  auto?: boolean
  text?: string;
  translation?: string
  othersTranslation?: string
}

let itemData: any = null;

function useRequest<T>(p: (data: any) => Promise<T>, configs: any) {
  const res = p(configs);

  return [res, configs]
}

export default function Sample() {
  const [total, setTotal] = useState<number>(0);
  const [curWord, setCurWord] = useState<string[]>([]);
  const [spinning, setSpinning] = useState<boolean>(false);
  const [paginationDisabled, setPaginationDisabled] = useState<boolean>(false);
  const [words, setWords] = useState<any[]>([]);
  const navigate = useNavigate();
  const [interval, setInterval] = useState(2000);
  const [noteModel, setNoteModel] = useState(false);
  const [open, setOpen] = useState(false);
  const [editLoading, setEitLoading] = useState(false);
  const [formData, setFormData] = useState<IFormData>({
    text: '',
    translation: '',
    othersTranslation: ''
  });
  const curReadIndex = useRef(0);
  const userData = useUserStore.getState();
  const curPageNum = useRef<number>(1);

  const getNewWords = async (note?: boolean) => {
    setPaginationDisabled(true);
    try {
      const res = await getNewWord({
        page: curPageNum.current,
        size: SIZE,
        isRead: 0,
        isNote: (note !== void 0 ? note : noteModel) ? 1 : 0,
      });
      const list = res?.list.map((item: any) => {
        return {
          ...item,
          extra: item.extra?.split('@')?.filter((item: IFormData) => !!item) || [],
          othersTranslation: item.othersTranslation?.split('@')?.filter((item: IFormData) => !!item) || [],
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
    if (!open) itemData = null;
  }, [open]);

  useEffect(() => {
    curPageNum.current = localStorageGetter('englishNewWordInfo', 'wordCurrentPage') || 1;
    getNewWords();
    const handler = () => {
      setCurWord([]);
      const newWordWrapper = document.querySelectorAll('.new-word-text');
      const dom = newWordWrapper[curReadIndex.current] as HTMLElement;
      if (!dom) return;
      dom.style.color = '';
      dom.style.fontSize = '';
    }
    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('clikc', handler);
    }
  }, []);

  const onPageChange = (page: number) => {
    curPageNum.current = page;
    getNewWords();
  }
  
  function remberHandler() {
    localStorage.setItem(
      'englishNewWordInfo',
      JSON.stringify({
        ...localStorageGetter('englishNewWordInfo'),
        wordCurrentPage: curPageNum.current
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
    // speakWord(text);
    setCurWord([text]);
  }

  function moreTrans(index?: number, e?: any) {
    e && e.stopPropagation();
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
    curReadIndex.current = index;
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
    setEitLoading(true);
    try {
      const data = {...formData} as IReqFormData;
      let translation = data.translation;
      let othersTranslation = data.othersTranslation;
      if(!formData.auto && !translation) return;
      if (formData.auto) {
        const teranslateData = await translateText(formData.text as string);
        const textList = teranslateData.translation;
        const explains = teranslateData?.basic?.explains;
        translation = textList.join('');
        othersTranslation = explains;
      }

      await editNewWord({
        ...formData,
        id: itemData?.id,
        translation: translation,
        isRead: itemData?.isRead || 0,
        isNote: noteModel ? 1 : 0,
        userId: userData.user.currentUser.id,
        extra: data.extra?.join('@'),
        othersTranslation: othersTranslation instanceof Array ? othersTranslation.join('@') : othersTranslation,
      });
      getNewWords();
      setOpen(false);
      setFormData({});
    } finally {
      setEitLoading(false);
    }
  }
  const handleCancel = () => {
    setOpen(false);
    setFormData({});
  }

  const edit = (data: any) => {
    setOpen(true);
    setFormData({...data});
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

  const goToNote = () => {
    setNoteModel(!noteModel);
    getNewWords(!noteModel);
  }

  const addNewWord = () => {
    setOpen(true);
  }

  const remove = async (data: any) => {
    await removeNewWord({id: data.id});
    getNewWords();
  }


  return (
    // <Spin tip='文档加载中...' spinning={spinning}>
      <div className={styles.main}>
        <Modal
          open={open}
          title={noteModel ? "录入笔记" : "翻译"}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={[
            <Button key="submit" type="primary" loading={editLoading} onClick={handleOk}>
              { noteModel ? "添加" : "编辑" }
            </Button>,
          ]}
        > 
        <div>
          <div style={{margin: '20px 0'}}>
            <Checkbox onChange={(e) => setFormData({...formData, auto: e.target.checked})}>自动翻译</Checkbox>
          </div>
          单词 / 句子：<TextArea rows={4} value={formData.text} onChange={(e) => setFormData({...formData, text: e.target.value})}></TextArea>
          <div style={{margin: '20px 0'}}></div>
          翻译：<TextArea rows={4} value={formData.translation} onChange={(e) => setFormData({...formData, translation: e.target.value})}></TextArea>
          <div style={{margin: '20px 0'}}></div>
          详情：<TextArea rows={4} value={formData.othersTranslation} onChange={(e) => setFormData({...formData, othersTranslation: e.target.value})}></TextArea>
        </div> 
        </Modal>
        <TranslateLayer />
        <SpeakWord interval={interval} words={curWord} onSuccese={audioSuccese}  />
        <div className={styles.pageWrapper}>
          <div className={styles.header}>
            <Pagination
              disabled={paginationDisabled}
              className={styles.pagination}
              showQuickJumper
              pageSize={SIZE}
              current={curPageNum.current}
              total={total}
              onChange={onPageChange}
            />
            <Button type='link' onClick={allActive} className={styles.remberButton}>
              详情模式
            </Button>
            <Button type='link' onClick={autoRead} className={styles.remberButton}>
              自动阅读
            </Button>
            <Button type='link' onClick={goToNote} className={styles.remberButton}>
              { !noteModel ? '笔记模式' : '单词模式' }
            </Button>
            {
              noteModel && <Button type='primary' onClick={addNewWord} className={styles.remberButton}>
                添加
              </Button>
            }
            <Button type='primary' onClick={remberHandler} className={styles.remberButton} style={{margin: '0 10px'}}>
              记住当前页 {curPageNum.current}
            </Button>
            <Select title='间隔' value={interval} onChange={setInterval} style={{verticalAlign: 'top', width: '60px'}}>
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
                        <Button size='small' onClick={() => edit(item)}>编辑</Button>
                        <Button size='small' style={{margin: '0 5px'}} onClick={() => read(item)}>熟悉了</Button>
                        <Button danger size='small' onClick={() => remove(item)}>删除</Button>
                      </>}>
                        <span onClick={(e) => moreTrans(num, e)}>{item.translation || '-'}</span>
                      </Tooltip>
                    </p>
                    <div className={`${styles['word-extra']}`} style={{display: item.active ? 'block' : 'none'}}>
                      {
                        item.othersTranslation.map((i: any, index: number) => (
                          <div key={index} className={styles['word-extra--active']}>{i}</div>
                        ))
                      }
                      { (item.othersTranslation.length && item.extra.length) ? <div className={styles['dashed-border']}></div> : null }
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
