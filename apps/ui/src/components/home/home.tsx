import React from 'react';
import { Empty } from 'antd';
import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface HomeProps {}

const StyledHome = styled.div``;

export function Home(props: HomeProps) {
  return (
    <StyledHome>
      <Empty
        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
        imageStyle={{
          height: '60vh',
        }}
        description={<h1 style={{ fontSize: '32px' }}>Not Implemented Yet</h1>}
      />
    </StyledHome>
  );
}

export default Home;
