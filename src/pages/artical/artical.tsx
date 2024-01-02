
// ! 记住当前页面
// ? 记住当前页面
// * 记住当前页面
// todo 记住当前页面
// // 记住当前页面
import React, { useState, useRef, useEffect, ElementRef } from 'react';
import styles from './artical.module.scss';
import { Pagination, Button, Modal, Select, Space, Col, Row, Input, message } from 'antd';
import { useOnceEffect } from '@/hooks/onceEffect';
import { getArticals, saveArtical } from '../../service/translate';
import { useNavigate } from 'react-router-dom';
import { articalTypes, ArticalTypeEnum } from './configs';
import TranslateLayer from '@/components/translateLayer/translateLayer';
import NewWordCom from '@/components/new-word/new-word';
import { isMobile } from '@/utils/helper';
import { localStorageGetter, catchJsonExep } from '@/utils/helper';
import { useUserStore } from '@/store/user';
import { askGoogleAi } from '@/utils/googleAi';
import { catchError } from '@/utils/helper';
import './normal.scss';

const SAVA_TIMES = 1000 * 60;
const { TextArea } = Input;
interface AnyObject {
  backgroundColor?: string;
  [key: string]: any;
}

const defaultFormData = {
  title: '',
  text: '',
  id: '',
};

let transFlag = false;
let newWordMarkFlag = false;

