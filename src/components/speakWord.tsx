import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

export interface AudioComponentMethods {
  // 定义子组件暴露给父组件的方法
  stopAudio: () => void;
  playAudio: () => void;
  playWordAudio: (words: string[] | string) => void;
}

interface AudioComponentProps {
  words: string[];
  interval?: number;
  onSuccese?: (index: number) => void;
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
      console.log('e: ', e);
    })
  }

  async function playWordAudio(words: string[] | string) {
    if (words instanceof Array) {
      audioEnd();
    } else {
      setSpeakWordUrl(`http://dict.youdao.com/dictvoice?audio=${words}`);
    }
  }

  function audioEnd() {
    if (audioListRef.current.length > 0) {
      const interval = props.interval || 0;
      const word = audioListRef.current.shift();
      if (interval > 0) {
        setTimeout(() => {
          setSpeakWordUrl(`http://dict.youdao.com/dictvoice?audio=${word}`);
        }, interval);
      } else {
        setSpeakWordUrl(`http://dict.youdao.com/dictvoice?audio=${word}`);
      }
    }
  }

  function audioLoad() {
    props.onSuccese && props.onSuccese(curretIndex.current);
    curretIndex.current = ++curretIndex.current;
    playAudio();
  }

  useEffect(() => {
    audioListRef.current = [...props.words];
    curretIndex.current = 0;
    const word = audioListRef.current.shift() || '';
    if (word) {
      setSpeakWordUrl(`http://dict.youdao.com/dictvoice?audio=${word}`);
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
        speak(props.words[0], {
          pitch: 40,
          voice: 'en/en-us',
          amplitude: 200,
          wordgap: 30
        });
    } catch (err) {
      console.log('err: ', err);
    }
  }

  return <audio src={speakWordUrl} onEnded={audioEnd} onError={audioError} onLoadedMetadata={audioLoad} ref={audioRef}></audio>;
};

export default forwardRef(SpeakWord);
