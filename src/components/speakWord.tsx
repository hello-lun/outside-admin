import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { sleep } from '@/utils/helper';
export interface AudioComponentMethods {
  // 定义子组件暴露给父组件的方法
  stopAudio: () => void;
  playAudio: () => void;
  playWordAudio: (words: string[] | string) => void;
}

let speakEndFlag = false;

interface AudioComponentProps {
  words: string[];
  interval?: number;
  quickly?: boolean;
  onSuccese?: (index: number) => void;
}

function speak(text?: string, end?: () => void) {
  const synth = window.speechSynthesis;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-GB';
  utterance.rate = 0.7; // 比正常速度慢

  end && (utterance.onend = end);

  synth.speak(utterance);
}

const SpeakWord: React.ForwardRefRenderFunction<AudioComponentMethods, AudioComponentProps> = (props, ref) => {
  const [speakWordUrl, setSpeakWordUrl] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioListRef = useRef<string[]>([]);
  const curretIndex = useRef(0);

  function stopAudio() {
    audioRef.current?.pause();
  }

  function playAudio() {
    audioRef.current && (audioRef.current.muted = true);
    const p = audioRef.current?.play();
    p?.then(res => {
      audioRef.current && (audioRef.current.muted = false);
      audioRef.current?.pause()
      setTimeout(() => {
        audioRef.current?.play()
      }, 10)
    }).catch(e => {
    })
  }

  function speakWord(word: string) {
    props.quickly ? speak(word) : setSpeakWordUrl(`http://dict.youdao.com/dictvoice?audio=${word}`);
  }

  async function playWordAudio(words: string[] | string) {
    if (words instanceof Array) {
      audioEnd();
    } else {
      props.quickly ? speak(words) : setSpeakWordUrl(`http://dict.youdao.com/dictvoice?audio=${words}`);
    }
  }

  function audioEnd() {
    if (audioListRef.current.length > 0) {
      const interval = props.interval || 0;
      const word = audioListRef.current.shift();
      if (interval > 0) {
        setTimeout(() => {
          props.quickly ? speak(word) : setSpeakWordUrl(`http://dict.youdao.com/dictvoice?audio=${word}`);
        }, interval);
      } else {
        props.quickly ? speak(word) : setSpeakWordUrl(`http://dict.youdao.com/dictvoice?audio=${word}`);
      }
    }
  }

  function audioLoad() {
    props.onSuccese && props.onSuccese(curretIndex.current);
    curretIndex.current = ++curretIndex.current;
    playAudio();
  }

  async function speakHandler(w: string) {
    return new Promise((resolve) => {
      speakEndFlag = true;
      speak(w, async () => {
        audioLoad();
        speakEndFlag = false;
        // await sleep(2000);
        resolve(true);
      });
    });
  }

  useEffect(() => {
    audioListRef.current = [...props.words];
    curretIndex.current = 0;
    speakEndFlag = false;
    if (props.quickly) {
      (async () => {
        while(audioListRef.current.length > 0) {
          if(!speakEndFlag) {
            const word = audioListRef.current.shift();
            if(props.interval) {
                await sleep(props.interval);
                word && await speakHandler(word);
            } else {
              word && await speakHandler(word);
            }
          } else {
            continue;
          }
        }
      })()
    } else {
      const word = audioListRef.current.shift() || '';
      if (!word) return;
      setSpeakWordUrl(new String(`http://dict.youdao.com/dictvoice?audio=${word}`) as string);
    }
  }, [props.words]);

  useImperativeHandle(ref, () => ({
    // changeVal 就是暴露给父组件的方法
    stopAudio,
    playAudio,
    playWordAudio
  }));

  function audioError() {
    try {
      if (props.words[0]?.trim())
        speak(props.words[0]);
    } catch (err) {
    }
  }

  return <audio src={speakWordUrl} onEnded={audioEnd} onError={audioError} onLoadedMetadata={audioLoad} ref={audioRef}></audio>;
};

export default forwardRef(SpeakWord);
