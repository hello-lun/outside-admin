export enum ArticalTypeEnum {
  FAIRY = 'fairy',
  BIOGRAPHY = 'biography',
  FABLE = 'fable',
  FOLK = 'folk',
  SHUANGYU = 'shuangyu',
  SHORTSTORY = 'shortStory',
  REACTDOC = 'react',
  IELTS = 'ielts',
}

export const articalTypes = [
  {
    label: '童话故事',
    value: ArticalTypeEnum.FAIRY,
  },
  {
    label: '雅思阅读',
    value: ArticalTypeEnum.IELTS,
  },
  {
    label: '名人传记',
    value: ArticalTypeEnum.BIOGRAPHY,
  },
  {
    label: '寓言故事',
    value: ArticalTypeEnum.FABLE,
  },
  {
    label: '民间故事',
    value: ArticalTypeEnum.FOLK,
  },
  {
    label: '双语故事',
    value: ArticalTypeEnum.SHUANGYU,
  },
  {
    label: '短片小说',
    value: ArticalTypeEnum.SHORTSTORY,
  },
  {
    label: 'react文档',
    value: ArticalTypeEnum.REACTDOC,
  },
];