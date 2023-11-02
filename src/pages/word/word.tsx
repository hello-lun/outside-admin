import React, { useState, useRef } from 'react';
import styles from './word.module.scss';
import { Pagination, Button, Input, Spin } from 'antd';
import { useOnceEffect } from '@/hooks/onceEffect';
import { translatePDF, savePDFDetail, getPDFMarkDetail } from '../../service/translate';
import SpeakWord from '@/components/speakWord';
import { useNavigate } from 'react-router-dom';
import TranslateLayer from '@/components/translateLayer/translateLayer';
import pds from '../../assets/english-word.pdf';
import { localStorageGetter } from '@/utils/helper';

const { TextArea } = Input;
const SAVA_TIMES = 1000 * 60;

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

type PDFMark = Pick<WordObj, 'index' | 'wordStyle'>;

type PDFFile = string | File | null;

export default function Sample() {
  const [total, setTotal] = useState<number>(0);
  const [curPageNum, setPageNum] = useState<number>(1);
  const [pdfTextList, setPdfTextList] = useState<WordObj[]>([]);
  const [hoverStyle, setHoverStyle] = useState<object>({});
  const [noteStyle, setNoteStyle] = useState<object>({});
  const curPdfMarkData = useRef<any>({});
  const pdfMarkData = useRef<PDFMark[]>([]);
  const setTimeoutHandler = useRef<ReturnType<typeof setTimeout>>();
  const [targetItem, setTargetItem] = useState<number>();
  const [notesValue, setNotesValue] = useState<string>('');
  const [curWord, setCurWord] = useState<string>('');
  const [spinning, setSpinning] = useState<boolean>(false);
  const [paginationDisabled, setPaginationDisabled] = useState<boolean>(false);
  const navigate = useNavigate();
  
  useOnceEffect(() => {
    addEvent();
    // getPdfdata();
    initPageNum();
  });

  function extractLowercaseWord(str: string) {
    const regex = /^(?:[a-z]+)(?![A-Z])/;
    const match = str.match(regex);
  
    if (match) {
      return [match[0], str.substring(match[0].length)];
    }
  
    return null;
  }

  // function getPdfInfo(startNum: number, endNum: number) {
  //   translatePDF({
  //     startNum,
  //     endNum
  //   }).then((res: any) => {
  //     console.log('res: ', res);
  //     const dataArray = res.pageText.split('\n').filter((ele: any) => {
  //       if (!ele) return;
  //       if (ele.indexOf('http://') > -1) return;
  //       if (ele.indexOf('@简单高中生') > -1) return;
  //       if (ele.indexOf('3500分类记忆') > -1) return;
  //       if (ele.indexOf('咨询电话：') > -1) return;

  //       return true;
  //     });
  //     const list: WordObj[] = [];
  //     const styleData = curPdfMarkData.current?.styles || [];
  //     dataArray.forEach((item: string, index: number) => {
  //       let text = item;
  //       const a = extractLowercaseWord(item);
  //       if (a) {
  //         text = `<div style="line-height: 25px;"><span class="${styles.coreWord}">${a[0]}</span> ${a[1]}</div>`
  //       }

  //       const styleItem =
  //         styleData.find((ele: any) => {
  //           return ele.index === index;
  //         }) || {};
  //       list.push({ text, notes: styleItem.notes, index: index, wordStyle: styleItem.wordStyle, isTitle: false });
  //     });
  //     setTotal(res.totalPages);
  //     setPdfTextList(list);
  //     setSpinning(false);
  //   });
  // }
  
  function getPdfInfo(startNum: number, endNum: number) {
    setPaginationDisabled(true);
    translatePDF({
      startNum,
      endNum
    }).then((res: any) => {
      // Split the string using multiple spaces as delimiter
      const parts = res.pageText.split(/\s{2,}/);

      // Merge the word entries with their respective pronunciation and meaning
      const result = [];
      for (let i = 0; i < parts.length; i++) {
          if (parts[i].startsWith('[')) {
              result[result.length - 1] += ' ' + parts[i];
          } else {
              result.push(parts[i]);
          }
      }

      const list: WordObj[] = [];
      const styleData = curPdfMarkData.current?.styles || [];
      result.forEach((item: string, index: number) => {
        let text = item;
        const a = extractLowercaseWord(item);
        if (a) {
          text = `<div style="line-height: 25px;"><span class="${styles.coreWord}">${a[0]}</span> ${a[1]}</div>`
        }

        const styleItem =
          styleData.find((ele: any) => {
            return ele.index === index;
          }) || {};
        list.push({ text, notes: styleItem.notes, index: index, wordStyle: styleItem.wordStyle, isTitle: false });
      });

      setTotal(res.totalPages);
      setPdfTextList(list);
      setSpinning(false);
    }).finally(() => {
      setPaginationDisabled(false);
    });
  }
  function isChiness(str: string) {
    const chineseRegex = /^[\u4e00-\u9fa5，。！？；：“”‘’【】（）《》【】、]+$/;
    return chineseRegex.test(str);
  }

  function addEvent() {
    savaMyself();
    document.addEventListener('contextmenu', e => {
      e.preventDefault();
      const pageWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const w = e.pageX + 300;
      let left = e.pageX;
      if (w > pageWidth) {
        left = left - (w - pageWidth + 20);
      }

      setHoverStyle({
        left: left + 'px',
        top: e.pageY + 10 + 'px',
        display: 'block'
      });
      if (e.target) setTargetItem((e.target as any).getAttribute('data-index-key'));
    });

    document.addEventListener('click', e => {
      noteDialogHide();
      setHoverStyle({
        ...hoverStyle,
        display: 'none'
      });
    });

    return () => {
      setTimeoutHandler.current && clearTimeout(setTimeoutHandler.current);
    }
  }

  function savaMyself() {
    setTimeoutHandler.current = setTimeout(remberHandler, SAVA_TIMES);
  }

  function initPageNum() {
    onPageChange(localStorageGetter('parseData', 'wordCurrentPage') || 1);
  }

  function fetchPdfMarkDetail(pageNum: number) {
    getPDFMarkDetail<PDFMark>().then((res: any) => {
      const markData = res.map((item: any) => ({
        pageNum: item.pageNum,
        styles: JSON.parse(item.data)
      }));
      pdfMarkData.current = markData;
      curPdfMarkData.current = markData.find((item: any) => item.pageNum === pageNum) || {};
    });
  }

  function savePDFDetailHandler(list: WordObj[]) {
    const filters = list
      .filter(item => {
        return item.index !== void 0;
      })
      .map(info => {
        return {
          index: info.index,
          notes: info.notes,
          wordStyle: info.wordStyle
        };
      });

    curPdfMarkData.current.styles = filters;

    savePDFDetail({ pageNum: curPageNum, data: JSON.stringify(filters) });
  }

  function mapPdfTextList(target: any): any[] {
    const bgColor = target.style.backgroundColor;
    const flag = target.getAttribute('data-flag');
    return pdfTextList.map((item, index) => {
      if (index === Number(targetItem)) {
        if (flag === 'notes') return item;
        let tempWordStyle = { ...item.wordStyle, backgroundColor: bgColor };
        let tempIndex: number | undefined = index;
        if (flag === 'cancle') {
          tempIndex = void 0;
          tempWordStyle = { backgroundColor: '' };
        }
        Object.assign(item, { index: tempIndex, wordStyle: tempWordStyle });
        return item;
      }
      return item;
    });
  }

  function menuClick(e: any) {
    e.stopPropagation(); // 阻止事件冒泡
    const flag = e.target.getAttribute('data-flag');
    if (flag === 'notes') {
      setNoteStyle({ ...hoverStyle, display: 'block' });
    }
    const list = mapPdfTextList(e.target);
    setPdfTextList(list);
    savePDFDetailHandler(list);
    setHoverStyle({
      ...hoverStyle,
      display: 'none'
    });
  }

  function onDocumentLoadSuccess(pdfDetail: any) {
    // setTotal(pdfDetail.numPages);
  }

  function onPageChange(page: number) {
    setSpinning(true);
    setPageNum(page);
    fetchPdfMarkDetail(page);
    getPdfInfo(page, page);
  }

  function noteClick(e: any) {
    e.stopPropagation();
  }

  function notesclickDeal(e: any) {
    const notesIndex = e.target.getAttribute('data-index-key');
    setTargetItem(notesIndex);
    const notesData = curPdfMarkData.current?.styles?.find((item: any) => item.index === Number(notesIndex));
    if (!notesData?.notes) {
      noteDialogHide();
      return;
    }
    const pageWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const w = e.pageX + 300;
    let left = e.pageX;
    if (w > pageWidth) {
      left = left - (w - pageWidth + 20);
    }

    setNoteStyle({
      display: 'block',
      left: left + 'px',
      top: e.pageY + 'px'
    });
    setNotesValue(notesData.notes);
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
    setCurWord(word);
  }

  function textItemClick(e: any) {
    e.stopPropagation();
    speakWord(e.target.innerText);
    setHoverStyle({ display: 'none' });
    notesclickDeal(e);
  }

  // function hideHandler() {}

  function notesChange(e: any) {
    setNotesValue(e.target.value);
  }

  function noteBtnClick() {
    const markList = pdfTextList.map((item, index) => {
      // eslint-disable-next-line no-debugger
      if (index === Number(targetItem)) {
        Object.assign(item, { notes: notesValue, wordStyle: { backgroundColor: '#f3f7fc' } });
        return item;
      }
      return item;
    });
    savePDFDetailHandler(markList);
    noteDialogHide();
  }

  function noteDialogHide() {
    setNotesValue('');
    setNoteStyle({ display: 'none' });
  }

  function remberHandler() {
    localStorage.setItem(
      'englishInfo',
      JSON.stringify({
        ...localStorageGetter('englishInfo'),
        wordCurrentPage: curPageNum
      })
    );
  }

  return (
    // <Spin tip='文档加载中...' spinning={spinning}>
      <div className={styles.main}>
        <TranslateLayer />
        <SpeakWord words={[curWord]} />
        <div className={styles.hover} style={noteStyle} onClick={noteClick}>
          <TextArea rows={4} value={notesValue} onChange={notesChange} onClick={e => e.stopPropagation()} />
          <Button size='small' type='primary' className={styles.noteBtn} onClick={noteBtnClick}>
            确定
          </Button>
        </div>
        <div className={styles.hover} style={hoverStyle} onClick={menuClick}>
          <p className={styles.hoverItem} data-flag='notes' style={{ backgroundColor: '#f3f7fc' }}>
            笔记📒
          </p>
          <p className={styles.hoverItem} style={{ backgroundColor: '#f88080' }}>
            标记（红）
          </p>
          <p className={styles.hoverItem} style={{ backgroundColor: '#fcc256' }}>
            标记（黄）
          </p>

          <p className={styles.hoverItem} data-flag='cancle' style={{ backgroundColor: '#ddd' }}>
            取消标记
          </p>
        </div>
        <div className={styles.pageWrapper}>
          <div className={styles.header}>
            <Pagination
              disabled={paginationDisabled}
              className={styles.pagination}
              showQuickJumper
              pageSize={1}
              current={curPageNum}
              total={total}
              onChange={onPageChange}
            />
            <Button type='primary' onClick={remberHandler} className={styles.remberButton}>
              记住当前页 {curPageNum}
            </Button>
            <Button type='link' onClick={() => navigate('/artical')} className={styles.remberButton}>
              去阅读
            </Button>
          </div>
          <div className={styles.word}>
            <div className={styles.wordMain}>
              <div className={styles.wordMainItem} onClick={textItemClick}>
                {pdfTextList.slice(0, pdfTextList.length / 2).map((item: WordObj, index: number) => {
                  let st;
                  if (item.isTitle) st = <h2 style={{color: 'red'}} data-index-key={item.index}>{item.text}</h2>;
                  else
                    st = (
                      <p style={item.wordStyle} className={styles.wordItem} data-index-key={item.index}>
                        {/* {item.text} */}
                        <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
                        {item.notes && <span style={{float: 'right'}}>📒📓</span>}
                      </p>
                    );
                  return <div key={index}>{st}</div>;
                })}
              </div>
            </div>
            <div className={styles.wordMain}>
              <div className={styles.wordMainItem} onClick={textItemClick}>
                {pdfTextList.slice(pdfTextList.length / 2).map((item: WordObj, index: number) => {
                  let st;
                  if (item.isTitle) st = <h2 style={{color: 'red'}} data-index-key={item.index}>{item.text}</h2>;
                  else
                    st = (
                      <p style={item.wordStyle} className={styles.wordItem} data-index-key={item.index}>
                        {/* {item.text} */}
                        <span dangerouslySetInnerHTML={{ __html: item.text }}></span>
                        {item.notes && <span>📒📓</span>}
                      </p>
                    );
                  return <div key={index}>{st}</div>;
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    // </Spin>
  );
}
