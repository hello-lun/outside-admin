import React, { useState, useEffect, useRef } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import styles from './pdf.module.scss';
import { Pagination, Button, Input, Spin } from 'antd';
import { useOnceEffect } from '@/hooks/onceEffect';
import { translatePDF, savePDFDetail, getPDFMarkDetail, getArticals } from '../../service/translate';
import { localStorageGetter } from '@/utils/helper';

import pds from '../../assets/english-word.pdf';

const { TextArea } = Input;

// pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.js', import.meta.url).toString();
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface AnyObject {
  backgroundColor?: string;
  [key: string]: any;
}
interface WordObj {
  text: string;
  index?: number;
  notes: string;
  wordStyle: AnyObject;
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
  const [targetItem, setTargetItem] = useState<number>();
  const [notesValue, setNotesValue] = useState<string>('');
  const [curWord, setCurWord] = useState<string>('');
  const [spinning, setSpinning] = useState<boolean>(false);
  const [speakWordUrl, setSpeakWordUrl] = useState<string>('');
  const [artical, setArtical] = useState<string>('');

  async function getPdfdata() {
    const pdf = await pdfjs.getDocument(pds).promise;
    setTotal(pdf.numPages);
  }

  useOnceEffect(() => {
    addEvent();
    getPdfdata();
    initPageNum();
  });

  function getPdfInfo(startNum: number, endNum: number) {
    translatePDF({
      startNum,
      endNum
    }).then((res: any) => {
      const dataArray = res.pageText.split('\n');
      const list: WordObj[] = [];
      const styleData = curPdfMarkData.current?.styles || [];
      dataArray.forEach((item: string, index: number) => {
        const styleItem =
          styleData.find((ele: any) => {
            return ele.index === index;
          }) || {};
        list.push({ text: item, notes: styleItem.notes, index: index, wordStyle: styleItem.wordStyle });
      });

      setPdfTextList(list);
      setSpinning(false);
    });
  }

  function addEvent() {
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
  }

  function initPageNum() {
    onChange(localStorageGetter('parseData', 'currentPage'));
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
    setTotal(pdfDetail.numPages);
  }

  function onChange(page: number) {
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

  function audioError() {
    try {
      speak(curWord, {
        pitch: 40,
        voice: 'en/en-us',
        amplitude: 200,
        wordgap: 30
      });
    } catch (err) {
      console.log('err: ', err);
    }
  }

  function speakWord(text: string) {
    const word = getFirstEnglishWord(text);
    if (!word) return;
    setCurWord(word);
    setSpeakWordUrl('');
    setSpeakWordUrl(`http://dict.youdao.com/dictvoice?audio=${word}`);
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
      'pdfInfo',
      JSON.stringify({
        currentPage: curPageNum
      })
    );
  }

  return (
    <Spin tip='文档加载中...' spinning={spinning}>
      <div className='Example'>
        <p dangerouslySetInnerHTML={{ __html: artical }}></p>
        <audio autoPlay src={speakWordUrl} onError={audioError}></audio>
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
        <div className='Example__container'>
          <div className={styles.pageWrapper}>
            <div style={{ textAlign: 'center' }}>
              <Pagination className={styles.pagination} showQuickJumper pageSize={1} defaultCurrent={curPageNum} total={total} onChange={onChange} />
              <Button type='primary' onClick={remberHandler} className={styles.remberButton}>
                记住当前页 {curPageNum}
              </Button>
            </div>
            <div className={styles.word}>
              <div className={styles.wordMain}>
                <div className={styles.wordMainItem} onClick={textItemClick}>
                  {pdfTextList.slice(0, pdfTextList.length / 2).map((item: WordObj, index: number) => {
                    let st;
                    if (/^[0-9]/.test(item.text.trim())) st = <h3 data-index-key={item.index}>{index === 0 ? `第${item.text}页` : item.text}</h3>;
                    else
                      st = (
                        <p style={item.wordStyle} className={styles.wordItem} data-index-key={item.index}>
                          {item.text}
                          {item.notes && <span>📒📓</span>}
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
                    if (/^[0-9]/.test(item.text.trim())) st = <h3 data-index-key={item.index}>{index === 0 ? `第${item.text}页` : item.text}</h3>;
                    else
                      st = (
                        <p style={item.wordStyle} className={styles.wordItem} data-index-key={item.index}>
                          {item.text}
                          {item.notes && <span>📒📓</span>}
                        </p>
                      );
                    return <div key={index}>{st}</div>;
                  })}
                </div>
              </div>
            </div>
          </div>
          {/* <div className='Example__container__document'>
          <Document onItemClick={itemClick} renderMode='svg' file={pds} onLoadSuccess={onDocumentLoadSuccess} options={options}>
            <Page width={pageWidth} pageNumber={pageNum} />
          </Document>
        </div> */}
        </div>
      </div>
    </Spin>
  );
}
