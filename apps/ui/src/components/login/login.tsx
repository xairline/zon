import React from 'react';

import styled from 'styled-components';

/* eslint-disable-next-line */
export interface LoginProps {}

const StyledLogin = styled.div`
  color: pink;
`;

export function Login(props: LoginProps) {
  return (
    <StyledLogin>
      <h1>Welcome to login!</h1>
    </StyledLogin>
  );
}

export default Login;
