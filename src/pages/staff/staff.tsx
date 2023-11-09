import { PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Drawer,
  Checkbox,
  DatePicker,
  Form,
  Input,
  FormInstance,
  Spin,
  Select,
  Slider,
  Switch,
  TreeSelect,
  Upload,
} from 'antd';
import { useToken } from '@/hooks/useToken';
import styles from './staff.module.scss';
import { get } from 'lodash-es';
import { addStaff, editStaff, getStaff, deleteStaff } from '@/service/staff'; 
import { catchError } from '@/utils/helper';

const { RangePicker } = DatePicker;
const { TextArea } = Input;
const baseUrl = 'http://localhost:8888/api/';

interface IFormData {
  id?: number;
  title: string;
  details: string;
  name: string;
  img: string | string[];
  wechat: string;
  phone: string;
  whatsapp: string;
  email: string;
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
  name: '',
  img: [],
  wechat: '',
  phone: '',
  whatsapp: '',
  email: '',
}

const Goods: React.FC = () => {
  const [componentDisabled, setComponentDisabled] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [staffs, setStaff] = useState<any[]>([]);
  const token = useToken();
  const [formData, setFormData] = useState<IFormData>({...initialValues});
  const formRef = React.useRef<FormInstance>(null);
  const [spinning, setSpinning] = useState(false);

  const getData = async () => {
    setSpinning(true);
    const [, res] = await catchError<any>(getStaff());
    setStaff(res.map((item: any) => ({
      ...item,
    })));
    setSpinning(false);
  }

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    open && formRef.current && formRef.current.setFieldsValue({
      ...formData,
    });
  }, [open]);

  const finishHandler = async (data: any) => {
    const { img } = data;
    let promiseHandler = null;
    let postData = {};
    // 批量添加
    if (formData.id) {
      promiseHandler = editStaff;
      postData = {
        ...data,
        id: formData.id,
        img: get(img[0], 'response.data.src'),
      };
    } else {
      promiseHandler = addStaff;
      postData= {
        ...data,
        id: formData.id,
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

  const editGoodsHandler = (data: any) => {
    setOpen(true);
    setFormData({
      ...data,
      img: data.img?.split(',').map((i: string) => ({url: `${baseUrl}${i}`})),
    });
  }

  const onClose = () => {
    setOpen(false);
    formRef.current && formRef.current.resetFields();
  }


  return (
    <>
      <Spin tip="数据加载中..." spinning={spinning}>
        <div className={styles.content}>
          <div style={{paddingLeft: "40px"}}>
            <Button type='primary' htmlType="submit" onClick={() => setOpen(true)}>添加员工</Button>
          </div>
          <ul className={styles.imgContent}>
            {
              staffs.map((item: any) => <li key={item.id}>
                <div style={{position: 'relative'}}>
                  <img src={baseUrl + item.img} alt="" />
                  {/* <div className={styles.mask}>
                    <Button danger onClick={() => deleteStaff(item)}>联系我</Button>
                  </div> */}
                </div>
                <h3 className={styles.title}>{item.name}</h3>
                <p className={styles.pText}>{item.title}</p>
                <div style={{textAlign: 'center'}}>
                  <Button type="primary" style={{marginRight: '10px'}} onClick={() => editGoodsHandler(item)}>编辑</Button>
                  <Button danger onClick={() => deleteStaff(item)}>删除</Button>
                </div>
              </li>)
            }
          </ul>
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
          <Form.Item rules={[{ required: true}]} label="员工姓名" name='name'>
            <Input />
          </Form.Item>
          <Form.Item rules={[{ required: true }]} label="员工title" name='title'>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item rules={[{ required: true}]} label="员工介绍" name='details'>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item rules={[{ required: true}]} label="电话" name='phone'>
            <Input type='number' />
          </Form.Item>
          <Form.Item rules={[{ required: true}]} label="whatsapp" name='whatsapp'>
            <Input type='number' />
          </Form.Item>
          <Form.Item rules={[{ required: true}]} label="email" name='email'>
            <Input />
          </Form.Item>
          <Form.Item label="wechat" name='wechat'>
            <Input />
          </Form.Item>
          <Form.Item rules={[{ required: true}]} label="Upload" valuePropName="fileList" getValueFromEvent={normFile} name="img">
            <Upload
              action="http://localhost:8888/api/sys/user/uploadImage"
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