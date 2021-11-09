import React from 'react';
import { render } from '@testing-library/react';

import Stats from './stats';

describe('Stats', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Stats />);
    expect(baseElement).toBeTruthy();
  });
});
