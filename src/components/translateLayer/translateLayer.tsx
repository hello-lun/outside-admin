
import { useState, useRef, useEffect, ElementRef } from 'react';
import { PlusCircleOutlined, FontColorsOutlined } from '@ant-design/icons';
import sha256 from 'crypto-js/sha256';
import styles from './translateLayer.module.scss';
import SpeakWord, { AudioComponentMethods } from '@/components/speakWord';
import { isMobile } from '@/utils/helper';

interface PText {
  text: string;
  pText: string[];
  webText: string[];
}

function isWholeWord(word: string) {
  const separators = [' ', ',', '.', '!', '?', ';', ':', '\t', '\n']; // 可能的分隔符列表

  for (const separator of separators) {
    if (word.includes(separator)) {
      return false; // 如果单词包含分隔符，则不是完整单词
    }
  }

  return true; // 单词不包含分隔符，则是完整单词
}

function truncate(q: any) {
  const len = q.length;
  if (len <= 20) return q;
  return q.substring(0, 10) + len + q.substring(len - 10, len);
}

interface TranslateProps {
  // visible: boolean;
  audio?: boolean;
  onAddNewWord?: (data: {
    translator: string | PText
  }) => void;
  onMarkArtical?: (data: {
    word: string[]
  }) => void;
  onWordChange?: (word: string[]) => void;
}

const TranslateLayer: React.FunctionComponent<TranslateProps> = (props) => {
  const [articalStyle, setArticalStyle] = useState<object>({});
  const hoverContentRef = useRef<ElementRef<'div'>>(null);
  const curWord = useRef<string[]>([]);
  const [translator, setTranslator] = useState<string | PText>('');
  const audioRef = useRef<AudioComponentMethods>(null);
  const touchStartTime = useRef(0);

  useEffect(() => {
    props.onWordChange && props.onWordChange(curWord.current);
  }, [curWord.current]);

  useEffect(() => {
    const touchendHandler = (e: any) => {
      const touchEndTime = Date.now();
        const elapsed = touchEndTime - touchStartTime.current;
        if (elapsed > 500) {  // 例如，我们设置长按为超过500毫秒
            const selectedText = window.getSelection()?.toString();
            if (selectedText) {
              selectTextHandler(e);
            }
        }
    }

    const touchstartHan = () => {
      touchStartTime.current = Date.now();
    }

    const touchContext = function(e: any) {
      e.preventDefault();
    }

    if (isMobile()) {
      document.addEventListener('contextmenu', touchContext);
      document.addEventListener('touchstart', touchstartHan);

      document.addEventListener('touchend', touchendHandler);
    } else {
      document.onmouseup = (e: any) => {
        selectTextHandler(e);
      };
    }

    const handler = () => {
      audioRef.current?.stopAudio();
      setArticalStyle({
        display: 'none'
      });
    }

    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('touchstart', touchstartHan);
      document.removeEventListener('touchend', touchendHandler);
      document.removeEventListener('contextmenu', touchContext);
    }
  }, []);

  async function selectTextHandler(e: any) {
    const selectedText = window.getSelection()?.toString()?.trim();
    if (selectedText) {
      const data = await translateArtical(selectedText);
      const text = data.translation?.[0];
      // setSpeakWordUrl(`http://dict.youdao.com/dictvoice?audio=${word}`);
      curWord.current = [selectedText];
      const isSingleWord = isWholeWord(selectedText);
      if (isSingleWord) {
        const pText = data?.basic?.explains || [];
        const webText = data.web || [];
        setTranslator({
          text,
          pText,
          webText
        });
      } else {
        setTranslator(text);
      }

      setArticalStyle({
        display: 'block',
        left: -1000 + 'px'
      });
      setTimeout(() => {
        hoverStyleEvent(e);
      });
    }
  }


  async function translateArtical(query: string) {
    const appKey = '57c14d8eda6766a0';
    const key = 'DjWfsVN4NGrZGMESEvFo0yrCcWxluswc'; //注意：暴露appSecret，有被盗用造成损失的风险
    const salt = new Date().getTime();
    const curtime = Math.round(new Date().getTime() / 1000);
    // 多个query可以用\n连接  如 query='apple\norange\nbanana\npear'
    const from = 'en';
    const to = 'zh-CHS';
    const str1 = appKey + truncate(query) + salt + curtime + key;
    const vocabId = '您的用户词表ID';

    const sign = sha256(str1).toString();
    return await $.ajax({
      url: 'https://openapi.youdao.com/api',
      type: 'post',
      dataType: 'jsonp',
      data: {
        q: query,
        appKey: appKey,
        salt: salt,
        from: from,
        to: to,
        sign: sign,
        signType: 'v3',
        curtime: curtime,
        vocabId: vocabId
      }
    });
  }

  function addNewWord() {
    props.onAddNewWord && props.onAddNewWord({
      translator
    });
  }

  function markArtical() {
    props.onMarkArtical && props.onMarkArtical({
      word: curWord.current
    });
  }

  function hoverStyleEvent(e: any) {
    const pageWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const pageHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const scrollTop = document.documentElement.scrollTop + pageHeight;
    const divH = hoverContentRef.current?.offsetHeight || 400;
    const w = e.pageX + 400;
    const h = e.pageY + divH;
    let left = e.pageX;
    let top = e.pageY + 20;
    if (w > pageWidth) {
      left = pageWidth - 420;
    }

    if (h > scrollTop) {
      top = e.pageY - divH - 20;
    }

    if (isMobile()) {
      setArticalStyle({
        display: 'block',
        top: 100 + 'px',
        width: '90%',
        margin: '0 auto'
      });
    } else {
      setArticalStyle({
        display: 'block',
        left: left + 'px',
        top: top + 'px'
      });
    }
  }

  const contentClick = (e: any) => {
    e.stopPropagation();
  }

  return <div className={styles.hover} style={articalStyle} ref={hoverContentRef}>
    <SpeakWord words={curWord.current} interval={1000} ref={audioRef} />
    {typeof translator === 'string' ? (
      <p>
        <span onClick={contentClick}>{translator}</span>
        {props.onAddNewWord && <PlusCircleOutlined className={styles.newWord} onClick={addNewWord} />}
        {props.onMarkArtical && <FontColorsOutlined className={styles.markArtical} onClick={markArtical} />}
      </p>
    ) : (
      <div className={styles.translateText}>
        <h3>
          {translator?.text}
          {props.onAddNewWord && <PlusCircleOutlined className={styles.newWord} onClick={addNewWord} />}
        </h3>
        <div onClick={contentClick}>
          {translator?.pText.map((item: string) => {
            return <p key={item}>{item}</p>;
          })}
          <h4>例句：</h4>
          {translator?.webText.map((item: any) => {
            return (
              <p key={item.key}>
                {item.key}: {item.value.toString()}
              </p>
            );
          })}
        </div>
      </div>
    )}
  </div>;
}

export default TranslateLayer;