import { useState } from 'react';
import { BlueSeal } from '../../components/BlueSeal';
import { FloatingShapes } from '../../components/FloatingShapes';
import { MobileFrame } from '../../components/MobileFrame';
import './auth.css';

export function AuthPage({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  function login() {
    setError('');
    if (!/^1\d{10}$/.test(phone)) { setError('请输入正确的手机号'); return; }
    if (code !== '123456') { setError('验证码错误（演示验证码：123456）'); return; }
    localStorage.setItem('temlore.session', JSON.stringify({ phone }));
    onSuccess();
  }
  return <MobileFrame className="auth-screen"><FloatingShapes /><header className="auth-brand"><button className="auth-back" onClick={onBack}>←</button><div>Teml<BlueSeal variant="logo" />re</div><span>Sign</span></header><section className="auth-heading"><small>WELCOME BACK</small><h1>SIGN IN</h1><em>回到你的时间书桌</em></section><div className="auth-field auth-phone"><span className="user-label">用户</span><b>+86</b><input aria-label="手机号" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="手机号" /></div><div className="auth-field auth-code"><input aria-label="验证码" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="验证码" /><button className="send-code" type="button">获取验证码</button></div><label className="agreement"><input type="checkbox" /> 用户协议</label><button className="auth-submit" onClick={login}>→</button>{error && <p className="auth-error" role="alert">{error}</p>}</MobileFrame>;
}
