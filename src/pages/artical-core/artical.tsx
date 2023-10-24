
// ! 记住当前页面
// ? 记住当前页面
// * 记住当前页面
// todo 记住当前页面
// // 记住当前页面
import React, { useState, useRef, useEffect, ElementRef } from 'react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import styles from './artical.module.scss';
import { Pagination, Button, Spin, Select, Space, Col, Row } from 'antd';
import { useOnceEffect } from '@/hooks/onceEffect';
import { getArticals, saveArtical } from '../../service/translate';
import { useNavigate } from 'react-router-dom';
import { articalTypes, ArticalTypeEnum } from './configs';
import TranslateLayer from '@/components/translateLayer/translateLayer';
import NewWordCom from '@/components/new-word/new-word';
import { isMobile } from '@/utils/helper';
import { MenuUnfoldOutlined } from '@ant-design/icons';
const SAVA_TIMES = 1000 * 60;

interface AnyObject {
  backgroundColor?: string;
  [key: string]: any;
}

interface ArticalProps {
  getArticalData: () => void
}

export default function Artical(props: ArticalProps) {
  const [spinning, setSpinning] = useState(false);
  const [newWordStyle, setNewWordStyle] = useState({});
  const [total, setTotal] = useState<number>(0);
  const [layout, setLayout] = useState<{left: number, right: number}>({left: 4, right: 20});
  const curPageNum = useRef<number>(1);
  const [articalType, setArticalType] = useState('');
  const [articalData, setArticalData] = useState<{
    text: string;
    title: string;
  }>({
    text: '',
    title: ''
  });
  const [newWords, setNewWords] = useState<Array<string>>([]);
  const allArtical = useRef<
    {
      title: string;
      text: string;
      id: number;
      words: string;
    }[]
  >([]);
  const [curWord, setCurWord] = useState<string[]>([]);
  const setTimeoutHandler = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();

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
    eventListener();
    savaMyself();
    const englishInfo = JSON.parse(localStorage.getItem('englishInfo') || '{}');
    curPageNum.current = englishInfo.articalCurrentPage || 1;
    const articalType = englishInfo.currentType || ArticalTypeEnum.FAIRY;
    setArticalType(articalType);
    getArticalsData({
      type: articalType
    });

    return () => {
      clearTimeout(setTimeoutHandler.current);
    };
  });

  function eventListener() {
    document.addEventListener('click', () => {
      isMobile() && setNewWordStyle({display: 'none'});
      clearHighlights();
    });
  }

  function getArticalsData(data: any) {
    setSpinning(true);
    getArticals(data).then((res: any) => {
      const curData = res[curPageNum.current] || res[0];
      allArtical.current = res;
      setTotal(res.length - 1);
      setArticalData({
        text: filterHtml(curData?.text),
        title: curData?.title
      });
      setNewWords(curData?.words ? JSON.parse(curData?.words) : []);
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
      tempData.words = JSON.stringify(data);
      saveArtical({
        id: tempData.id,
        ...data
      });
    }
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
    curPageNum.current = page;
    const curArticalData = allArtical.current?.[page];
    const cleanedHtmlString = filterHtml(curArticalData?.text);
    setArticalData({
      text: cleanedHtmlString,
      title: curArticalData?.title
    });
    setNewWords(JSON.parse(curArticalData?.words || '[]'));
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
      const highlightedText = originalText.replace(searchRegex, '<span class="highlight">$&</span>'); // 用<span>标签包裹匹配项来实现高亮
      element.innerHTML = highlightedText;
    });

    scrollToText(searchTerm);
  }

  function clearHighlights() {
    const highlightedElements = document.querySelectorAll('.highlight');

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
    const word = text.split('：')[0];
    clearHighlights();
    setCurWord([word]);
    highlightSearchTerm(word);
  }

  function addNewWord({translator}: any) {
    let translateText = translator;
    if (typeof translator !== 'string') {
      let extraWord = '';
      translator?.pText.forEach((item: string) => {
        extraWord += `${item.slice(0, 30)}#`;
      });
      translateText = `${translator?.text}#${extraWord}`;
    }
    const tempNewWords = new Set(newWords);
    tempNewWords.add(`${curWord[0]}：${translateText}`);
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

  function newWordHandler(data: Array<string>) {
    setNewWords(data);
    updateNewWords({ words: data });
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
    setNewWordStyle({
      display: 'block',
      position: 'fixed',
      left: 0,
      top: 0,
    });
  }

  function rememberHandler() {
    const englishInfo = JSON.parse(localStorage.getItem('englishInfo') || '{}');
    localStorage.setItem(
      'englishInfo',
      JSON.stringify({
        ...englishInfo,
        articalCurrentPage: curPageNum.current,
        currentType: articalType
      })
    );
  }

  const genNewWordCom = () => {
    return <div style={newWordStyle} className={styles.leftContent}>
      <NewWordCom
        data={newWords}
        newWordItemClick={newWordClick}
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
      <p dangerouslySetInnerHTML={{ __html: articalData.text }}></p>
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

  return (
    <div className={styles.main}>
      <TranslateLayer onAddNewWord={addNewWord} onMarkArtical={markArtical} onWordChange={setCurWord} />
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
      </div>
      {
        isMobile() ? genMobileContentCom() : genPCContentCom()
      }
    </div>
  );
}
