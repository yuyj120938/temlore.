import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AuthPage } from '../../../src/features/auth/AuthPage';

describe('AuthPage', () => {
  it('shows the confirmed full-screen login layout', () => {
    render(<AuthPage onSuccess={vi.fn()} onBack={vi.fn()} />);
    expect(screen.getByText('SIGN IN')).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱')).toBeInTheDocument();
    expect(screen.getByLabelText('密码')).toBeInTheDocument();
    expect(screen.getByText('邮箱')).toBeInTheDocument();
    expect(screen.getByText('用户协议')).toBeInTheDocument();
    expect(screen.queryByText('使用恢复码')).not.toBeInTheDocument();
    expect(screen.queryByText('创建账号')).not.toBeInTheDocument();
  });
});
