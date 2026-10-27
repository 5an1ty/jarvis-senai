// Run against the local demo. Requires playwright in the test environment.
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require('playwright');
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try {
 const a=await browser.newPage({viewport:{width:1440,height:1000}});
 const b=await browser.newPage({viewport:{width:390,height:844}});
 const errors=[];
 for(const p of [a,b]){p.on('pageerror',e=>errors.push(e.message));await p.goto('http://localhost:3000');await p.getByText('Explorar residência de demonstração').click();await p.getByText('Bem-vindo de volta, Alex.').waitFor();}
 // Disable background polling to prove that updates arrive through WebSocket.
 await b.evaluate(()=>{for(let i=1;i<10000;i++)clearInterval(i)});
 await a.getByRole('button',{name:'NEXUS AI',exact:true}).click();
 for(const text of ['Desligue a luz da sala','Acenda a luz da sala','Agora diminua para 40%','E deixe azul']){
  await a.getByLabel('Mensagem para Nexus').fill(text);await a.getByLabel('Enviar mensagem').click();
  await a.waitForFunction(()=>!document.querySelector('button[aria-label="Enviar mensagem"]')?.disabled);
  if(text.startsWith('Desligue'))await b.waitForFunction(()=>document.querySelector('.device')?.textContent?.includes('Desligado'));
 }
 await b.waitForFunction(()=>document.querySelector('.device')?.textContent?.includes('Ligado'));
 await a.getByRole('button',{name:'Hábitos & insights',exact:true}).click();
 const consent=a.getByRole('checkbox');if(await consent.isChecked()){await consent.click();await a.waitForFunction(()=>!document.querySelector('input[type=checkbox]')?.checked)}await consent.click();await a.waitForFunction(()=>document.querySelector('input[type=checkbox]')?.checked);
 await a.getByRole('button',{name:'Simular três dias de café',exact:true}).click();
 await a.getByRole('button',{name:'Não, obrigado',exact:true}).waitFor();
 await a.getByRole('button',{name:'Não, obrigado',exact:true}).click();
 await a.getByRole('button',{name:'Geladeira & compras',exact:true}).click();
 await a.getByRole('button',{name:'Gerar lista de compras',exact:true}).click();
 await a.getByText('2 un.',{exact:true}).waitFor();
 if(await b.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Horizontal overflow');
 if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS: chat contextual, duas sessões, café proativo, compras e layout 390px; sem erros de página.');
}finally{await browser.close()}
