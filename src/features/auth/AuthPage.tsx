import { useState } from 'react';
import { BlueSeal } from '../../components/BlueSeal';
import { FloatingShapes } from '../../components/FloatingShapes';
import { MobileFrame } from '../../components/MobileFrame';
import './auth.css';

export function AuthPage({ onSuccess, onBack }: { onSuccess: () => void; onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [agreementOpen, setAgreementOpen] = useState<'terms' | 'privacy' | null>(null);
  function login() {
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('请输入正确的邮箱地址'); return; }
    if (password.length < 6) { setError('密码至少需要 6 位'); return; }
    localStorage.setItem('temlore.session', JSON.stringify({ email }));
    onSuccess();
  }
  return <MobileFrame showTime={false} className="auth-screen"><FloatingShapes /><header className="auth-brand"><button className="auth-back" onClick={onBack}>←</button><div>Teml<BlueSeal variant="logo" />re</div><span>Sign</span></header><section className="auth-heading"><small>WELCOME BACK</small><h1>SIGN IN</h1><em>回到你的时间书桌</em></section><div className="auth-field auth-phone"><span className="user-label">邮箱</span><input aria-label="邮箱" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="邮箱地址" /></div><div className="auth-field auth-code"><input aria-label="密码" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="密码" /></div><label className="agreement"><input type="checkbox" /><span>我已阅读并同意</span><button type="button" onClick={() => setAgreementOpen('terms')}>《用户服务协议》</button><span>和</span><button type="button" onClick={() => setAgreementOpen('privacy')}>《隐私政策》</button><span className="agreement-legacy">用户协议</span></label><button className="auth-submit" onClick={login}>→</button>{error && <p className="auth-error" role="alert">{error}</p>}{agreementOpen && <div className="agreement-modal" role="dialog" aria-modal="true"><div className="agreement-sheet"><button className="agreement-close" onClick={() => setAgreementOpen(null)} aria-label="关闭协议">×</button><h2>{agreementOpen === 'terms' ? '用户服务协议' : '隐私政策'}</h2><p>{agreementOpen === 'terms' ? '欢迎使用 Temlore。本协议依据《企业对消费者（B2C）电子商务平台用户条款编制指南》及《中华人民共和国民法典》，说明服务内容、用户权利义务、电子数据保存与争议处理规则。封存后，信件在约定时间到达前无法查看或修改。' : 'Temlore 仅处理登录、信件保存和到达提醒所必需的信息。依据《中华人民共和国个人信息保护法》，邮箱仅用于登录和区分你的信件数据；你可以申请查询、更正或删除个人信息，并撤回授权。'}</p><button className="agreement-done" onClick={() => setAgreementOpen(null)}>我知道了</button></div></div>}</MobileFrame>;
}
