import {
  faBook,
  faPlaneDeparture,
  faTachometerAlt,
  faRecordVinyl,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Button, Form, Layout, Menu, Row, Col } from 'antd';
import { useLocalObservable, useObserver } from 'mobx-react-lite';
import React from 'react';
import { Link, Route } from 'react-router-dom';
import styled from 'styled-components';
import { FlightLog } from '../components/flight-log/flight-log';
import { FlyNow } from '../components/fly-now/fly-now';
import { Home } from '../components/home/home';
import { Login } from '../components/login/login';
import { Schedules } from '../components/schedules/schedules';
import { useGlobalStores } from '../stores';
import { IRoute } from './app.interface';
const { Header, Footer, Sider, Content } = Layout;
const MenuItem = Menu.Item;
const StyledApp = styled.div`
  background-color: rgb(30, 30, 30);
  min-height: 100vh;
  min-width: 100vw;
  .ant-layout-sider {
    background-color: rgb(37, 37, 38);
  }

  .user {
    vertical-align: middle;
  }

  .logo {
    border-radius: 6px;
    margin: 8px;
    transition: all 0.5s;
    overflow: hidden;
    text-align: center;
    background: rgba(255, 255, 255, 0.3);
    height: 8vh;
    align-items: center;
    justify-content: center;
    display: flex;
    padding: 8px;
    img {
      border-radius: 50%;
      max-width: 60px;
      max-height: 60px;
      width: 100%;
      height: 100%;
    }
  }

  .ant-menu {
    .ant-menu-item {
      font-size: 18px;
      height: 55px;
      line-height: 50px;
      margin-top: 16px;
      margin-bottom: 16px;
      &.ant-menu-item-selected {
        background: #931300;
        a {
          color: #fff;
        }
      }
    }
  }

  .main-content {
    margin: 10px;
    background: transparent;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .ant-menu-title-content {
    height: 75px;
  }

  .nav-text {
    font-size: 20px;
  }
`;

export const routes: Array<IRoute> = [
  {
    path: '/',
    exact: true,
    name: 'Home',
    icon: (
      <FontAwesomeIcon
        icon={faTachometerAlt}
        style={{ marginLeft: '20px', marginRight: '14px' }}
        size={'1x'}
      />
    ),
    comp: () => <Home />,
  },
  // {
  //   path: '/fly-now',
  //   name: 'Recorder',
  //   icon: (
  //     <FontAwesomeIcon
  //       icon={faRecordVinyl}
  //       style={{ marginLeft: '20px', marginRight: '16px' }}
  //       size={'1x'}
  //     />
  //   ),
  //   comp: () => <FlyNow />,
  // },
  {
    path: '/schedules',
    name: 'Schedules',
    icon: (
      <FontAwesomeIcon
        icon={faPlaneDeparture}
        style={{ marginLeft: '18px', marginRight: '14px' }}
        size={'1x'}
      />
    ),
    comp: () => <Schedules />,
  },
  {
    path: '/flight-log',
    name: 'Flights',
    icon: (
      <FontAwesomeIcon
        icon={faBook}
        style={{ marginLeft: '22px', marginRight: '18px' }}
        size={'1x'}
      />
    ),
    comp: () => <FlightLog />,
  },
];

export function App() {
  const { PilotStore, RouterStore } = useGlobalStores();
  const [form] = Form.useForm();
  const localStore = useLocalObservable(() => ({
    showDrawer: false,
    toggleDrawer() {
      localStore.showDrawer = !localStore.showDrawer;
      form.resetFields();
    },
  }));
  return useObserver(() => (
    <StyledApp>
      {PilotStore.isLoggedIn ? (
        <Layout style={{ minHeight: '100vh' }}>
          <Sider
            style={{
              minHeight: '100vh',
            }}
            collapsible={false}
          >
            <Row className="logo">
              <Button
                onClick={localStore.toggleDrawer}
                type="text"
                style={{ height: '100%', width: '100%' }}
              >
                <Avatar
                  style={{ marginRight: '16px' }}
                  src="https://cdn.discordapp.com/icons/692812210686394368/1ce67acb9365e44fee9cd036ed6c849d.png?size=240"
                  size={40}
                />
                <span className="user">
                  <strong style={{ fontSize: '20px' }}>
                    {PilotStore.username}
                  </strong>
                </span>
              </Button>
            </Row>
            <Menu
              theme="dark"
              defaultSelectedKeys={[RouterStore.getDefaultSelectedKeys()]}
              onSelect={(info) => {
                RouterStore.selectedMenuKey = parseInt(info.key);
              }}
            >
              {routes.map((route, index) => {
                if (route.name === 'divider') {
                  return <Menu.Divider key={index} />;
                }
                return (
                  <MenuItem key={index}>
                    <Link to={route.path}>
                      {route.icon || ''}
                      <span className="nav-text">{route.name}</span>
                    </Link>
                  </MenuItem>
                );
              })}
            </Menu>
          </Sider>
          <Layout style={{ height: '100vh' }}>
            <Content className="main-content">
              {routes.map((route: IRoute, index) => {
                return (
                  <Route
                    key={index}
                    exact={route.exact}
                    path={route.path}
                    component={route.comp}
                  />
                );
              })}
            </Content>

            <Footer
              style={{
                textAlign: 'center',
                background: '#931300',
                fontSize: '16px',
                padding: 0,
                height: '28px',
              }}
            >
              <Col span={12} offset={6}>
                OpenFDR Client for ZonExecutive©2021 Created by ZE1356
              </Col>
            </Footer>
          </Layout>
        </Layout>
      ) : (
        <Login />
      )}
    </StyledApp>
  ));
}

export default App;
