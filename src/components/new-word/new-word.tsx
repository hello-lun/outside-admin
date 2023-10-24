import React, { useState, useRef, useEffect, ElementRef } from 'react';
import { EditOutlined, MinusCircleOutlined, NotificationOutlined } from '@ant-design/icons';
import { Modal, Input } from 'antd';
import SpeakWord, { AudioComponentMethods } from '@/components/speakWord';
import styles from './newWord.module.scss';

interface NewWordProps {
  data: Array<string>;
  newWordItemClick?: (e: any, pText: string) => void;
  onRemoveNewWord?: (key: number) => void;
  changeNewWord?: (data: any) => void;
}

const { TextArea } = Input;

const NewWord: React.FunctionComponent<NewWordProps> = (props) => {
  const [hiddenExtraWord, setHiddenExtraWord] = useState<boolean>(false);
  const [curWord, setCurWord] = useState<string[]>([]);
  const audioRef = useRef<AudioComponentMethods>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wordValue, steWordValue] = useState<{ text: string; index: number }>({
    text: '',
    index: 0
  });

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
    newWordWrapper.forEach(item => {
      (item as HTMLElement).style.color = '';
    });

    const list = props.data.map(item => {
      return item.split('#')[0].split('：')[0];
    });

    setCurWord(list);
  }

  function newWordClick(e: any, text = '') {
    e.stopPropagation();
    const word = text.split('：')[0];
    setCurWord([word]);
    props.newWordItemClick && props.newWordItemClick(e, text);
  }

  function removeNewWord(key: number) {
    props.onRemoveNewWord && props.onRemoveNewWord(key);
  }


  function audioSuccese(index: number) {
    const length = curWord.length;
    if (length <= 1) return;
    const newWordWrapper = document.querySelectorAll('.new-word-text');
    if (index > 0) {
      (newWordWrapper[index - 1] as HTMLElement).style.color = '';
    }
    (newWordWrapper[index] as HTMLElement).style.color = '#b92509';
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

  function editNewWord(data: string, index: number, e: any) {
    e.stopPropagation();
    setIsModalOpen(true);
    steWordValue({
      text: data,
      index
    });
  }

  return <div className={styles.newWordWrapper}>
    <SpeakWord words={curWord} interval={1000} onSuccese={audioSuccese} ref={audioRef} />
    <Modal title='修改单词' open={isModalOpen} onOk={modalOkHandler} onCancel={() => setIsModalOpen(false)}>
        <TextArea rows={4} value={wordValue.text} onChange={textChange} />
      </Modal>
    <h3>
      生词
      <NotificationOutlined className={styles.speakWord} onClick={speakNewWord} />
      <span className={styles.newWordMode} onClick={expandNewWord}>
        {hiddenExtraWord ? '快读模式' : '详细模式'}
      </span>
    </h3>
    <div>
      {props.data.map((item: string, key: number) => {
        const textList = item.split('#');
        const ding = textList.map((pText: string, index: number) => {
          if (index === 0)
            return (
              <p className={`${styles.newWordItemTitle}`} key={index} onClick={e => newWordClick(e, pText)}>
                <span className='new-word-text'>{pText}</span>
                <MinusCircleOutlined style={{ color: 'red' }} onClick={() => removeNewWord(key)} />
                <EditOutlined className={styles.editNewWord} onClick={e => editNewWord(item, key, e)} />
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
          <div key={key + item} className={styles.newWordItemWrapper}>
            {ding}
          </div>
        );
      })}
    </div>
  </div>
}

export default NewWord;