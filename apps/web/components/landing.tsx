'use client';

import {useState} from 'react';
import {ArrowDown, ArrowUpRight, AudioLines, Bot, Check, ChevronRight, Coffee, Command, Download, Github, Lightbulb, Menu, Monitor, ShieldCheck, Smartphone, Sparkles, Wifi, X, Zap} from 'lucide-react';
import './landing.css';

const mobileUrl=process.env.NEXT_PUBLIC_MOBILE_DOWNLOAD_URL;
const apkUrl='/downloads/nexus-home-1.0.0-arm64.apk';
const sourceUrl='https://github.com/5an1ty/jarvis-senai/archive/refs/heads/main.zip';

function NexusCore(){
 return <div className="n-core" aria-hidden="true"><div className="n-core-grid"/><div className="n-ring ring-a"/><div className="n-ring ring-b"/><div className="n-ring ring-c"/><div className="n-ring ring-d"/><div className="n-core-center"><Command strokeWidth={1.2}/></div><i className="n-satellite sat-a"/><i className="n-satellite sat-b"/><span className="n-core-coordinate c-top">NEXUS NEURAL CORE</span><span className="n-core-coordinate c-bottom">CONNECTED LIVING / 01</span></div>
}

export default function Landing({onEnter,feedback}:{onEnter:()=>Promise<void>;feedback:string}){
 const [menu,setMenu]=useState(false),[loading,setLoading]=useState(false);
 async function enter(){if(loading)return;setLoading(true);try{await onEnter()}finally{setLoading(false)}}
 return <div className="n-landing">
  <a className="n-skip" href="#conteudo">Pular para o conteúdo</a>
  <header className="n-header">
   <a href="#inicio" className="brand n-brand" aria-label="Nexus Home, início"><Command size={28}/> NEXUS<span>HOME</span></a>
   <button className="n-menu-toggle" aria-label={menu?'Fechar menu':'Abrir menu'} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
   <nav className={menu?'n-nav expanded':'n-nav'} aria-label="Navegação principal">
    <a href="#inteligencia" onClick={()=>setMenu(false)}>Inteligência</a><a href="#ecossistema" onClick={()=>setMenu(false)}>Ecossistema</a><a href="#mobile" onClick={()=>setMenu(false)}>Aplicativo mobile</a>
   </nav>
   <button className="n-header-cta" disabled={loading} onClick={enter}>Abrir aplicativo <ArrowUpRight size={15}/></button>
  </header>
  <main id="conteudo">
   <section className="n-hero n-container" id="inicio">
    <div className="n-hero-copy"><div className="n-kicker"><span/> INTELIGÊNCIA RESIDENCIAL PROATIVA</div>
     <h1>Sua casa.<br/>Um passo<br/><span>à sua frente.</span></h1>
     <p>Mais do que conectar dispositivos. Uma inteligência que entende sua rotina e sugere o próximo passo. Com você no controle, sempre.</p>
     <div className="n-actions"><button className="n-button" disabled={loading} onClick={enter}>{loading?'Conectando…':'Explorar residência de demonstração'} <ArrowUpRight size={18}/></button><a className="n-secondary" href="#mobile"><Smartphone size={17}/> Conhecer o app <ArrowDown size={15}/></a></div>
     {feedback&&<p className="n-error" role="alert">{feedback}</p>}
     <div className="n-hero-notes"><span><Check size={13}/> Sem hardware para experimentar</span><span><ShieldCheck size={13}/> Aprendizado com consentimento</span></div>
    </div>
    <div className="n-hero-visual"><div className="n-visual-top"><span><i/> NEXUS INTELLIGENCE</span><span>DEMO INTERATIVA</span></div><NexusCore/>
     <div className="n-float n-float-room"><div className="n-mini-icon"><Lightbulb size={17}/></div><div>Iluminação da sala<small>Controle por voz e texto</small></div><span className="n-signal"><i/><i/><i/></span></div>
     <div className="n-float n-float-ai"><Sparkles size={18}/><div>Seu próximo café, no horário.<small>Sugestões que partem da sua rotina.</small></div><span className="n-ai-badge">AI</span></div>
     <div className="n-visual-bottom"><span>01 — SUA CASA, CONECTADA</span><span><Wifi size={12}/> SIMULADOR IoT</span></div>
    </div>
   </section>
   <div className="n-capabilities"><div className="n-container"><span>UM ECOSSISTEMA.<br/><b>INFINITAS POSSIBILIDADES.</b></span><span><Lightbulb/> Dispositivos</span><span><AudioLines/> Voz & contexto</span><span><Sparkles/> Rotinas inteligentes</span><span><Monitor/> Web + mobile</span></div></div>
   <section className="n-container n-section" id="inteligencia">
    <div className="n-section-heading"><div><span className="n-eyebrow">01 / INTELIGÊNCIA QUE FAZ SENTIDO</span><h2>Ela não só responde.<br/><span>Ela percebe.</span></h2></div><p>O NEXUS conecta os pontos da sua rotina para oferecer ajuda na hora certa. Cada sugestão tem um motivo. Cada decisão continua sendo sua.</p></div>
    <div className="n-feature-grid"><article className="n-feature"><span className="n-feature-icon"><Bot/></span><span className="n-feature-index">01</span><h3>Converse com a sua casa.</h3><p>“Acenda a luz da sala.” Depois, “diminua para 40%”. O Nexus mantém o contexto e confirma o resultado do simulador.</p><div className="n-chat-example"><span>VOCÊ</span> E deixe azul.<div><Command size={14}/><span>NEXUS</span> Cor confirmada no simulador.</div></div></article>
     <article className="n-feature n-feature-highlight"><span className="n-feature-icon"><Coffee/></span><span className="n-feature-index">02</span><h3>Um hábito. Uma sugestão.</h3><p>Três dias de café às 15h. No quarto, uma sugestão para o próximo preparo. Experimente a passagem de dias na demonstração.</p><div className="n-routine-timeline"><span>SEG<i/></span><span>TER<i/></span><span>QUA<i/></span><span className="next">QUI<Sparkles size={15}/></span></div><div className="n-routine-note"><span>15:00</span> Seu café. Sua escolha.</div></article>
     <article className="n-feature"><span className="n-feature-icon"><ShieldCheck/></span><span className="n-feature-index">03</span><h3>Sua privacidade é prioridade.</h3><p>Ative o aprendizado quando quiser. Desative a análise e exclua o histórico pela interface. O microfone só é acionado por você.</p><div className="n-privacy-list"><span><Check size={14}/> Consentimento explícito</span><span><Check size={14}/> Ações com confirmação</span><span><Check size={14}/> Controle sobre seu histórico</span></div></article></div>
   </section>
   <section className="n-ecosystem" id="ecossistema"><div className="n-container n-ecosystem-grid"><div className="n-home-map"><div className="n-map-label"><span><i/> RESIDÊNCIA VIRTUAL</span><span>VISÃO DO SISTEMA</span></div><svg viewBox="0 0 520 340" role="img" aria-label="Planta ilustrativa com sala, cozinha, quarto e garagem conectados"><defs><pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#22334a"/></pattern></defs><rect width="520" height="340" fill="url(#dots)"/><g fill="#0b1827" stroke="#31526a" strokeWidth="2"><path d="M60 55h240v120H190v110H60z"/><path d="M310 55h150v120H310z"/><path d="M200 185h110v100H200z"/><path d="M320 185h140v100H320z"/></g><g fill="none" stroke="#00d9ff" strokeWidth="1" strokeDasharray="4 5" opacity=".5"><path d="M130 125h250v110h-125M130 125v110h255"/></g><g fill="#00d9ff"><circle cx="130" cy="125" r="7"/><circle cx="385" cy="110" r="7"/><circle cx="255" cy="235" r="7"/><circle cx="385" cy="235" r="7"/></g><g fill="#a7bed4" fontSize="11" fontFamily="monospace"><text x="80" y="80">SALA</text><text x="330" y="80">COZINHA</text><text x="215" y="208">QUARTO</text><text x="337" y="208">GARAGEM</text></g><g fill="#00d9ff" opacity=".1"><circle cx="130" cy="125" r="23"/><circle cx="385" cy="110" r="23"/><circle cx="255" cy="235" r="23"/><circle cx="385" cy="235" r="23"/></g></svg><div className="n-map-footer"><span><Lightbulb size={13}/> Luzes</span><span><Zap size={13}/> Tomadas</span><span><Wifi size={13}/> Sensores</span></div></div>
    <div className="n-ecosystem-copy"><span className="n-eyebrow">02 / TUDO CONECTADO</span><h2>Uma casa inteira.<br/><span>Uma única central.</span></h2><p>Iluminação, tomadas, inventário da geladeira e rotinas no mesmo lugar. Controle na web e acompanhe as mudanças no aplicativo mobile.</p><ul><li><Check size={16}/> Estados sincronizados entre interfaces</li><li><Check size={16}/> Compras a partir do inventário cadastrado</li><li><Check size={16}/> Simulação de falhas e histórico de ações</li></ul><button className="n-text-button" disabled={loading} onClick={enter}>Entrar na central de comando <ArrowUpRight size={17}/></button><small>Dispositivos virtuais nesta versão. Integrações físicas em desenvolvimento.</small></div>
   </div></section>
   <section className="n-container n-section n-mobile-section" id="mobile"><div className="n-mobile-copy"><span className="n-eyebrow">03 / SUA CASA VAI COM VOCÊ</span><h2>O poder do Nexus.<br/><span>Na palma da mão.</span></h2><p>Um aplicativo Expo para Android e iOS, conectado à mesma residência da plataforma web. Dispositivos, assistente e sugestões em uma experiência mobile.</p><div className="n-platforms"><span><Smartphone size={15}/> Android</span><span><Smartphone size={15}/> iOS · em desenvolvimento</span><span>React Native + Expo</span></div>
    <a className="n-button n-download" href={mobileUrl||apkUrl} download={mobileUrl?undefined:'nexus-home-1.0.0-arm64.apk'} target={mobileUrl?'_blank':undefined} rel="noopener noreferrer"><Download size={19}/> faça download aqui <ArrowUpRight size={17}/></a>
    <div className="n-download-info"><Download size={17}/><p>{mobileUrl?'Acesse a distribuição mobile pelo link disponibilizado para este ambiente.':'APK de demonstração 1.0.0 · 13,3 MB. Android 7.0 ou superior, processador ARM64. Instalação direta, sem Expo Go.'}</p></div>
    {!mobileUrl&&<><div className="n-download-links"><a href={sourceUrl} target="_blank" rel="noopener noreferrer"><Github size={13}/> Código-fonte</a><a href="/downloads/nexus-home-1.0.0-arm64.apk.sha256" download>Verificar SHA-256</a></div><details className="n-install-help"><summary>Como instalar no Android <ChevronRight size={14}/></summary><ol><li>Toque em <strong>faça download aqui</strong> e aguarde o APK.</li><li>Abra o arquivo baixado. Se o Android solicitar, autorize temporariamente a instalação por esse navegador.</li><li>Instale o NEXUS HOME e escolha <strong>Explorar demonstração sem internet</strong>.</li><li>Para sincronizar com a web, informe a URL HTTPS da mesma API na tela inicial do app.</li></ol><p>O modo local usa dispositivos virtuais e reinicia os dados ao fechar. O pacote foi compilado e sua assinatura verificada; o uso em aparelho físico ainda não foi testado.</p></details></>}

   </div><div className="n-phone-area"><span className="n-phone-caption">A MESMA CASA. EM QUALQUER TELA.</span><div className="n-phone"><div className="n-phone-notch"/><div className="n-phone-status"><span>15:00</span><Wifi size={12}/></div><div className="n-phone-brand"><Command size={18}/> NEXUS <span>HOME</span></div><div className="n-phone-greeting"><small>MINHA RESIDÊNCIA · DEMO</small><h3>Olá, Alex. <Sparkles size={17}/></h3><p>Sua casa está em sintonia.</p></div><div className="n-phone-assistant"><NexusCore/><span>NEXUS INTELLIGENCE</span><strong>Pronto para ajudar.</strong><div className="n-wave">{Array.from({length:17},(_,i)=><i key={i} style={{height:8+(i*7%21)}}/>)}</div></div><div className="n-phone-suggestion"><div><Coffee size={15}/><span>UM HÁBITO SEU</span></div><p>Que tal preparar seu café às 15h?</p><span>Sim, preparar <ArrowUpRight size={11}/></span></div><div className="n-phone-nav"><Monitor size={16}/><Lightbulb size={16}/><span><Command size={19}/></span><Zap size={16}/><ShieldCheck size={16}/></div></div><span className="n-phone-note">Interface ilustrativa · Experimente o app pelo projeto Expo</span></div></section>
   <section className="n-final n-container"><div><span className="n-eyebrow">O FUTURO SE SENTE EM CASA.</span><h2>Conheça a sua nova<br/><span>inteligência residencial.</span></h2></div><div><button className="n-button" disabled={loading} onClick={enter}>Abrir aplicativo web <ArrowUpRight size={18}/></button><p>Explore o simulador. Descubra as possibilidades.</p></div></section>
  </main>
  <footer className="n-footer n-container"><a className="brand n-brand" href="#inicio"><Command size={22}/> NEXUS<span>HOME</span></a><span>Inteligência que faz parte de casa.</span><a href="https://github.com/5an1ty/jarvis-senai" target="_blank" rel="noopener noreferrer"><Github size={15}/> Projeto aberto <ArrowUpRight size={13}/></a><span className="n-version">DEMONSTRAÇÃO / v0.1</span></footer>
 </div>
}
