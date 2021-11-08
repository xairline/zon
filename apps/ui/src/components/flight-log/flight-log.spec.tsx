import React from 'react';
import { render } from '@testing-library/react';

import FlightLog from './flight-log';

describe('FlightLog', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FlightLog />);
    expect(baseElement).toBeTruthy();
  });
});
