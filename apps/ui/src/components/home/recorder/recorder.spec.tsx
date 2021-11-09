import React from 'react';
import { render } from '@testing-library/react';

import Recorder from './recorder';

describe('Recorder', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Recorder />);
    expect(baseElement).toBeTruthy();
  });
});
