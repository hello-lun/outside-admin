
import React, { useEffect, useId, useState } from 'react';
import { Space, Table, FormInstance, DatePicker, Button, Drawer, Form, Col, Typography, Input, Row, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { milkList, stageList } from '../milk/configs';
import { editGoodsOrder, addGoodsOrder, getAllMilk, getAllGoodsOrder, getAllGoodsOrder1, removeGoodsOrder } from '@/service/milk';
import styles from './goodsCount.module.scss';
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
const { Option } = Select;
const { RangePicker } = DatePicker;


interface MilkType {
  id: number | null
  total: number
  cost: number
  profit: number
  discount: number
  milkCount: number
  date: string
  milkOrderList: any[]
  extraOrderList: any[]
}

const Goods: React.FunctionComponent = () => {
  const formRef = React.useRef<FormInstance>(null);
  const milkPriceDataRef = React.useRef([]);
  const [open, setOpen] = useState(false);
  const [curRowId, setCurRowId] = useState<number | null>(null);
  const [goodsOrderData, setGoodsOrderData] = useState([]);
  const [orderDate, setOrderDate] = useState(() => [dayjs(), dayjs()]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<MilkType>({
    id: null,
    total: 0,
    cost: 0,
    profit: 0,
    discount: 0,
    milkCount: 0,
    date: '',
    milkOrderList: [],
    extraOrderList: []
  });
  
  useEffect(() => {
    getOrderList();
  }, []);

  useEffect(() => {
    open && formRef.current && formRef.current.setFieldsValue({
      id: formData.id,
      discount: formData.discount,
      total: formData.total,
      date: formData.date ? dayjs(formData.date) : dayjs(),
      milkOrderList: formData.milkOrderList,
      extraOrderList: formData.extraOrderList,
    });
  }, [open]);

  const initialValues = {
    total: '',
    discount: '3.5',
    date: dayjs(),
    extraOrderList: [],
    milkOrderList: [
      {
        milk: 'aptamil',
        stage: '2',
        count: '2',
      }
    ],
  };
  
  const queryGoodOrder = () => {
    if(!orderDate || !orderDate.length) return;
    const startDate = dayjs(orderDate[0]).format('YYYY-MM-DD');
    const endDate = dayjs(orderDate[1]).format('YYYY-MM-DD');
    getGoodsOrderData({startDate, endDate});
  }

  const getOrderList = async () => {
    const data: any = await getAllMilk();
    milkPriceDataRef.current = data;
    queryGoodOrder();
  }

  const getGoodsOrderData = (data: any) => {
    setLoading(true);
    formatData(data);
    setLoading(false);
  }

  const removeItem = async (data: MilkType) => {
    await removeGoodsOrder({id: data.id});
    await getOrderList();
  }
  
  const edit = (data: MilkType) => {
    setCurRowId(data.id);
    setOpen(true);
    setFormData(data);
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      ellipsis: true,
    },
    {
      title: '盈利金额（人民币）',
      key: 'profit',
      dataIndex: 'profit',
      ellipsis: true,
      render: (data: any) => <span style={{color: 'red'}}>{data + '元'}</span>
    },
    {
      title: '奶粉数',
      dataIndex: 'milkCount',
      key: 'milkCount',
      ellipsis: true,
      render: (data: any, obj: any) => data + '罐',
    },
    {
      title: () => {
        return '订单总价' + '（$澳刀）'
      },
      dataIndex: 'total',
      key: 'total',
      ellipsis: true,
      render: (data: any) => '$' + data
    },
    {
      title: '成本价（人民币）',
      key: 'cost',
      dataIndex: 'cost',
      ellipsis: true,
      render: (data: any) => data + '元'
    },
    {
      title: '折扣',
      key: 'discount',
      dataIndex: 'discount',
      ellipsis: true,
      render: (data: any) => data + '折'
    },
    {
      title: '日期',
      key: 'date',
      dataIndex: 'date',
      ellipsis: true,
      render: (data: any) => dayjs(data).format('YYYY-MM-DD')
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
          <Typography.Link onClick={() => removeItem(record)}>
            删除
          </Typography.Link>
        </span>
      },
    },
  ];

  const formatData = async (data: any) => {
    await getAllGoodsOrder1(data);
    const list: any = await getAllGoodsOrder(data);
    const dataList = list.map((item: any, key: number) => {
      const milkCount = item.milkOrderList.reduce((tot: number, ele: any) => tot + ele.count, 0);
      const allMilkCount = item.extraOrderList.reduce((tot: number, ele: any) => tot + ele.count, milkCount);
      return {...item, milkCount: allMilkCount, key, milkOrderList: item.milkOrderList.map((ele: any, index: number) => ({...ele, key: index}))};
    });
    setGoodsOrderData(dataList);
  }

  const onAddOrEdit = async (data: any) => {
    if(loading) return;
    setLoading(true);
    const api = curRowId ? editGoodsOrder : addGoodsOrder;
    try {
      await api({
        id: curRowId,
        ...data,
        total: Number(data.total),
        discount: Number(data.discount),
        date: dayjs(data.date).format('YYYY-MM-DD'),
      });
      await getOrderList();
    } finally {
      resetStatus();
    }
  }

  const resetStatus = () => {
    setLoading(false);
    setOpen(false);
    setCurRowId(null);
  }

  const onClose = () => {
    formRef.current?.resetFields([initialValues]);
    resetStatus();
  };

  const onAddOrder = () => {
    setOpen(true);
  }

  const handleChangeMilkSelect = (index: number, val: any) => {
    const fieldName = ['milkOrderList', index, 'milk'];
    formRef.current?.setFieldsValue({ [fieldName.join('.')]: val });
  }


  const handleChangeStageSelect = (index: number, val: any) => {
    const fieldName = ['milkOrderList', index, 'stage'];
    formRef.current?.setFieldsValue({ [fieldName.join('.')]: val });
  }

  const handleChangeInput = (index: number, value: any) => {
    const fieldName = ['items', index, 'count'];
    formRef.current?.setFieldsValue({ [fieldName.join('.')]: value });
  };

  const dateChange = (date: any) => {
    setOrderDate(date);
  }


  const addItem = (itemData: Object, type: string) => {
    let tempMilkOrderList = formRef.current?.getFieldsValue()?.[type];
    if (tempMilkOrderList.length > 0) {
      tempMilkOrderList = [...tempMilkOrderList, itemData];
    } else {
      tempMilkOrderList = [itemData];
    }
    formRef.current?.setFieldsValue({[type]: tempMilkOrderList});
  }

  const milkAdd = () => {
    addItem({
      milk: 'aptamil',
      stage: '2',
      count: '2',
    }, 'milkOrderList');
  }

  const extraAdd = () => {
    addItem({
      product: '',
      salePrice: null,
      courierFee: null,
    }, 'extraOrderList');
  }
  
  return <div className={styles.wrapper}>
    <div>
      <Row>
        <Col span={10}>
          <Button style={{width: '80%', margin: '0 auto 20px auto', display: 'block'}}  type='primary' onClick={onAddOrder} >添加订单</Button>
        </Col>
        <Col span={14}>
          <RangePicker defaultValue={[dayjs(), dayjs()]} onChange={dateChange} />
          <Button style={{marginLeft: '10px'}} onClick={queryGoodOrder}>查询</Button>
        </Col>
      </Row>

    </div>
    <div className={styles.table}>
      <Table
        bordered
        columns={columns}
        dataSource={goodsOrderData}
        pagination={false}
        summary={(pageData) => {
          let totalBorrow = 0;
          let totalRepayment = 0;
          let totalCost = 0;
          let totalSale = 0;
          pageData.forEach(({ profit, milkCount, cost, total }) => {
            totalBorrow += profit;
            totalRepayment += milkCount;
            totalSale += total;
            totalCost += cost;
          });

          return (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={1} colSpan={2}><span style={{color: 'red'}}>总计</span></Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  <span style={{color: 'red'}}>{totalBorrow.toFixed(2)}元</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <span>{totalRepayment}罐</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <span>${totalSale.toFixed(2)}</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  <span>{totalCost.toFixed(2)}元</span>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} colSpan={2}>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          );
        }}
        expandable={{
          expandRowByClick: true,
          expandedRowRender: (record: any) => {
            function formatTitle(data: any) {
              const item: any = milkList.find((ele: any) => ele.value === data) || {};
              return item.lable;
            }
            return <ul className={styles.ulWrapper}>
              {
                record?.milkOrderList?.map((item: any, key: number) => {
                  return <li key={key}>{`${formatTitle(item.milk)} - ${item.stage}段：${item.count}罐`}</li>
                })
              }
              {
                record?.extraOrderList?.map((item: any, key: number) => {
                  return <li key={key}>{`${item.product} - ${item.count}个：售价${item.salePrice}元，快递费：${item.courierFee}刀`}</li>
                })
              }
            </ul>
          },
          rowExpandable: (record: any) => record?.milkOrderList?.length || record?.extraOrderList?.length,
        }} />
    </div>
    <Drawer
      title={curRowId ? '编辑订单' : '新增订单'}
      width={820}
      onClose={onClose}
      open={open}
      bodyStyle={{ paddingBottom: 80 }}>
      <Form 
        ref={formRef}
        initialValues={initialValues}
        name="control-ref"
        layout="vertical"
        onFinish={onAddOrEdit}>
        <Row gutter={16}>
          <Col span={7}>
            <Form.Item
              name="total"
              label="订单总价"
              rules={[{ required: true, message: '请输入订单总价' }]}
            >
              <Input
                type='number'
                style={{ width: '100%' }}
                addonAfter="澳刀"
                placeholder="请输入订单总价"
              />
            </Form.Item>
          </Col>

          <Col span={7}>
            <Form.Item
              name="discount"
              label="订单折扣"
              rules={[{ required: true, message: '请输入订单折扣' }]}
            >
              <Input
                type='number'
                style={{ width: '100%' }}
                addonAfter="折"
                placeholder="请输入订单折扣"
              />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item
              name="date"
              label="日期"
              rules={[{ required: true, message: '请选择日期' }]}
            >
            <DatePicker format="YYYY-MM-DD" style={{width: '100%'}}/>
            </Form.Item>
          </Col>
        </Row>
        <div className={styles.listWrapper}>
          <h3>
            奶粉
            <span style={{marginLeft: '15px'}}><PlusCircleOutlined onClick={milkAdd}></PlusCircleOutlined></span>
          </h3>
          <Form.List
            name="milkOrderList">
            {
              (fields, { add, remove }, { errors }) => (
                <>
                  {
                    fields.map((field, index) => (
                      <Row gutter={16} key={index}>
                        <Col span={7}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'milk']}
                            label="奶粉名称"
                            rules={[{ required: true, message: '请输入奶粉名称' }]}
                          >
                            <Select placeholder="请选择奶粉名称" onChange={(val) => handleChangeMilkSelect(index, val)}>
                              {
                                milkList.map((item, key) => {
                                  return <Option value={item.value} key={key}>{item.lable}</Option>
                                })
                              }
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={7}>
                          <Form.Item
                            {...field}
                            label="段数"
                            name={[field.name, 'stage']}
                            rules={[{ required: true, message: '请输入段数' }]}
                          >
                            <Select placeholder="请选择奶粉段数" onChange={(val) => handleChangeStageSelect(index, val)}>
                              {
                                stageList.map((item, key) => {
                                  return <Option value={item.value} key={key}>{item.lable}</Option>
                                })
                              }
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={7}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'count']}
                            label="订单出了的奶粉数"
                            rules={[{ required: true, message: '订单出了的奶粉数' }]}
                          >
                            <Input
                              type='number'
                              onChange={(e) => handleChangeInput(index, e.target.value)}
                              style={{ width: '100%' }}
                              addonAfter="罐"
                              placeholder="订单出了的奶粉数"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Button type='text' style={{marginTop: '30px'}} icon={<PlusCircleOutlined />} onClick={() =>  add(index)}></Button>
                          <Button type='text' style={{marginTop: '30px'}} icon={<MinusCircleOutlined />} onClick={() => remove(index)}></Button>
                        </Col>
                      </Row>)
                    )
                  }
                </>)
              }
          </Form.List>
        </div>
        <div className={styles.listWrapper}>
          <h3>
            杂项
            <span style={{marginLeft: '15px'}}><PlusCircleOutlined onClick={extraAdd}></PlusCircleOutlined></span>
          </h3>
          <Form.List
            name="extraOrderList">
            {
              (fields, { add, remove }, { errors }) => (
                <>
                  {
                    fields.map((field, index) => (
                      <Row gutter={16} key={index}>
                        <Col span={5}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'product']}
                            label="产品名称"
                            rules={[{ required: true, message: '请输入产品名称' }]}
                          >
                          <Input
                            onChange={(e) => handleChangeInput(index, e.target.value)}
                            style={{ width: '100%' }}
                          />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'count']}
                            label="数量"
                            rules={[{ required: true, message: '请输入产品数量' }]}
                          >
                          <Input
                            type='number'
                            onChange={(e) => handleChangeInput(index, e.target.value)}
                            style={{ width: '100%' }}
                          />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...field}
                            label="售价(元)"
                            name={[field.name, 'salePrice']}
                            rules={[{ required: true, message: '请输入售价' }]}>
                            <Input
                              type='number'
                              onChange={(e) => handleChangeInput(index, e.target.value)}
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={5}>
                          <Form.Item
                            {...field}
                            name={[field.name, 'courierFee']}
                            label="快递费(刀)"
                            rules={[{ required: true, message: '请输入快递费用' }]}
                          >
                            <Input
                              type='number'
                              style={{ width: '100%' }}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={3}>
                          <Button type='text' style={{marginTop: '30px'}} icon={<PlusCircleOutlined />} onClick={() =>  add(index)}></Button>
                          <Button type='text' style={{marginTop: '30px'}} icon={<MinusCircleOutlined />} onClick={() => remove(index)}></Button>
                        </Col>
                      </Row>)
                    )
                  }
                </>)
            }
          </Form.List>
        </div>
        <Form.Item>
          <Button type='primary' loading={loading} htmlType="submit" style={{marginTop: '30px'}}>
            { curRowId ? '编辑订单' : '添加订单' }
          </Button>
        </Form.Item>
      </Form>
    </Drawer>
  </div>
}

export default Goods;