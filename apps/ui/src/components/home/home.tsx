import styled from '@emotion/styled';
import { Divider } from 'antd';
import { useObserver } from 'mobx-react-lite';
import React from 'react';
import { Booked } from './booked/booked';
import Recorder from './recorder/recorder';

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
    </StyledHome>
  ));
}

export default Home;
