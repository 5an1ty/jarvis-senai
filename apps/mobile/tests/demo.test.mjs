import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createLocalDemo} from '../services/demo.ts';

test('local simulator confirms contextual device commands and validates capabilities',async()=>{
 const demo=createLocalDemo();
 for(const text of ['Acenda a luz da sala','Agora diminua para 40%','E deixe azul']){
  assert.match((await demo.request('/chat','POST',{text})).message,/confirmado pelo simulador local/);
 }
 const d=(await demo.request('/home')).devices[0];
 assert.equal(d.on,true);assert.equal(d.brightness,40);assert.equal(d.color,'#0088ff');
 await assert.rejects(demo.request('/devices/fridge/commands','POST',{action:'on'}),/incompatível/);
 await assert.rejects(demo.request('/devices/living/commands','POST',{action:'brightness',value:101}),/brilho/);
});
test('shopping uses registered inventory and does not claim sending',async()=>{
 const demo=createLocalDemo();
 assert.match((await demo.request('/chat','POST',{text:'Lista de compras da geladeira'})).message,/Nenhum envio/);
 assert.deepEqual((await demo.request('/home')).shopping,[{name:'Leite',quantity:2},{name:'Ovos',quantity:3}]);
});
test('consent, three historical days, decline and disabled learning',async()=>{
 const demo=createLocalDemo();
 await assert.rejects(demo.request('/simulator/coffee-routine','POST'),/Autorize/);
 await demo.request('/preferences','PATCH',{learning:true});
 await demo.request('/simulator/coffee-routine','POST');
 assert.equal((await demo.request('/home')).events.length,3);
 await demo.request('/suggestions/coffee-pattern/decision','POST',{accept:false});
 await demo.request('/simulator/coffee-routine','POST');
 assert.equal((await demo.request('/home')).suggestions[0].status,'declined');
 await demo.request('/preferences','PATCH',{learning:false});
 assert.deepEqual((await demo.request('/home')).suggestions,[]);
 await assert.rejects(demo.request('/simulator/coffee-routine','POST'),/Autorize/);
});
test('accepted local coffee is scheduled and confirmed only when time arrives',async()=>{
 let clock=new Date(2026,9,27,14,0,0);
 const demo=createLocalDemo(()=>new Date(clock));
 await demo.request('/preferences','PATCH',{learning:true});
 await demo.request('/simulator/coffee-routine','POST');
 await demo.request('/suggestions/coffee-pattern/decision','POST',{accept:true});
 assert.equal((await demo.request('/home')).devices.find(d=>d.id==='coffee').on,false);
 clock=new Date(2026,9,27,15,0,0);
 assert.equal((await demo.request('/home')).devices.find(d=>d.id==='coffee').on,true);
});
