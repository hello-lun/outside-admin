import { PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Drawer,
  Pagination,
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
import styles from './add.module.scss';
import { get } from 'lodash-es';
import { addGoods, editGoods, getGoods, batchAddGoods, deleteGoods } from '@/service/goods'; 
import { getCategory } from '@/service/category'; 
import { getBrand } from '@/service/brand'; 
import { catchError } from '@/utils/helper';

const baseUrl = `${process.env.REACT_APP_IMG_URL}${process.env.REACT_APP_API_PRE}/`;

interface IFormData {
  id?: number;
  title: string;
  details: string;
  top: boolean;
  images: [];
  category: string;
  brand: string;
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
  top: false,
  images: [],
  category: '',
  brand: '',
}

const Goods: React.FC = () => {
  const [componentDisabled, setComponentDisabled] = useState<boolean>(false);
  const [open, setOpen] = useState(false);
  const [queryForm, setQueryForm] = useState({
    brand: '',
    category: '',
    title: '',
  });
  const [images, setImgs] = useState<any[]>([]);
  const [category, setCategory] = useState<any[]>([]);
  const [brand, setBrand] = useState<any[]>([]);
  const token = useToken();
  const [formData, setFormData] = useState<IFormData>({...initialValues});
  const formRef = React.useRef<FormInstance>(null);
  const [spinning, setSpinning] = useState(false);
  const [total, setTotal] = useState(0);
  const curPageNum = useRef<number>(1);

  const getData = async (data: any) => {
    setSpinning(true);
    const [, res] = await catchError<any>(getGoods({
      ...data,
      size: 10
    }));
    setTotal(res.total);
    setImgs(res.list.map((item: any) => ({
      ...item,
      src: item.images.split(',')[0],
    })));
    setSpinning(false);
  }

  useEffect(() => {
    getData({page: 1});
    getBrand().then((res: any) => {
      setBrand(res);
    });
    getCategory().then((res: any) => {
      setCategory(res);
    });
  }, []);

  useEffect(() => {
    open && formRef.current && formRef.current.setFieldsValue({
      ...formData,
    });
  }, [open]);

  const finishHandler = async (data: any) => {
    const { title, details, images, id, top } = data;
    const titleList = title.split(';')?.filter((i: string) => !!i);
    const detailsList = details.split(';')?.filter((i: string) => !!i);
    let promiseHandler = null;
    let postData = {};
    // 批量添加
    if (
      titleList.length > 1
      && detailsList.length > 1
      && (titleList.length === detailsList.length)
      && images.length === titleList.length
      && !id) {
        postData = titleList.map((item: any, index: number) => {
          return {
            ...data,
            title: item,
            details: detailsList[index],
            top: top ? 1 : 0,
            images: get(images[index], 'response.data.src'),
          };
        });
        promiseHandler = batchAddGoods;
    } else if (formData.id) {
      promiseHandler = editGoods;
      postData = {
        ...data,
        id: formData.id,
        top: data.top ? 1 : 0,
        images: get(images[0], 'response.data.src'),
      };
    } else {
      promiseHandler = addGoods;
      postData= {
        ...data,
        id: formData.id,
        top: data.top ? 1 : 0,
        images: get(images[0], 'response.data.src'),
      }
    }
    setComponentDisabled(true);
    const [err] = await catchError(promiseHandler(postData));
    setComponentDisabled(false);
    if (!err) {
      getData({page: 1});
      setOpen(false);
    }
  }

  const editGoodsHandler = (data: any) => {
    setOpen(true);
    setFormData({
      ...data,
      images: data.images?.split(',').map((i: string) => ({url: `${baseUrl}${i}`})),
    });
  }

  const query = () => {
    getData(queryForm);
  }
  
  function onChange(page: number) {
    getData({page});
    curPageNum.current = page;
  }

  const onClose = () => {
    setOpen(false);
    formRef.current && formRef.current.resetFields();
  }

  const changeQuery = (data: any) => {
    setQueryForm({
      ...queryForm,
      ...data
    });
  }

  const deleteGoodsHandler = async (data: any) => {
    setSpinning(true);
    await catchError<any>(deleteGoods(data));
    getData(1);
    setSpinning(false);
  }


  return (
    <>
      <Spin tip="数据加载中..." spinning={spinning}>
        <div className={styles.content}>
          <div style={{paddingLeft: "40px"}}>
            <span>
              商品名称：
              <Input allowClear value={queryForm.title} style={{width: '200px'}} onChange={(e) => changeQuery({title: e.target.value})}></Input>
            </span>
            <span style={{margin: '0 15px'}}>
              品牌名称：
              <Select allowClear value={queryForm.brand} style={{width: '200px'}} onChange={(value) => changeQuery({brand: value})}>
                {
                  brand.map(item => <Select.Option value={item.value}>{item.lable}</Select.Option>)
                }
              </Select>
            </span>
            <span style={{margin: '0 15px'}}>
              类目名称：
              <Select allowClear value={queryForm.category} style={{width: '200px'}} onChange={(value) => changeQuery({category: value})}>
                {
                  category.map(item => <Select.Option value={item.value}>{item.lable}</Select.Option>)
                }
              </Select>
            </span>
            <Button type='primary' htmlType="submit" onClick={query} style={{marginRight: '10px'}}>搜索</Button>
            <Button type='primary' htmlType="submit" onClick={() => setOpen(true)}>添加产品</Button>
          </div>
          <ul className={styles.imgContent}>
            {
              images.map((item: any) => <li key={item.id}>
                <div style={{position: 'relative'}}>
                  <img src={baseUrl + item.src} alt="" />
                  {/* <div className={styles.mask}>
                    <Button danger onClick={() => deleteGoods(item)}>联系我</Button>
                  </div> */}
                </div>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.pText}>{item.details}</p>
                <p className={styles.pText}>品牌：{item.brand}</p>
                <p className={styles.pText}>类目：{item.category}</p>
                <div style={{textAlign: 'center'}}>
                  <Button type="primary" style={{marginRight: '10px'}} onClick={() => editGoodsHandler(item)}>编辑</Button>
                  <Button danger onClick={() => deleteGoodsHandler(item)}>删除</Button>
                </div>
              </li>)
            }
          </ul>
          <div className={styles.pagination}>
            <Pagination
              disabled={spinning}
              className={styles.pagination}
              showQuickJumper
              defaultPageSize={10}
              current={curPageNum.current}
              total={total}
              onChange={onChange}
            />
          </div>
        </div>
      </Spin>
      <Drawer
        title={formData.id ? '编辑订单' : '新增订单'}
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
          <Form.Item rules={[{ required: true}]} label="产品标题" name='title'>
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item rules={[{ required: true}]} label="产品介绍" name='details'>
            <Input.TextArea rows={6} />
          </Form.Item>
          {/* <Form.Item label="是否置顶" name='top'>
            <Checkbox checked>Checkbox</Checkbox>
          </Form.Item> */}
          <Form.Item label="商品品牌" name='brand'>
            <Select style={{width: '70%', marginRight: '10px'}}>
              {
                brand.map(item => <Select.Option value={item.value}>{item.lable}</Select.Option>)
              }
            </Select>
          </Form.Item>
          <Form.Item rules={[{ required: true}]} label="商品类目" name='category'>
            <Select style={{width: '70%', marginRight: '10px'}}>
              {
                category.map(item => <Select.Option value={item.value}>{item.lable}</Select.Option>)
              }
            </Select>
          </Form.Item>
          <Form.Item rules={[{ required: true}]} label="Upload" valuePropName="fileList" getValueFromEvent={normFile} name="images">
            <Upload
              action={`${process.env.REACT_APP_API_URL}${process.env.REACT_APP_API_PRE}/sys/user/uploadImage`}
              listType="picture-card"
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