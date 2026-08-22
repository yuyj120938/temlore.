import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthPage } from '../../../src/features/auth/AuthPage';

describe('AuthPage', () => {
  it('shows the confirmed full-screen login layout', () => {
    render(<AuthPage onSuccess={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('SIGN IN')).toBeInTheDocument();
    expect(screen.getByLabelText('手机号')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
  });
});
