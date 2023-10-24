/* eslint-disable */
// @ts-nocheck
import React, { PureComponent } from 'react';
import { Spin, Tooltip, Input } from 'antd';
import styles from './File.less';
import pds from '../../assets/english-word.pdf';

import { LeftOutlined, RightOutlined, ArrowsAltOutlined, ShrinkOutlined, RetweetOutlined } from '@ant-design/icons';

import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

class File extends PureComponent {
  state = {
    pageNumber: 1,
    pageNumberInput: 1,
    pageNumberFocus: false,
    numPages: 1,
    pageWidth: 600,
    fullscreen: false
  };

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages: numPages });
  };

  lastPage = () => {
    if (this.state.pageNumber == 1) {
      return;
    }
    const page = this.state.pageNumber - 1;
    this.setState({ pageNumber: page, pageNumberInput: page });
  };
  nextPage = () => {
    if (this.state.pageNumber == this.state.numPages) {
      return;
    }
    const page = this.state.pageNumber + 1;
    this.setState({ pageNumber: page, pageNumberInput: page });
  };
  onPageNumberFocus = e => {
    this.setState({ pageNumberFocus: true });
  };
  onPageNumberBlur = e => {
    this.setState({ pageNumberFocus: false, pageNumberInput: this.state.pageNumber });
  };
  onPageNumberChange = e => {
    let value = e.target.value;
    value = value <= 0 ? 1 : value;
    value = value >= this.state.numPages ? this.state.numPages : value;
    this.setState({ pageNumberInput: value });
  };
  toPage = e => {
    this.setState({ pageNumber: Number(e.target.value) });
  };

  pageZoomOut = () => {
    if (this.state.pageWidth <= 600) {
      return;
    }
    const pageWidth = this.state.pageWidth * 0.8;
    this.setState({ pageWidth: pageWidth });
  };
  pageZoomIn = () => {
    const pageWidth = this.state.pageWidth * 1.2;
    this.setState({ pageWidth: pageWidth });
  };

  pageFullscreen = () => {
    if (this.state.fullscreen) {
      this.setState({ fullscreen: false, pageWidth: 600 });
    } else {
      this.setState({ fullscreen: true, pageWidth: window.screen.width - 40 });
    }
  };

  render() {
    const { pageNumber, pageNumberFocus, pageNumberInput, numPages, pageWidth, fullscreen } = this.state;
    return (
      <div className={styles.view}>
        <div className={styles.pageContainer}>
          <Document file={pds} onLoadSuccess={this.onDocumentLoadSuccess} loading={<Spin size='large' />}>
            <Page pageNumber={pageNumber} width={pageWidth} loading={<Spin size='large' />} />
          </Document>
        </div>

        <div className={styles.pageTool}>
          <Tooltip title={pageNumber == 1 ? '已是第一页' : '上一页'}>
            <LeftOutlined type='left' onClick={this.lastPage} />
          </Tooltip>
          <Input
            value={pageNumberFocus ? pageNumberInput : pageNumber}
            onFocus={this.onPageNumberFocus}
            onBlur={this.onPageNumberBlur}
            onChange={this.onPageNumberChange}
            onPressEnter={this.toPage}
            type='number'
          />{' '}
          / {numPages}
          <Tooltip title={pageNumber == numPages ? '已是最后一页' : '下一页'}>
            <RightOutlined type='right' onClick={this.nextPage} />
          </Tooltip>
          <Tooltip title='放大'>
            <ArrowsAltOutlined type='plus-circle' onClick={this.pageZoomIn} />
          </Tooltip>
          <Tooltip title='缩小'>
            <ShrinkOutlined type='minus' onClick={this.pageZoomOut} />
          </Tooltip>
          <Tooltip title={fullscreen ? '恢复默认' : '适合窗口'}>
            <RetweetOutlined type={fullscreen ? 'fullscreen-exit' : 'fullscreen'} onClick={this.pageFullscreen} />
          </Tooltip>
        </div>
      </div>
    );
  }
}

export default props => <File {...props} />;
