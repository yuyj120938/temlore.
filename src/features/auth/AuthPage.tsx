import { useState } from 'react';
import { BlueSeal } from '../../components/BlueSeal';
import { FloatingShapes } from '../../components/FloatingShapes';
import { MobileFrame } from '../../components/MobileFrame';
import { ForgotPasswordFlow } from './ForgotPasswordFlow';
import './auth.css';

export function AuthPage({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [forgot, setForgot] = useState(false);
  function login() { setError(''); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('请输入正确的邮箱地址'); if (password.length < 6) return setError('密码至少需要 6 位'); localStorage.setItem('temlore.session', JSON.stringify({ email })); onSuccess(); }
  if (forgot) return <ForgotPasswordFlow onBack={() => setForgot(false)} />;
  return <MobileFrame showTime={false} className="auth-screen"><FloatingShapes /><header className="auth-brand"><button className="auth-back" onClick={onBack}>←</button><div>Teml<BlueSeal variant="logo" />re</div><span>Sign</span></header><section className="auth-heading"><small>WELCOME BACK</small><h1>SIGN IN</h1><em>回到你的时间书桌</em></section><div className="auth-field auth-phone"><span className="user-label">邮箱</span><input aria-label="邮箱" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="邮箱地址" /></div><div className="auth-field auth-code"><input aria-label="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" /></div><button className="forgot-link" onClick={() => setForgot(true)}>忘记密码？</button><label className="agreement"><input type="checkbox" /><span>我已阅读并同意</span><button type="button">《用户服务协议》</button><span>和</span><button type="button">《隐私政策》</button><span className="agreement-legacy">用户协议</span></label><button className="auth-submit" onClick={login}>→</button>{error && <p className="auth-error" role="alert">{error}</p>}</MobileFrame>;
}
