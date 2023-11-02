
import React, { useEffect, useState } from 'react';
import { Space, Table, Tag, Button, Drawer, Form, Col, Typography, Input, Row, Select, FormInstance } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { milkList, stageList } from './configs';
import { insertMilk, getAllMilk, deleteMilk } from '@/service/milk';
import styles from './milk.module.scss';

const { Option } = Select;

interface MilkType {
  id: number
  milk: string
  stage: number
  saleprice: number
  realprice: number
  courierfee: number
}

const Goods: React.FunctionComponent = () => {
  const formRef = React.useRef<FormInstance>(null);
  const [open, setOpen] = useState(false);
  const [milkData, setMilkData] = useState([]);
  const [form, setForm] = useState<MilkType>({
    id: 0,
    milk: '',
    stage: 1,
    saleprice: 0,
    realprice: 0,
    courierfee: 0,
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '奶粉名称',
      dataIndex: 'milk',
      key: 'milk',
    },
    {
      title: '奶粉段数',
      dataIndex: 'stage',
      key: 'stage',
    },
    {
      title: '快递费',
      dataIndex: 'courierfee',
      key: 'courierfee',
    },
    {
      title: () => {
        return '原价' + '（$澳刀）'
      },
      dataIndex: 'realprice',
      key: 'realprice',
    },
    {
      title: () => {
        return '卖价' + '（人民币）'
      },
      key: 'saleprice',
      dataIndex: 'saleprice',
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      key: 'operation',
      render: (_: any, record: MilkType) => {
        return <span>
          <Typography.Link onClick={() => edit(record)}>
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

  useEffect(() => {
    getAllMilkData();
  }, []);

  async function getAllMilkData() {
    const data: any = await getAllMilk();
    const formatData = data.map((item: any) => {
      return {
        ...item,
        milk: milkList.find(ele => ele.value === item.milk)?.lable,
      };
    })
    setMilkData(formatData);
  }

  const remove = async (data: MilkType) => {
    await deleteMilk({id: data.id});
    await getAllMilkData();
  }
  const edit = (data: MilkType) => {
    formRef.current?.setFieldsValue({...data});
    setOpen(true);
  }

  const showDrawer = () => {
    setOpen(true);
  };

  const onFinish = async (values: any) => {
    await insertMilk({...values});
    await getAllMilkData();
    formRef.current?.resetFields();
    setOpen(false);
  };

  const onClose = () => {
    formRef.current?.resetFields();
    setOpen(false);
  };
  
  return <div className={styles.wrapper}>
    <div>
      <Button style={{width: '80%', margin: '0 auto 20px auto', display: 'block'}} type="primary" onClick={showDrawer}>录入奶粉</Button>
    </div>
    <div>
      <Table bordered columns={columns} dataSource={milkData} />
    </div>
    <Drawer
      title="录入奶粉"
      width={720}
      onClose={onClose}
      open={open}
      bodyStyle={{ paddingBottom: 80 }}>
      <Form
        layout="vertical" 
        ref={formRef}
        name="control-ref"
        onFinish={onFinish}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="milk"
              label="奶粉名称"
              rules={[{ required: true, message: '请输入奶粉名称' }]}
            >
              <Select placeholder="请选择奶粉名称" onChange={(val) => formRef.current?.setFieldsValue({ milk: val })}>
                {
                  milkList.map((item, key) => {
                    return <Option value={item.value} key={key}>{item.lable}</Option>
                  })
                }
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="stage"
              label="段数"
              rules={[{ required: true, message: '请输入段数' }]}
            >
              <Select placeholder="请选择奶粉段数" onChange={(val) => formRef.current?.setFieldsValue({ stage: val })}>
                {
                  stageList.map((item, key) => {
                    return <Option value={item.value} key={key}>{item.lable}</Option>
                  })
                }
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="saleprice"
              label="奶粉卖价"
              rules={[{ required: true, message: '请输入奶粉卖价' }]}
            >
              <Input
                style={{ width: '100%' }}
                addonAfter="人民币"
                placeholder="请输入奶粉卖价"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="realprice"
              label="奶粉原价"
              rules={[{ required: true, message: '请输入奶粉原价' }]}
            >
              <Input
                style={{ width: '100%' }}
                addonAfter="澳刀"
                placeholder="请输入奶粉原价"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="courierfee"
              label="快递费"
              rules={[{ required: true, message: '请输入快递费' }]}
            >
              <Input
                style={{ width: '100%' }}
                addonAfter="$澳刀"
                placeholder="请输入快递费"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Space>
            <Button onClick={onClose} htmlType="button">Cancel</Button>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Drawer>
  </div>
}

export default Goods;