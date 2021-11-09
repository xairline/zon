import styled from '@emotion/styled';
import { useObserver } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import React, { useEffect } from 'react';
import { useGlobalStores } from '../../stores';
import { Table, message } from 'antd';

/* eslint-disable-next-line */
export interface FlyNowProps {}

const StyledFlyNow = styled.div`
  color: pink;
`;

export function FlyNow(props: FlyNowProps) {
  
  return useObserver(() => (
    <StyledFlyNow>
      {' '}
      
    </StyledFlyNow>
  ));
}

export default FlyNow;
