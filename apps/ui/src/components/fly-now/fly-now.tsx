import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface FlyNowProps {}

const StyledFlyNow = styled.div`
  color: pink;
`;

export function FlyNow(props: FlyNowProps) {
  return (
    <StyledFlyNow>
      <h1>Welcome to flyNow!</h1>
    </StyledFlyNow>
  );
}

export default FlyNow;
