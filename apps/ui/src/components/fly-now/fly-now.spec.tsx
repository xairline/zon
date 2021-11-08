import React from 'react';
import { render } from '@testing-library/react';

import FlyNow from './fly-now';

describe('FlyNow', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<FlyNow />);
    expect(baseElement).toBeTruthy();
  });
});
