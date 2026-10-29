import type {Device, HomeState} from '@nexus/contracts';

/** Explicit, session-only simulator. No physical device or remote service is contacted. */
export function createLocalDemo(clock:()=>Date=()=>new Date()){
 const rows:[string,string,string,string,boolean,number][]=[['living','Luz da sala','Sala','light',true,18],['bedroom','Luz do quarto','Quarto','light',false,9],['plug','Tomada do escritório','Escritório','plug',true,65],['coffee','Cafeteira','Cozinha','coffee',false,900],['fridge','Geladeira','Cozinha','fridge',true,120],['temperature','Sensor de temperatura','Quarto','sensor',true,0]];
 const state:HomeState={devices:rows.map(([id,name,room,kind,on,watts])=>({id,name,room,kind,on,watts,online:true,brightness:80,color:'#00d9ff'})),inventory:[{name:'Leite',quantity:0,minimum:2},{name:'Ovos',quantity:3,minimum:6}],shopping:[],suggestions:[],events:[],learning:false,automations:[{id:'cinema',name:'Modo cinema',enabled:true},{id:'night',name:'Boa noite',enabled:true}]};
 let last:string|undefined;let sequence=0;
 const jobs:{at:Date;status:string}[]=[];
 function snapshot(){return JSON.parse(JSON.stringify(state)) as HomeState}
 function control(id:string,action:string,value?:number|string){
  const d=state.devices.find(d=>d.id===id);
  if(!d)throw Error('Dispositivo não encontrado');
  if(!d.online)throw Error('Dispositivo offline. Ação não executada.');
  const allowed:Record<string,string[]>={light:['on','off','brightness','color'],plug:['on','off'],coffee:['brew']};
  if(!allowed[d.kind]?.includes(action))throw Error('Controle incompatível');
  if(action==='brightness'&&(typeof value!=='number'||value<0||value>100))throw Error('Informe brilho entre 0 e 100%.');
  if(action==='color'&&(typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value)))throw Error('Cor inválida');
  if(action==='on'||action==='off'||action==='brew')d.on=action!=='off';
  if(action==='brightness')d.brightness=value as number;
  if(action==='color')d.color=value as string;
  state.events.push({id:String(++sequence),device:id,action,at:clock().toISOString(),result:'confirmed',source:'local-simulator'});
  state.events=state.events.slice(-1000);
  return {message:`${d.name}: comando confirmado pelo simulador local.`};
 }
 function shopping(){state.shopping=state.inventory.filter(x=>x.quantity<x.minimum).map(x=>({name:x.name,quantity:x.minimum-x.quantity}));return state.shopping}
 function automation(id:string){
  if(!state.automations.some(a=>a.id===id))throw Error('Rotina não encontrada');
  if(id==='cinema')return control('living','brightness',20);
  for(const d of state.devices.filter(d=>d.kind==='light'))control(d.id,'off');
  return {message:'Luzes desligadas no simulador local.'};
 }
 return {async request(path:string,method='GET',body?:unknown):Promise<any>{
  const data=(body||{}) as Record<string,any>;
  if(path==='/home'){
   for(const j of jobs)if(j.status==='pending'&&j.at<=clock()){try{control('coffee','brew');j.status='confirmed'}catch{j.status='failed'}}
   return snapshot();
  }
  if(path==='/auth/demo')return {token:'local-demo'};
  const command=path.match(/^\/devices\/([^/]+)\/commands$/);
  if(command)return control(command[1],data.action,data.value);
  if(path==='/shopping/generate')return shopping();
  if(path==='/preferences'){
   state.learning=Boolean(data.learning);if(!state.learning)state.suggestions=[];
   return {message:state.learning?'Aprendizado local autorizado.':'Aprendizado desativado.'};
  }
  if(path==='/simulator/coffee-routine'){
   if(!state.learning)throw Error('Autorize o aprendizado antes de simular a rotina.');
   if(!state.suggestions.length){
    for(const days of [3,2,1]){const at=clock();at.setDate(at.getDate()-days);at.setHours(15,0,0,0);state.events.push({id:String(++sequence),device:'coffee',action:'brew',at:at.toISOString(),result:'confirmed',source:'local-simulated-history'});}
    state.suggestions.push({id:'coffee-pattern',text:'Percebi que você costuma preparar café às 15h. Gostaria que eu preparasse novamente hoje?',reason:'Simulação local de três dias consecutivos de café às 15h. Nenhum equipamento físico é acionado.',status:'pending'});}
   return {message:'Três dias simulados. Confira a sugestão abaixo.'};
  }
  const decision=path.match(/^\/suggestions\/([^/]+)\/decision$/);
  if(decision){
   const s=state.suggestions.find(s=>s.id===decision[1]);
   if(!s||s.status!=='pending')throw Error('Sugestão indisponível');
   s.status=data.accept?'accepted':'declined';
   if(!data.accept)return {message:'Preferência registrada nesta sessão. Não vou insistir.'};
   const at=clock();at.setHours(15,0,0,0);if(at<=clock())at.setDate(at.getDate()+1);jobs.push({at,status:'pending'});
   return {message:'Café virtual agendado para a próxima ocorrência das 15h no horário do aparelho. Mantenha o app aberto. Esta sessão local não persiste após fechar o aplicativo.'};
  }
  const routine=path.match(/^\/automations\/([^/]+)\/run$/);if(routine)return automation(routine[1]);
  if(path==='/chat'){
   const t=String(data.text||'').toLowerCase();
   if(!t.trim())throw Error('Escreva um comando.');
   if(t.includes('lista')&&(t.includes('compra')||t.includes('geladeira'))){shopping();return {message:'Lista criada a partir do inventário local. Nenhum envio foi realizado.'}}
   if(t.includes('temperatura'))return {message:'Sensor virtual: 23 °C.'};
   if(t.includes('cinema'))return automation('cinema');
   const id=t.includes('sala')?'living':t.includes('quarto')?'bedroom':t.includes('tomada')?'plug':t.includes('café')||t.includes('cafeteira')?'coffee':last;
   if(!id)return {message:'Experimente: acenda a luz da sala; diminua para 40%; deixe azul; lista de compras da geladeira.'};
   last=id;
   const match=t.match(/(\d+)\s*%/);
   if(match)return control(id,'brightness',Number(match[1]));
   if(t.includes('azul'))return control(id,'color','#0088ff');
   if(/deslig|apagu|apaga/.test(t))return control(id,'off');
   if(/lig|acend|prepare|faça/.test(t))return control(id,id==='coffee'?'brew':'on');
   return {message:'Experimente um comando para ligar, desligar ou ajustar a luz.'};
  }
  throw Error('Recurso não disponível no simulador local. Conecte uma API para usar os recursos remotos.');
 }};
}
