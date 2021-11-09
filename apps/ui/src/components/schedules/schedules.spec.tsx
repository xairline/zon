import React from 'react';
import { render } from '@testing-library/react';

import Schedules from './schedules';

describe('Schedules', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Schedules />);
    expect(baseElement).toBeTruthy();
  });
});
