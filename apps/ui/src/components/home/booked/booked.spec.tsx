import React from 'react';
import { render } from '@testing-library/react';

import Booked from './booked';

describe('Booked', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Booked />);
    expect(baseElement).toBeTruthy();
  });
});