export default function Artical() {
  const [spinning, setSpinning] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [newWordStyle, setNewWordStyle] = useState({});
  const [total, setTotal] = useState<number>(0);
  const [layout, setLayout] = useState<{left: number, right: number}>({left: 5, right: 19});
  const curPageNum = useRef<number>(1);
  const [articalText, setArticalText] = useState('');
  const [articalType, setArticalType] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [articalData, setArticalData] = useState<{
    id: number | string;
    title: string;
    text: string;
    userWordRecordsId: string;
  }>({
    id: '',
    title: '',
    text: '',
    userWordRecordsId: '',
  });
  const [articalFormData, setArticalFormData] = useState<{
    title: string;
    text: string;
  }>({...defaultFormData});
  const [newWords, setNewWords] = useState<Array<string>>([]);
  const allArtical = useRef<
    {
      title: string;
      text: string;
      id: number;
      userWordRecordsId: string;
      words: string;
    }[]
  >([]);
  const [curWord, setCurWord] = useState<string[]>([]);
  const setTimeoutHandler = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();
  const userData = useUserStore.getState();
  
  useEffect(() => {
    if(isMobile()) {
      setLayout({
        left: 0,
        right: 24
      });
    }
    const dom = document.getElementById('artical-content');
    // @ts-ignore
    dom && (dom.parentNode.scrollTop = 0);
  }, [articalData]);

  useOnceEffect(() => {
    savaMyself();
    curPageNum.current = localStorageGetter('englishInfo', 'articalCurrentPage') || 1;
    const articalType = localStorageGetter( 'englishInfo', 'currentType') || ArticalTypeEnum.FAIRY;
    setArticalType(articalType);
    getArticalsData({
      type: articalType
    });

    return () => {
      clearTimeout(setTimeoutHandler.current);
    };
  });

  useEffect(() => {
    const handler = () => {
      isMobile() && setNewWordStyle({display: 'none'});
      if (!newWordMarkFlag && !transFlag) {
        clearHighlights();
      }
      // setArticalText(new String(articalText) as string);
      // transFlag = false;
    };
    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('click', handler);
    }
  }, [articalText]);

  const addArtical = (isEdit: boolean) => {
    setIsEdit(isEdit);
    setOpen(true);
    if (isEdit) {
      setArticalFormData({
        ...articalData,
      });
    }
  }


  function getArticalsData(data: any) {
    setSpinning(true);
    getArticals({
      ...data,
      userId: userData.user.currentUser.id
    }).then((res: any) => {
      const curData = res[curPageNum.current] || res[0];
      allArtical.current = res;
      setTotal(res.length - 1);
      const text = filterHtml(curData?.text);
      setArticalText(text);
      setArticalData({
        id: curData?.id,
        text: curData?.text,
        title: curData?.title,
        userWordRecordsId: curData.userWordRecordsId
      });
      const words = curData?.words ? JSON.parse(curData?.words).words : [];
      setNewWords(words);
    }).finally(() => {
      setSpinning(false);
    });
  }

  function savaMyself() {
    setTimeoutHandler.current = setTimeout(rememberHandler, SAVA_TIMES);
  }

  function updateNewWords(data: object) {
    const tempData = allArtical.current?.[curPageNum.current];
    if (tempData.id) {
      return saveArtical({
        id: tempData.id,
        ...data,
        words: JSON.stringify(data),
        userId: userData.user.currentUser.id,
        userWordRecordsId: articalData.userWordRecordsId
      });
    }
    return Promise.reject();
  }

  function removeAllAttributes(htmlString: string) {
    const cleanedHTML = htmlString.replace(/<[^>]*>/gi, function (match) {
      return match.replace(/(?:\w+\s*=\s*"[^"]*"|\w+\s*=\s*'[^']*'|\w+\s*=\s*\w+|data-\w+\s*=\s*"[^"]*"|data-\w+\s*=\s*'[^']*')/g, '');
    });
    return cleanedHTML;
  }

  function filterHtml(text = ''): string {
    const htmlString = text.replace(/<img.*?>/g, '');
    const cleanedHtmlString = htmlString.replace(/<(sup|canvas|iframe|script)\b[^>]*>.*?<\/(sup|canvas|iframe|script)>/gi, '');
    // const attr = removeAllAttributes(cleanedHtmlString);
    const filterText = cleanedHtmlString.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1');

    // 匹配中文字符和中文字符内的标点符号的正则表达式
    const chinesePattern = /[\u4e00-\u9fa5]+[，。、！？：；‘’“”【】「」『』《》〈〉（）\[\]{}\s]*/g;

    // 使用正则表达式替换中文字符和中文字符内的标点符号为空字符串
    const cleanedHTML = filterText.replace(chinesePattern, '');

    return cleanedHTML;
  }

  function onChange(page: number) {
    // navigate('/word');
    transFlag = false;
    curPageNum.current = page;
    const curArticalData = allArtical.current?.[page];
    const cleanedHtmlString = filterHtml(curArticalData?.text);
    setArticalText(cleanedHtmlString);
    setArticalData({
      id: curArticalData?.id,
      title: curArticalData?.title,
      userWordRecordsId: curArticalData.userWordRecordsId,
      text: curArticalData.text,
    });
    setNewWords(curArticalData?.words ? JSON.parse(curArticalData?.words).words : []);
  }

  function scrollToText(searchTerm: string) {
    const elementsToSearch = document.querySelectorAll('#artical-content *'); // 选择要搜索的所有内容元素
    let isd = false;
    elementsToSearch.forEach((element: any) => {
      element.childNodes.forEach((ele: any) => {
        if (ele.nodeType === Node.TEXT_NODE && ele.textContent.trim() !== '') {
          const originalText = ele.textContent;
          if (originalText.indexOf(searchTerm) > -1 && !isd) {
            isd = true;
            const top = ele.parentNode?.getBoundingClientRect().top;
            const dom = document.getElementById('artical-content');
            // @ts-ignore
            dom && (dom.parentNode.scrollTop = top - 70);
          }
        }
      });
    });
  }

  function highlightSearchTerm(searchTerm: string) {
    const searchRegex = new RegExp(searchTerm, 'gi'); // 创建一个全局不区分大小写的正则表达式
    const elementsToSearch = document.querySelectorAll('#artical-content *'); // 选择要搜索的所有内容元素
    elementsToSearch.forEach(element => {
      const originalText = element.innerHTML;
      if (!originalText.includes(searchTerm)) return;
      const highlightedText = originalText.replace(searchRegex, `<span class="highlight">$&</span>`); // 用<span>标签包裹匹配项来实现高亮
      element.innerHTML = highlightedText;
    });

    scrollToText(searchTerm);
  }

  function clearHighlights() {
    const highlightedElements = document.querySelectorAll('.highlight');
    // const translateWrapperElements = document.querySelectorAll('.translate-wrapper');
    highlightedElements.forEach(element => {
      element.outerHTML = element.innerHTML; // 移除<span>标签，恢复原始文本
    });
  }


  function markArtical({word}: any) {
    const searchRegex = new RegExp(word[0], 'gi'); // 创建一个全局不区分大小写的正则表达式
    const elementsToSearch = document.querySelectorAll('#artical-content *'); // 选择要搜索的所有内容元素
    elementsToSearch.forEach((element: any, index) => {
      const originalText = element.innerHTML;
      if (index === 0 || !originalText.includes(word[0])) return;
      const highlightedText = originalText.replace(searchRegex, '<span class="artical-highlight">$&</span>'); // 用<span>标签包裹匹配项来实现高亮
      setTimeout(() => {
        element.innerHTML = highlightedText;
      });
    });

    setTimeout(() => {
      const sd = document.querySelector('#artical-content>p');
      updateNewWords({ text: sd?.innerHTML });
    });
  }

  function newWordClick(e: any, text = '') {
    e.stopPropagation();
    clearHighlights();
    const word = text.split('：')[0];
    setCurWord([word]);
    highlightSearchTerm(word);
    newWordMarkFlag = false;
    transFlag = false;
  }

  async function createdExtraData(text: string) {
    const extraData: { strong: boolean, example: string, translate: string } = {
      strong: false,
      example: '',
      translate: '',
    };
    const [err, res] = await catchError(askGoogleAi(`Please use the word "${text}" to create a very simple example sentence, and then use "&" to splice the Chinese translation of this example sentence to the end of the example sentence without any other redundant explanation, such as "i love you & I love you"`));
    if (!err) {
      const [e, t] = res.split('&');
      extraData.example = e;
      extraData.translate = t;
    }
    return extraData;
  }

  async function addNewWord({translator}: any) {
    let translateText = translator;
    if (typeof translator !== 'string') {
      let extraWord = '';
      translator?.pText.forEach((item: string) => {
        extraWord += `${item.slice(0, 30)}#`;
      });
      translateText = `${translator?.text}#${extraWord}`;
    }
    const tempNewWords = new Set(newWords);
    const text = curWord[0];
    // 额外的数据
    const [, extraData] = await catchError(createdExtraData(text));
    console.log('extraData: ', extraData);
    tempNewWords.add(`${text}：${translateText}@${catchJsonExep(extraData)}`);
    const data = Array.from(tempNewWords);
    newWordHandler(data);
  }

  function modalOkHandler({index, text}: {index: number, text: string}) {
    const removeStr = newWords.splice(index, 1, text);
    if (removeStr) {
      const newList = [...newWords];
      newWordHandler(newList);
    }
  }

  function removeNewWord(key: number) {
    const data = newWords.filter((item: string, index) => {
      if (index === key) return false;
      return true;
    });
    newWordHandler(data);
  }

  async function newWordHandler(data: Array<string>) {
    await updateNewWords({ words: data });
    setNewWords(data);
  }

  function handleSelectChange(value: string) {
    curPageNum.current = 1;
    setArticalType(value);
    getArticalsData({
      type: value
    });
  }

  function newWordVisible(e: any) {
    e.stopPropagation();
    if (isMobile()) {
      return setNewWordStyle({
        display: 'block',
        position: 'fixed',
        left: 0,
        top: 0,
      });
    }
    if (newWordMarkFlag) {
      setArticalText(new String(articalText) as string);
    } else {
      const transList = newWords.map((item = '') => {
        const strs = item.split('@');
        const extraStr = strs[1];
        const extraData = extraStr ? catchJsonExep(extraStr, 'parse') : {
          strong: false,
        };
        return {
          value: item.split('#')?.[0]?.split('：'),
          ...extraData,
        };
      });
      const elementsToSearch = document.querySelectorAll('#artical-content *'); // 选择要搜索的所有内容元素
      transList.forEach((item: any) => {
        const text = item.value[0];
        const transText = item.value[1];
        const searchRegex = new RegExp(text, 'gi'); // 创建一个全局不区分大小写的正则表达式
        elementsToSearch.forEach(element => {
          const originalText = element.innerHTML;
          if (!originalText.includes(text)) return;
          const highlinghtStyle = `background-color: ${item.strong ? '#a1aaed' : '#fff'}`;
          const highlightedText = originalText.replace(
            searchRegex,
            `<span class="translate-wrapper">
              <span class='trans-text--hide'>${transText}</span>
              <span class="highlight" style="${highlinghtStyle}">$&</span>
            </span>`
          ); // 用<span>标签包裹匹配项来实现高亮
          element.innerHTML = highlightedText;
        });
      });
    }
    newWordMarkFlag = !newWordMarkFlag;
  }

  function rememberHandler() {
    localStorage.setItem(
      'englishInfo',
      JSON.stringify({
        ...localStorageGetter('englishInfo', 'articalCurrentPage'),
        articalCurrentPage: curPageNum.current,
        currentType: articalType
      })
    );
  }

  const translateNewWords = (e: any) => {
    e.stopPropagation();
    if (transFlag) {
      setArticalText(new String(articalText) as string);
    } else {
      const transList = newWords.map((item = '') => item.split('#')?.[0]?.split('：'));
      const elementsToSearch = document.querySelectorAll('#artical-content *'); // 选择要搜索的所有内容元素
      transList.forEach((item: any) => {
        const text = item[0];
        const transText = item[1];
        const searchRegex = new RegExp(text, 'gi'); // 创建一个全局不区分大小写的正则表达式
        elementsToSearch.forEach(element => {
          const originalText = element.innerHTML;
          if (!originalText.includes(text)) return;
          const highlightedText = originalText.replace(searchRegex, `<span class="translate-wrapper" style="border-bottom: 1px dashed #bf1041;"><span class='trans-text--show'>${transText}</span><span>$&</span></span>`); // 用<span>标签包裹匹配项来实现高亮
          element.innerHTML = highlightedText;
        });
      });
    }
    transFlag = !transFlag;
  }

  const onMarkStrong = (index: number, data: any) => {
    const newWordItem = newWords[index];
    const strs = newWordItem.split('@');
    const extraStr = strs[1];
    const extraData = extraStr ? catchJsonExep(extraStr, 'parse') : {
      strong: false,
    };
    extraData.strong = !data.strong;
    newWords[index] = `${strs[0]}@${catchJsonExep(extraData)}`;
    newWordHandler([...newWords]);
  }

  const genNewWordCom = () => {
    return <div style={newWordStyle} className={styles.leftContent}>
      <NewWordCom
        data={newWords}
        newWordItemClick={newWordClick}
        onMarkStrong={onMarkStrong}
        onRemoveNewWord={removeNewWord}
        changeNewWord={modalOkHandler} />
    </div>
  }

  const genArticalCom = () => {
    return <div className={styles.artical} id='artical-content'>
      <h3 id="kkkkll">{articalData.title}</h3>
      <link href="react.css" rel="stylesheet" />
      <style>
        {
          `.artical_artical__48zbT {
            width: 100%;
          }`
        }
      </style>
      <p id='textDom' dangerouslySetInnerHTML={{ __html: articalText }}></p>
    </div>;
  }

  const genMobileContentCom = () => {
    return <div className={styles.content}>
      {genNewWordCom()}
      {genArticalCom()}
    </div>
  }

  const genPCContentCom = () => {
    return <Row className={styles.content}>
      <Col span={layout.left}>
        {genNewWordCom()}
      </Col>
      <Col span={layout.right}>
        {genArticalCom()}
      </Col>
    </Row>
  }

  const handleOk = async () => {
    try {
      setEditLoading(true);
      await saveArtical({
        id: isEdit ? articalData.id : null,
        type: articalType,
        userId: userData.user.currentUser.id,
        ...articalFormData,
      });
      setIsEdit(false);
      getArticalsData({
        type: articalType,
      });
    } finally {
      setEditLoading(false);
      setOpen(false);
    }
  }

  const handleCancel = () => {
    setOpen(false);
    setIsEdit(false);
    setArticalFormData({
      ...defaultFormData,
    });
  }
  
  return (
    <div className={styles.main}>
      <Modal
        open={open}
        title={isEdit ? "编辑文章" : "新增文章"}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="submit" type="primary" loading={editLoading} onClick={handleOk}>
            添加
          </Button>,
        ]}
      > 
      <div>
        标题：<TextArea rows={1} value={articalFormData.title} onChange={(e) => setArticalFormData({...articalFormData, title: e.target.value})}></TextArea>
        <div style={{margin: '20px 0'}}></div>
        文章内容：<TextArea rows={10} value={articalFormData.text} onChange={(e) => setArticalFormData({...articalFormData, text: e.target.value})}></TextArea>
      </div> 
      </Modal>
      <TranslateLayer
        onAddNewWord={addNewWord}
        onMarkArtical={markArtical}
        onWordChange={setCurWord} />
      <div className={styles.header}>
        <Pagination
          disabled={spinning}
          simple={isMobile()}
          className={styles.pagination}
          showQuickJumper
          defaultPageSize={1}
          current={curPageNum.current}
          total={total}
          onChange={onChange}
        />
        <Space wrap>
          <Select size={isMobile() ? 'small': 'middle'} value={articalType} style={{ width: 100 }} onChange={handleSelectChange} options={articalTypes} />
        </Space>
        <Button type='link' onClick={rememberHandler} className={styles.remberButton}>
          记住
        </Button>
        <Button type='link' onClick={() => navigate('/word')} className={styles.remberButton}>
          去记单词
        </Button>
        <Button type='link' onClick={newWordVisible} className={styles.remberButton}>
          生词
        </Button>
        <Button type='link' onClick={translateNewWords} className={styles.remberButton}>
          翻译
        </Button>
        <Button type='link' onClick={() => addArtical(false)} className={styles.remberButton}>
          添加文章
        </Button>
        <Button type='link' onClick={() => addArtical(true)} className={styles.remberButton}>
          编辑文章
        </Button>
      </div>
      {
        isMobile() ? genMobileContentCom() : genPCContentCom()
      }
    </div>
  );
}
