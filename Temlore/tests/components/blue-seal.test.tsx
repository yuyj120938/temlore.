import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BlueSeal } from '../../src/components/BlueSeal';
import '../../src/styles/tokens.css';
import '../../src/styles/global.css';

describe('BlueSeal', () => {
  it('renders the compact logo seal with the approved palette', () => {
    render(<BlueSeal variant="logo" />);
    const seal = screen.getByLabelText('钟表火漆印章');
    expect(seal).toHaveClass('blue-seal--logo');
    expect(getComputedStyle(seal).backgroundColor).toBe('rgb(178, 238, 255)');
    expect(seal.querySelector('span')).toHaveTextContent('◷');
  });
});
