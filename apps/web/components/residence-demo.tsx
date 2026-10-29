'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowLeft, ArrowUpRight, Check, CheckCheck, Command, Copy, Lightbulb, Minus, Package, Plus, Refrigerator, RotateCcw, ShieldCheck, ShoppingBasket, Sparkles, Wifi, Zap } from 'lucide-react';
import { colors, DEMO_STORAGE_KEY, foods, initialResidence, lamps, plugs, readResidence, shoppingFor, type DemoState } from '../lib/residence-demo';
import './residence-demo.css';

export default function ResidenceDemo() {
  const [home, setHome] = useState<DemoState>(initialResidence);
  const [loaded, setLoaded] = useState(false);
  const [canSave, setCanSave] = useState(true);
  const [filter, setFilter] = useState('Todos');
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [copyFallback, setCopyFallback] = useState('');

  useEffect(() => {
    try { const saved = readResidence(localStorage.getItem(DEMO_STORAGE_KEY)); if (saved) setHome(saved); }
    catch { setCanSave(false); }
    setLoaded(true);
    const sync = (event: StorageEvent) => {
      if (event.key === DEMO_STORAGE_KEY) {
        const state = readResidence(event.newValue);
        if (state) setHome(state);
      }
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(home)); }
    catch { setCanSave(false); }
  }, [home, loaded]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const shopping = shoppingFor(home);
  const active = lamps.filter(lamp => home.lamps[lamp.id].on).length + plugs.filter(plug => home.plugs[plug.id]).length;
  const watts = lamps.reduce((sum, lamp) => sum + (home.lamps[lamp.id].on ? lamp.watts * home.lamps[lamp.id].brightness / 100 : 0), 0)
    + plugs.reduce((sum, plug) => sum + (home.plugs[plug.id] ? plug.watts : 0), 0);
  const available = foods.filter(food => home.quantities[food.id] > 0).length;
  const chosen = selected.filter(id => shopping.some(food => food.id === id));

  function power(kind: 'lamps' | 'plugs', id: string, on: boolean, name: string) {
    setHome(current => kind === 'lamps'
      ? { ...current, lamps: { ...current.lamps, [id]: { ...current.lamps[id], on } } }
      : { ...current, plugs: { ...current.plugs, [id]: on } });
    setNotice(`${name}: ${on ? 'ON · ligado' : 'OFF · desligado'} no simulador.`);
  }
  function changeColor(id: string, color: string) {
    setHome(current => ({ ...current, lamps: { ...current.lamps, [id]: { ...current.lamps[id], color } } }));
  }
  function changeStock(id: string, delta: number) {
    setHome(current => ({ ...current, quantities: { ...current.quantities, [id]: Math.max(0, Math.min(99, current.quantities[id] + delta)) } }));
    setCopyFallback('');
    setSelected(current => current.filter(value => value !== id));
  }
  function restock() {
    if (!chosen.length) return;
    setHome(current => {
      const quantities = { ...current.quantities };
      for (const food of foods) if (chosen.includes(food.id)) quantities[food.id] = Math.max(quantities[food.id], food.minimum);
      return { ...current, quantities };
    });
    setSelected([]);
    setCopyFallback('');
    setNotice('Reposição simulada. O estoque e a lista de compras foram atualizados.');
  }
  async function copyList() {
    const text = ['NEXUS HOME · Lista de compras', ...shopping.map(food => `• ${food.name}: ${food.needed} ${food.needed === 1 ? food.unit.slice(0, -1) : food.unit}`)].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setNotice('Lista copiada. Nenhuma compra ou envio foi realizado.');
    } catch {
      setCopyFallback(text);
      setNotice('Selecione e copie a lista no campo abaixo.');
    }
  }

  const powerButtons = (kind: 'lamps' | 'plugs', id: string, on: boolean, name: string) => (
    <div className="rd-power" role="group" aria-label={`Controle de ${name}`}>
      <button aria-label={`Ligar ${name}`} aria-pressed={on} className={on ? 'is-on' : ''} onClick={() => power(kind, id, true, name)}><span /> ON</button>
      <button aria-label={`Desligar ${name}`} aria-pressed={!on} className={!on ? 'is-off' : ''} onClick={() => power(kind, id, false, name)}>OFF</button>
    </div>
  );

  return <div className="residence-demo">
    <header className="rd-header">
      <Link href="/" className="brand"><Command size={27} /> NEXUS<span>HOME</span></Link>
      <div className="rd-header-links"><a href="#controles">Dispositivos</a><a href="#geladeira">Geladeira & compras</a></div>
      <Link href="/" className="rd-back"><ArrowLeft size={14} /> Voltar ao site</Link>
    </header>
    <main className="rd-main">
      <div className="rd-heading">
        <div><span className="rd-eyebrow">EXPLORE. CONTROLE. EXPERIMENTE.</span><h1>Sua casa, em suas mãos<span>.</span></h1><p>Uma residência virtual para descobrir o que o NEXUS pode fazer.</p></div>
        <span className="rd-demo-badge"><span /> DEMONSTRAÇÃO INTERATIVA</span>
      </div>
      <div className="rd-overview">
        <div><span className="rd-summary-icon"><Wifi size={19} /></span><span>Dispositivos virtuais<strong>04 <small>conectados</small></strong></span></div>
        <div><span className="rd-summary-icon green"><Zap size={19} /></span><span>Em funcionamento<strong>{String(active).padStart(2, '0')} <small>ligados</small></strong></span></div>
        <div><span className="rd-summary-icon purple"><ShoppingBasket size={19} /></span><span>Precisam de reposição<strong>{String(shopping.length).padStart(2, '0')} <small>alimentos</small></strong></span></div>
        <div className="rd-local-note"><ShieldCheck size={21} /><p>Você está no controle.<small>{canSave ? 'Alterações salvas apenas neste navegador.' : 'Armazenamento indisponível. Alterações só nesta sessão.'}</small></p></div>
      </div>

      <section id="controles" className="rd-section" aria-labelledby="device-title">
        <div className="rd-section-heading"><div><span className="rd-eyebrow">01 / CASA CONECTADA</span><h2 id="device-title">Ajuste o clima da sua casa.</h2></div><span className="rd-muted">{watts.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} W · potência estimada no simulador</span></div>
        <div className="rd-device-grid">
          {lamps.map(lamp => {
            const state = home.lamps[lamp.id];
            const name = colors.find(color => color.value.toLowerCase() === state.color.toLowerCase())?.name || 'Personalizada';
            return <article key={lamp.id} data-testid={`lamp-${lamp.id}`} className={`rd-device rd-lamp ${state.on ? 'rd-device-on' : ''}`} style={{ '--light-color': state.color, '--light-intensity': state.brightness / 100 } as CSSProperties}>
              <div className="rd-device-top"><span className="rd-device-type">ILUMINAÇÃO RGB</span><span className={`rd-device-state ${state.on ? 'enabled' : ''}`}><i />{state.on ? 'Ligada' : 'Desligada'}</span></div>
              <div className="rd-lamp-scene"><div className="rd-lamp-halo" /><Lightbulb size={54} strokeWidth={1.2} /><span className="rd-light-reflection" /></div>
              <div className="rd-device-name"><h3>{lamp.name}</h3><span>{lamp.room}</span></div>
              {powerButtons('lamps', lamp.id, state.on, lamp.name)}
              <div className="rd-color-label"><span>{state.on ? 'Cor da iluminação' : 'Cor ao ligar'}</span><strong>{name}</strong></div>
              <div className="rd-swatches" role="group" aria-label={`Cores da ${lamp.name}`}>
                {colors.map(color => <button key={color.value} aria-label={`Cor ${color.name} da ${lamp.name}`} aria-pressed={state.color.toLowerCase() === color.value} onClick={() => changeColor(lamp.id, color.value)} style={{ '--swatch-color': color.value } as CSSProperties}><span />{state.color.toLowerCase() === color.value && <Check size={12} />}</button>)}
                <label className="rd-custom-color" title="Escolher outra cor"><Plus size={14} /><input aria-label={`Cor personalizada da ${lamp.name}`} type="color" value={state.color} onChange={event => changeColor(lamp.id, event.target.value)} /></label>
              </div>
              <div className="rd-brightness"><label htmlFor={`brightness-${lamp.id}`}>Brilho <span>{state.brightness}%</span></label><input id={`brightness-${lamp.id}`} type="range" min="1" max="100" value={state.brightness} onChange={event => setHome(current => ({ ...current, lamps: { ...current.lamps, [lamp.id]: { ...current.lamps[lamp.id], brightness: Number(event.target.value) } } }))} /></div>
            </article>;
          })}
          {plugs.map(plug => {
            const on = home.plugs[plug.id];
            return <article key={plug.id} data-testid={`plug-${plug.id}`} className={`rd-device rd-plug ${on ? 'rd-device-on' : ''}`}>
              <div className="rd-device-top"><span className="rd-device-type">TOMADA INTELIGENTE</span><span className={`rd-device-state ${on ? 'enabled' : ''}`}><i />{on ? 'Ligada' : 'Desligada'}</span></div>
              <div className="rd-plug-scene"><div className="rd-socket"><div className="rd-socket-hole" /><div className="rd-socket-hole" /><div className="rd-socket-earth" /><span /></div></div>
              <div className="rd-device-name"><h3>{plug.name}</h3><span>{plug.room}</span></div>
              {powerButtons('plugs', plug.id, on, plug.name)}
              <div className="rd-plug-power"><span><Zap size={14} /> Potência simulada</span><strong>{on ? plug.watts : 0}<small> W</small></strong></div>
              <div className="rd-connection"><Wifi size={13} /> Conectada ao simulador <Check size={12} /></div>
            </article>;
          })}
        </div>
      </section>

      <div className="rd-insight"><span className="rd-insight-icon"><Sparkles size={20} /></span><div><span>NEXUS INSIGHTS</span><p>{shopping.length ? `${shopping.length} alimentos estão abaixo do estoque mínimo. A lista de compras já está organizada para você.` : 'Tudo em dia na cozinha. Seu inventário está completo e não há itens para repor.'}</p></div><a href="#geladeira">Ver cozinha <ArrowDown size={15} /></a></div>

      <section id="geladeira" className="rd-section" aria-labelledby="kitchen-title">
        <div className="rd-section-heading"><div><span className="rd-eyebrow">02 / COZINHA INTELIGENTE</span><h2 id="kitchen-title">O que tem. O que falta.</h2></div><span className="rd-muted"><RotateCcw size={13} /> Lista atualizada ao alterar o estoque</span></div>
        <div className="rd-kitchen-grid">
          <article className="rd-fridge-panel">
            <div className="rd-panel-title"><span className="rd-panel-icon"><Refrigerator size={19} /></span><div><h3>Minha geladeira</h3><p>Inventário da residência virtual</p></div><span className="rd-small-tag">SIMULADA</span></div>
            <div className="rd-fridge-body">
              <div className="rd-fridge-illustration" aria-hidden="true"><div className="rd-fridge-appliance"><div className="rd-fridge-freezer"><span>NEXUS</span><i /></div><div className="rd-fridge-door"><div className="rd-fridge-shelf"><span className={home.quantities.milk ? '' : 'empty'}>🥛</span><span>🥚</span></div><div className="rd-fridge-shelf"><span>🍎</span><span>🧀</span></div><div className="rd-fridge-shelf"><span>🥬</span><span>🍅</span></div><i /></div></div><span className="rd-fridge-caption">ESTOQUE VIRTUAL</span><strong>{available}<small> de {foods.length} alimentos disponíveis</small></strong><span className="rd-fridge-explainer">Edite as quantidades<br />para simular sua rotina.</span></div>
              <div className="rd-inventory"><div className="rd-food-filters" role="group" aria-label="Filtrar inventário">{['Todos', 'Disponíveis', 'A repor'].map(value => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div>
                <div className="rd-food-list">{foods.filter(food => filter === 'Todos' || (filter === 'Disponíveis' ? home.quantities[food.id] > 0 : home.quantities[food.id] < food.minimum)).map(food => {
                  const quantity = home.quantities[food.id];
                  return <div key={food.id} data-testid={`food-${food.id}`} className="rd-food-row"><div className={`rd-food-icon ${quantity === 0 ? 'missing' : ''}`}><Package size={16} /></div><div className="rd-food-info"><h4>{food.name}</h4><span className={quantity === 0 ? 'missing' : quantity < food.minimum ? 'low' : 'enough'}>{quantity === 0 ? 'Em falta' : quantity < food.minimum ? 'Estoque baixo' : 'Disponível'}<small> · mín. {food.minimum}</small></span></div><div className="rd-quantity" role="group" aria-label={`Quantidade de ${food.name}`}><button aria-label={`Diminuir ${food.name}`} disabled={quantity === 0} onClick={() => changeStock(food.id, -1)}><Minus size={12} /></button><output aria-label={`Estoque de ${food.name}`}>{quantity}</output><button aria-label={`Aumentar ${food.name}`} disabled={quantity === 99} onClick={() => changeStock(food.id, 1)}><Plus size={12} /></button></div></div>;
                })}</div>
                {foods.filter(food => filter === 'Todos' || (filter === 'Disponíveis' ? home.quantities[food.id] > 0 : home.quantities[food.id] < food.minimum)).length === 0 && <p className="rd-no-foods">Nenhum alimento nesta categoria.</p>}
              </div>
            </div><div className="rd-panel-foot"><ShieldCheck size={13} /> Dados de demonstração. Nenhum sensor físico está sendo consultado.</div>
          </article>
          <article className="rd-shopping-panel" aria-labelledby="shopping-title"><div className="rd-panel-title"><span className="rd-panel-icon purple"><ShoppingBasket size={19} /></span><div><h3 id="shopping-title">Lista de compras</h3><p>O que falta para completar sua geladeira</p></div><span className="rd-shopping-count">{shopping.length}</span></div>
            {shopping.length > 0 ? <><div className="rd-shopping-note"><Sparkles size={13} /> Calculada a partir dos mínimos do inventário</div><div className="rd-shopping-list">{shopping.map(food => <label key={food.id} data-testid={`shopping-${food.id}`} className={`rd-shopping-item ${chosen.includes(food.id) ? 'checked' : ''}`}><input type="checkbox" aria-label={`Selecionar ${food.name} para reposição`} checked={chosen.includes(food.id)} onChange={event => setSelected(current => event.target.checked ? [...new Set([...current, food.id])] : current.filter(id => id !== food.id))} /><span className="rd-checkbox"><Check size={12} /></span><span><strong>{food.name}</strong><small>{home.quantities[food.id] === 0 ? 'Acabou na geladeira' : `Restam ${home.quantities[food.id]} · mínimo ${food.minimum}`}</small></span><b>{food.needed}<small>{food.needed === 1 ? food.unit.slice(0, -1) : food.unit}</small></b></label>)}</div><div className="rd-shopping-actions"><button className="rd-primary" disabled={!chosen.length} onClick={restock}><CheckCheck size={16} /> Simular reposição{chosen.length > 0 && ` (${chosen.length})`}</button><button className="rd-copy" onClick={copyList}><Copy size={15} /> Copiar lista</button><small>Selecione itens para repor o estoque virtual. Nenhuma compra real será feita.</small></div></> : <div className="rd-shopping-empty"><CheckCheck size={35} /><h4>Geladeira em dia!</h4><p>Todos os alimentos estão no estoque mínimo ou acima dele. Diminua uma quantidade para ver a lista se atualizar.</p></div>}
            {copyFallback && <textarea className="rd-copy-fallback" aria-label="Lista para copiar" readOnly value={copyFallback} onFocus={event => event.target.select()} />}
          </article>
        </div>
      </section>
      <div className="rd-bottom"><span><ShieldCheck size={15} /> Esta é uma demonstração local. Nenhum equipamento real é acionado.</span><button onClick={() => { setHome(initialResidence()); setSelected([]); setCopyFallback(''); setFilter('Todos'); setNotice('Demonstração restaurada para os valores iniciais.'); }}><RotateCcw size={14} /> Restaurar demonstração</button></div>
      <footer className="rd-footer"><span><Command size={14} /> NEXUS HOME <i /> Inteligência que faz parte de casa.</span><Link href="/#mobile">Conheça o aplicativo mobile <ArrowUpRight size={13} /></Link></footer>
    </main>
    <div className={`rd-feedback ${notice ? 'visible' : ''}`} role="status" aria-live="polite">{notice && <><Check size={16} /><span>{notice}</span><button aria-label="Fechar aviso" onClick={() => setNotice('')}>×</button></>}</div>
  </div>;
}
