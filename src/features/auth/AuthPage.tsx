import { useEffect, useState } from 'react';
import { BlueSeal } from '../../components/BlueSeal';
import { FloatingShapes } from '../../components/FloatingShapes';
import { MobileFrame } from '../../components/MobileFrame';
import './auth.css';

export function AuthPage({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [agreementOpen, setAgreementOpen] = useState<'terms' | 'privacy' | null>(null);
  useEffect(() => {
    if (!countdown) return;
    const timer = window.setInterval(() => setCountdown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [countdown]);
  function sendCode() {
    setCountdown(60);
  }
  function login() {
    setError('');
    if (!/^1\d{10}$/.test(phone)) { setError('请输入正确的手机号'); return; }
    if (code !== '123456') { setError('验证码错误（演示验证码：123456）'); return; }
    localStorage.setItem('temlore.session', JSON.stringify({ phone }));
    onSuccess();
  }
  return <MobileFrame showTime={false} className="auth-screen"><FloatingShapes /><header className="auth-brand"><button className="auth-back" onClick={onBack}>←</button><div>Teml<BlueSeal variant="logo" />re</div><span>Sign</span></header><section className="auth-heading"><small>WELCOME BACK</small><h1>SIGN IN</h1><em>回到你的时间书桌</em></section><div className="auth-field auth-phone"><span className="user-label">用户</span><b>+86</b><input aria-label="手机号" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="手机号" /></div><div className="auth-field auth-code"><input aria-label="验证码" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} placeholder="验证码" /><button className="send-code" type="button" onClick={sendCode} disabled={countdown > 0}>{countdown ? `${countdown}s 后重新获取` : '获取验证码'}</button></div><label className="agreement"><input type="checkbox" /><span>我已阅读并同意</span><button type="button" onClick={() => setAgreementOpen('terms')}>《用户服务协议》</button><span>和</span><button type="button" onClick={() => setAgreementOpen('privacy')}>《隐私政策》</button><span className="agreement-legacy">用户协议</span></label><button className="auth-submit" onClick={login}>→</button>{error && <p className="auth-error" role="alert">{error}</p>}{agreementOpen && <div className="agreement-modal" role="dialog" aria-modal="true"><div className="agreement-sheet"><button className="agreement-close" onClick={() => setAgreementOpen(null)} aria-label="关闭协议">×</button><h2>{agreementOpen === 'terms' ? '用户服务协议' : '隐私政策'}</h2><p>{agreementOpen === 'terms' ? '欢迎使用 Temlore。本协议依据《企业对消费者（B2C）电子商务平台用户条款编制指南》及《中华人民共和国民法典》，说明服务内容、用户权利义务、电子数据保存与争议处理规则。封存后，信件在约定时间到达前无法查看或修改。' : 'Temlore 仅处理登录、信件保存和到达提醒所必需的信息。依据《中华人民共和国个人信息保护法》，手机号仅用于验证码登录和区分你的信件数据；你可以申请查询、更正或删除个人信息，并撤回授权。'}</p><button className="agreement-done" onClick={() => setAgreementOpen(null)}>我知道了</button></div></div>}</MobileFrame>;
}
