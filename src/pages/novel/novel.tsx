
// ! 记住当前页面
// ? 记住当前页面
// * 记住当前页面
// todo 记住当前页面
// // 记住当前页面
import React, { useState, useRef, useEffect, ElementRef } from 'react';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import styles from './novel.module.scss';
import { Pagination, Button, Input, Select, Space, Col, Row } from 'antd';
import { useOnceEffect } from '@/hooks/onceEffect';
import { getArticals, saveArtical } from '../../service/translate';
import { useNavigate } from 'react-router-dom';
import { articalTypes, ArticalTypeEnum } from './configs';
import TranslateLayer from '@/components/translateLayer/translateLayer';
import NewWordCom from '@/components/new-word/new-word';
import { getNovel, getPDFMarkDetail } from '../../service/translate';
import { updateNovelMark, getNovelMark } from '../../service/novel';
import { isMobile } from '@/utils/helper';
const SAVA_TIMES = 1000 * 60;

interface AnyObject {
  backgroundColor?: string;
  [key: string]: any;
}

export default function Artical() {
  const [spinning, setSpinning] = useState(false);
  const [newWordStyle, setNewWordStyle] = useState({});
  const [pdfTextList, setPdfTextList] = useState<string[]>([]);
  const [total, setTotal] = useState<number>(0);
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
  const [curWord, setCurWord] = useState<string[]>([]);
  const setTimeoutHandler = useRef<ReturnType<typeof setTimeout>>();
  const allNovelMarkData = useRef<{page: number, words: string[]}[]>([]);
  const navigate = useNavigate();

  function getNovelMarkHandler() {
    getNovelMark({id: 7}).then((res: any) => {
      allNovelMarkData.current = res[0]?.words ? JSON.parse(res[0]?.words) : []
      setCurWordFn();
    });
  }

  function getNovelData(startNum: number, endNum: number) {
    setSpinning(true);
    getNovel({
      startNum,
      endNum
    }).then((res: any) => {
      setTotal(res.totalPages);
      setPdfTextList(res.pageText);
    }).finally(() => {
      setSpinning(false);
    });
  }

  useOnceEffect(() => {
    eventListener();
    savaMyself();
    const novelInfo = JSON.parse(localStorage.getItem('novelInfo') || '{}');
    curPageNum.current = novelInfo.articalCurrentPage || 1;
    getNovelData(curPageNum.current, curPageNum.current);
    getNovelMarkHandler();
    const articalType = novelInfo.currentType || ArticalTypeEnum.FAIRY;
    setArticalType(articalType);

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


  function savaMyself() {
    setTimeoutHandler.current = setTimeout(rememberHandler, SAVA_TIMES);
  }

  function updateNewWords(data: object) {
    updateNovelMark({
      id: 7,
      ...data
    });
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

  function setCurWordFn() {
    const curNovelMark: any = allNovelMarkData.current.find((item: any) => item.page === curPageNum.current) || {};
    setNewWords(curNovelMark.words || []);
  }

  function onChange(page: number) {
    curPageNum.current = page;
    getNovelData(page, page);
    setCurWordFn();
  }

  function scrollToText(searchTerm: string) {
    const elementsToSearch = document.querySelectorAll('#novel-content *'); // 选择要搜索的所有内容元素
    let isd = false;
    elementsToSearch.forEach((element: any) => {
      element.childNodes.forEach((ele: any) => {
        if (ele.nodeType === Node.TEXT_NODE && ele.textContent.trim() !== '') {
          const originalText = ele.textContent;
          if (originalText.indexOf(searchTerm) > -1 && !isd) {
            isd = true;
            const top = ele.parentNode?.getBoundingClientRect().top;
            const dom = document.getElementById('novel-content');
            // @ts-ignore
            dom && (dom.parentNode.scrollTop = top - 70);
          }
        }
      });
    });
  }

  function highlightSearchTerm(searchTerm: string) {
    const searchRegex = new RegExp(searchTerm, 'gi'); // 创建一个全局不区分大小写的正则表达式

    const dom = document.getElementById('novel-content'); // 选择要搜索的所有内容元素
    const originalText = dom?.textContent || '';
    const highlightedText = originalText.replace(searchRegex, '<span class="highlight">$&</span>'); // 用<span>标签包裹匹配项来实现高亮
    if(dom)dom.innerHTML = highlightedText;

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
    const dom = document.getElementById('novel-content'); // 选择要搜索的所有内容元素
    const originalText = dom?.textContent || '';
    const highlightedText = originalText.replace(searchRegex, '<span class="artical-highlight">$&</span>'); // 用<span>标签包裹匹配项来实现高亮
    dom && setTimeout(() => {
      dom.innerHTML = highlightedText;
    });

    // setTimeout(() => {
    //   const sd = document.querySelector('#novel-content>p');
    //   updateNewWords({ text: sd?.innerHTML });
    // });
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

  function newWordVisible(e: any) {
    e.stopPropagation();
    setNewWordStyle({
      display: 'block',
      position: 'fixed',
      left: 0,
      top: 0,
    });
  }

  function newWordHandler(data: Array<string>) {
    setNewWords(data);
    const curWordData = allNovelMarkData.current.find((item: any) => {
      if (item.page === curPageNum.current) {
        item.words = data;
        return true;
      }
    });

    if (!curWordData) {
      allNovelMarkData.current.push({page: curPageNum.current, words: data});
    }

    updateNewWords({ words: JSON.stringify([...allNovelMarkData.current]) });
  }

  function handleSelectChange(value: string) {
    curPageNum.current = 1;
    setArticalType(value);
  }

  const genNewWordCom = () => {
    return <div style={newWordStyle} className={styles.leftContent}>
      {newWords?.length ? <NewWordCom
        data={newWords}
        newWordItemClick={newWordClick}
        onRemoveNewWord={removeNewWord}
        changeNewWord={modalOkHandler} /> : null}
    </div>
  }

    function genMobileContentCom() {
      return <div className={styles.content}>
        {genNewWordCom()}
        <div className={styles.novel} id="novel-content">{pdfTextList}</div>
      </div>
    }

    function genPCContentCom() {
      return <Row className={styles.content}>
        <Col span={4}>
          {genNewWordCom()}
        </Col>
        <Col span={20}>
          <div className={styles.novel} id="novel-content">{pdfTextList}</div>
        </Col>
      </Row>
    }

  function rememberHandler() {
    const novelInfo = JSON.parse(localStorage.getItem('novelInfo') || '{}');
    localStorage.setItem(
      'novelInfo',
      JSON.stringify({
        ...novelInfo,
        articalCurrentPage: curPageNum.current,
        currentType: articalType
      })
    );
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
          <Button type='link' onClick={rememberHandler} className={styles.remberButton}>
            记住当前页
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
