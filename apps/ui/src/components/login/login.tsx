import React from 'react';
import { Button, Card, Col, Form, Input, Layout, Row, message } from 'antd';
import { Content } from 'antd/lib/layout/layout';
import { useObserver } from 'mobx-react-lite';
import styled from 'styled-components';
import { useGlobalStores } from '../../stores';
import { runInAction } from 'mobx';

/* eslint-disable-next-line */
export interface LoginProps {}

const StyledLogin = styled.div`
  .ant-layout {
    background: url('assets/login_bg.jpeg');
    background-size: 100%;
  }
`;

export function Login(props: LoginProps) {
  const { PilotStore } = useGlobalStores();
  const username = localStorage.getItem('username') || '';
  const password = localStorage.getItem('password') || '';
  return useObserver(() => (
    <StyledLogin>
      <Layout style={{ minHeight: '100vh' }}>
        <Content
          style={{ marginLeft: '25vw', marginRight: '25vw', marginTop: '25vh' }}
        >
          <Row align="bottom">
            <Col flex="1 0 10%">
              <Card
                title="Login"
                style={{ width: '100%', backgroundColor: 'rgb(37, 37, 38)' }}
              >
                <Form
                  name="basic"
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 16 }}
                  initialValues={{ username, password }}
                  onFinish={async (values) => {
                    await PilotStore.login(
                      values.username,
                      values.password
                    ).catch((e) => {
                      message.error(`Login Failed: ${e.message}`);
                    });
                  }}
                  autoComplete="off"
                  style={{ margin: '5vh'}}
                >
                  <Form.Item
                    label="Username"
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: 'Please type your airline name',
                      },
                    ]}
                  >
                    <Input defaultValue={username} />
                  </Form.Item>
                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: 'Please type your airline name',
                      },
                    ]}
                  >
                    <Input.Password defaultValue={password} />
                  </Form.Item>

                  <Form.Item wrapperCol={{ offset: 10, span: 8 }}>
                    <Button type="primary" htmlType="submit">
                      Login
                    </Button>
                    <Button
                      danger
                      type="primary"
                      style={{ marginLeft: '16px' }}
                      onClick={() => {
                        runInAction(() => {
                          PilotStore.isLoggedIn = true;
                          PilotStore.offline = true;
                        });
                      }}
                    >
                      Offline
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </Content>
      </Layout>
    </StyledLogin>
  ));
}

export default Login;
