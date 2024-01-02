import React, { useState, useRef, useEffect, ElementRef, useMemo } from 'react';
import { EditOutlined, MinusCircleOutlined, NotificationOutlined, AlertOutlined, FontColorsOutlined } from '@ant-design/icons';
import { Modal, Input, Tooltip } from 'antd';
import SpeakWord, { AudioComponentMethods } from '@/components/speakWord';
import styles from './newWord.module.scss';

interface NewWordProps {
  data: Array<string>;
  newWordItemClick?: (e: any, pText: string) => void;
  onRemoveNewWord?: (key: number) => void;
  changeNewWord?: (data: any) => void;
  onMarkStrong?: (index: number, data: any) => void;
}

interface IWord {
  value: string,
  show: boolean,
  strong: boolean,
  example: string,
  translate: string,
}

const { TextArea } = Input;

const NewWord: React.FunctionComponent<NewWordProps> = (props) => {
  const [hiddenExtraWord, setHiddenExtraWord] = useState<boolean>(false);
  const [curWord, setCurWord] = useState<string[]>([]);
  const audioRef = useRef<AudioComponentMethods>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wordValue, steWordValue] = useState({
    text: '',
    index: 0
  });
  const [newWords, setNewWords] = useState<IWord[]>([]);

  useEffect(() => {
    setNewWords(props.data?.map((item) => {
      const strs = item.split('@');
      const extraStr = strs[1];
      let extraData = {
        strong: false,
        example: '',
        translate: '',
      };
      try {
        if(extraStr) extraData = JSON.parse(extraStr);
      } catch(e) {}
      return {
        value: strs[0],
        show: false,
        ...extraData,
      }
      })
    );
  }, [props.data]);

  useEffect(() => {
    const handler = () => {
      audioRef.current?.stopAudio();
    }
    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('click', handler);
    }
  }, []);

  function speakNewWord(e: any) {
    e.stopPropagation();
    const newWordWrapper = document.querySelectorAll('.new-word-text');
    newWordWrapper.forEach((item, index) => {
      if (newWords[index].strong) return;
      (item as HTMLElement).style.color = '';
    });

    const list = props.data?.map(item => {
      return item.split('#')[0].split('：')[0];
    });

    setCurWord(list);
  }

  function newWordClick(e: any, text = '', index: number) {
    e.stopPropagation();
    const word = text.split('：')[0];
    setCurWord([word]);
    props.newWordItemClick && props.newWordItemClick(e, text);

    setNewWords(newWords.map((item, i) => {
      return index === i ? {
        ...item,
        show: !item.show,
      } : {...item};
    }));
  }

  function removeNewWord(key: number, e: any) {
    e.stopPropagation();
    props.onRemoveNewWord && props.onRemoveNewWord(key);
  }


  function audioSuccese(index: number) {
    const length = curWord.length;
    if (length <= 1) return;
    const newWordWrapper = document.querySelectorAll('.new-word-text');
    if (index > 0 && !newWords[index - 1]?.strong) {
      (newWordWrapper[index - 1] as HTMLElement).style.color = '';
      (newWordWrapper[index - 1] as HTMLElement).style.fontWeight = '';
    }
    (newWordWrapper[index] as HTMLElement).style.color = '#b92509';
    (newWordWrapper[index] as HTMLElement).style.fontWeight = '600';
  }

  function expandNewWord(e: any) {
    e.stopPropagation();
    setHiddenExtraWord(!hiddenExtraWord);
  }

  function modalOkHandler() {
    props.changeNewWord && props.changeNewWord(wordValue);
    setIsModalOpen(false);
  }

  function textChange(e: any) {
    steWordValue({
      ...wordValue,
      text: e.target.value
    });
  }

  function editNewWord(data: any, index: number, e: any) {
    e.stopPropagation();
    setIsModalOpen(true);
    steWordValue({
      ...data,
      text: data.value,
      index
    });
  }

  const showAndHide = () => {
    setNewWords(newWords.map(item => {
      return {
        ...item,
        show: !item.show,
      };
    }));
  }

  const markStrong = (index: number, data: any, e: any) => {
    e.stopPropagation();
    props.onMarkStrong && props.onMarkStrong(index, data);
  }

  return <div className={styles.newWordWrapper}>
    <SpeakWord words={curWord} interval={1000} onSuccese={audioSuccese} ref={audioRef} />
      <Modal title='修改单词' open={isModalOpen} onOk={modalOkHandler} onCancel={() => setIsModalOpen(false)}>
        <TextArea rows={4} value={wordValue.text} onChange={textChange} />
      </Modal>
    <h3>
      生词
      <NotificationOutlined className={styles.speakWord} onClick={speakNewWord} />
      <AlertOutlined className={styles.speakWord} onClick={showAndHide} />
      <span className={styles.newWordMode} onClick={expandNewWord}>
        {hiddenExtraWord ? '快读模式' : '详细模式'}
      </span>
    </h3>
    <div>
      {newWords?.map((item, key: number) => {
        const textList = item.value?.split('#');
        const ding = textList?.map((pText: string, index: number) => {
          const textArr = pText?.split('：') || [];
          if (index === 0)
            return (
              <p className={`${styles.newWordItemTitle}`} key={index} onClick={e => newWordClick(e, pText, key)}>
                {
                  item.example ? <Tooltip placement='topRight' title={() => {
                      return <p className={styles['newWord-example']}><span>{item.example}</span><span className={styles['newWord-example-translate']}>：{item.translate}</span></p>;
                    }} color='#282c2e'>
                      <span className='new-word-text' style={ item.strong ? {color: '#374eec', fontWeight: '600'} : undefined}>{key + 1}：{textArr[0]}</span>
                    </Tooltip> :
                    <span className='new-word-text' style={ item.strong ? {color: '#374eec', fontWeight: '600'} : undefined}>{key + 1}：{textArr[0]}</span>
                }
                {item.show ? <span>：<span>{textArr[1]}</span></span> : null}
                <MinusCircleOutlined style={{ color: 'red' }} onClick={(e) => removeNewWord(key, e)} />
                <EditOutlined className={styles.editNewWord} onClick={e => editNewWord(item, key, e)} />
                <FontColorsOutlined onClick={(e) => markStrong(key, item, e)} />
              </p>
            );
          else
            return (
              hiddenExtraWord && (
                <p className={styles.newWordItemText} key={index}>
                  {pText.slice(0, 20)}
                </p>
              )
            );
        });
        return (
          <div key={key + item.value} className={styles.newWordItemWrapper}>
            {ding}
          </div>
        );
      })}
    </div>
  </div>
}

export default NewWord;