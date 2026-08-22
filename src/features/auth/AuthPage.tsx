import { useState } from 'react';
import { BlueSeal } from '../../components/BlueSeal';
import { FloatingShapes } from '../../components/FloatingShapes';
import { MobileFrame } from '../../components/MobileFrame';
import './auth.css';

export function AuthPage({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  async function login() {
    setError('');
    const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone, password }) });
    if (!response.ok) { setError('手机号或密码不正确'); return; }
    onSuccess();
  }
  return <MobileFrame className="auth-screen"><FloatingShapes /><header className="auth-brand"><button className="auth-back" onClick={onBack}>←</button><div>Teml<BlueSeal variant="logo" />re</div></header><section className="auth-heading"><small>WELCOME BACK</small><h1>SIGN IN</h1><em>回到你的时间书桌</em></section><div className="auth-field auth-phone"><span>人</span><b>+86</b><input aria-label="手机号" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="手机号" /></div><div className="auth-field auth-password"><input aria-label="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" /><span>⌁</span></div><button className="auth-submit" onClick={login}>→</button><button className="auth-recovery">使用恢复码</button><p className="auth-footer">还没有账号？ <b>创建账号</b></p>{error && <p className="auth-error" role="alert">{error}</p>}</MobileFrame>;
}
