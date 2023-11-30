import { PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Drawer,
  Typography,
  Form,
  Input,
  FormInstance,
  Spin,
  Table,
  Upload,
} from 'antd';
import { useToken } from '@/hooks/useToken';
import styles from './banners.module.scss';
import { get } from 'lodash-es';
import { addBanners, editBanners, getBanners, deleteBanners } from '@/service/banners'; 
import { catchError } from '@/utils/helper';
import type { ColumnsType } from 'antd/es/table';

const baseUrl = `${process.env.REACT_APP_IMG_URL}${process.env.REACT_APP_API_PRE}/`;

interface IFormData {
  id?: number;
  title?: string;
  details?: string;
  brand?: string;
  category?: string;
  img: string | any[];
}

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const initialValues: IFormData = {
  title: '',
  details: '',
  brand: '',
  category: '',
  img: [],
}

const Goods: React.FC = () => {
  const [componentDisabled, setComponentDisabled] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);
  const token = useToken();
  const [formData, setFormData] = useState<IFormData>({...initialValues});
  const formRef = React.useRef<FormInstance>(null);
  const [spinning, setSpinning] = useState(false);

  const getData = async () => {
    setSpinning(true);
    const [, res] = await catchError<any>(getBanners());
    setSpinning(false);
    setTableData(res);
  }

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    open && formRef.current && formRef.current.setFieldsValue({
      ...formData,
    });
  }, [open]);

  const remove = async (data: IFormData) => {
    data.id && await deleteBanners(data);
    getData();
  }

  const editGoodsHandler = (data: IFormData) => {
    setOpen(true);
    setFormData({
      ...data,
      img: (data.img as string)?.split(',').map(i => ({url: `${baseUrl}${i}`})),
    });
  }

  const columns: ColumnsType<IFormData> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: '100px'
    },
    {
      title: '轮播图title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '轮播图详情',
      dataIndex: 'details',
      key: 'details',
    },
    {
      title: '轮播图图片',
      dataIndex: 'img',
      key: 'img',
      render(data) {
        return <img style={{width: '100px'}} src={baseUrl + data}></img>
      },
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      key: 'operation',
      width: '110px',
      render: (_: any, record: IFormData) => {
        return <span>
          <Typography.Link onClick={() => editGoodsHandler(record)}>
            编辑
          </Typography.Link>
          ｜
          <Typography.Link onClick={() => remove(record)}>
            删除
          </Typography.Link>
        </span>
      },
    },
  ];
  
  const finishHandler = async (data: any) => {
    const { img } = data;
    let promiseHandler = null;
    let postData = {};
    // 批量添加
    if (formData.id) {
      promiseHandler = editBanners;
      postData = {
        ...data,
        id: formData.id,
        parentId: data.parentId || 0,
        img: get(img[0], 'response.data.src'),
      };
    } else {
      promiseHandler = addBanners;
      postData= {
        ...data,
        id: formData.id,
        parentId: data.parentId || 0,
        img: get(img[0], 'response.data.src'),
      }
    }
    setComponentDisabled(true);
    const [err] = await catchError(promiseHandler(postData));
    setComponentDisabled(false);
    if (!err) {
      getData();
      setOpen(false);
    }
  }

  const onClose = () => {
    setOpen(false);
    formRef.current && formRef.current.resetFields();
  }

  return (
    <>
      <Spin tip="数据加载中..." spinning={spinning}>
        <div className={styles.content}>
          <div style={{padding: "0 0 20px 0"}}>
            <Button type='primary' htmlType="submit" onClick={() => setOpen(true)}>添加轮播图</Button>
          </div>
          <div className={styles.imgContent}>
            <Table bordered columns={columns} dataSource={tableData} />
          </div>
        </div>
      </Spin>
      <Drawer
        title={formData.id ? '编辑' : '新增'}
        width={820}
        onClose={onClose}
        open={open}
        bodyStyle={{ paddingBottom: 80 }}>
        <Form
          ref={formRef}
          initialValues={initialValues}
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          layout="horizontal"
          disabled={componentDisabled}
          onFinish={finishHandler}
          style={{ maxWidth: 600, margin: '0 auto' }}
        >
          <div>
            <Form.Item rules={[{ required: true}]} label="轮播图图片" valuePropName="fileList" getValueFromEvent={normFile} name="img">
              <Upload
                action={`${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_PRE}/sys/user/uploadImage`}
                listType="picture-card"
                maxCount={1}
                headers={{
                  token
                }}>
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
          </div>
          <Form.Item label="轮播图title" name='title'>
            <Input />
          </Form.Item>
          <Form.Item label="轮播图描述" name='details'>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type='primary' htmlType="submit">
              {formData.id ? '编辑' : '添加'}
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default () => <Goods />;