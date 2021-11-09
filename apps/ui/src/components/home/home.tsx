import styled from '@emotion/styled';
import { useObserver } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import React, { useEffect } from 'react';
import { useGlobalStores } from '../../stores';
import {
  Table,
  message,
  Row,
  PageHeader,
  Button,
  Descriptions,
  Divider,
} from 'antd';
import { Stats } from './stats/stats';
import Recorder from './recorder/recorder';
import { Booked } from './booked/booked';

/* eslint-disable-next-line */
export interface HomeProps {}

const StyledHome = styled.div``;

export function Home(props: HomeProps) {

  return useObserver(() => (
    <StyledHome>
      {' '}
      <Booked />
      <Divider />
      <Recorder />
      <Divider />
      <Stats />
    </StyledHome>
  ));
}

export default Home;
