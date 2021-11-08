import React from 'react';

import styled from '@emotion/styled';

/* eslint-disable-next-line */
export interface FlightLogProps {}

const StyledFlightLog = styled.div`
  color: pink;
`;

export function FlightLog(props: FlightLogProps) {
  return (
    <StyledFlightLog>
      <h1>Welcome to flightLog!</h1>
    </StyledFlightLog>
  );
}

export default FlightLog;
