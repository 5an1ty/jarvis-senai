"""NEXUS demonstration API. All devices belong to an explicitly simulated home."""
import asyncio
import copy
import json
import os
import re
import secrets
import threading
from datetime import datetime, timedelta
from contextlib import asynccontextmanager
from zoneinfo import ZoneInfo
from fastapi import FastAPI, HTTPException, Depends, Header, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, text

engine = create_engine(os.getenv('DATABASE_URL', 'sqlite:///./nexus.db'))
lock = threading.RLock()
sessions: dict[str, dict] = {}
clients: set[WebSocket] = set()

def now(): return datetime.now(ZoneInfo('America/Sao_Paulo'))
def initial():
    kinds = [('living','Luz da sala','Sala','light',True,18),('bedroom','Luz do quarto','Quarto','light',False,9),('plug','Tomada do escritório','Escritório','plug',True,65),('coffee','Cafeteira','Cozinha','coffee',False,900),('fridge','Geladeira','Cozinha','fridge',True,120),('temperature','Sensor de temperatura','Quarto','sensor',True,0),('presence','Sensor de presença','Sala','sensor',True,0),('camera','Câmera da garagem','Garagem','camera',True,5)]
    return {'devices':[dict(id=i,name=n,room=r,kind=k,online=True,on=o,watts=w,brightness=80,color='#00d9ff') for i,n,r,k,o,w in kinds], 'inventory':[{'name':'Leite','quantity':0,'minimum':2},{'name':'Ovos','quantity':3,'minimum':6},{'name':'Maçãs','quantity':5,'minimum':3}], 'shopping':[], 'events':[], 'suggestions':[], 'learning':False,'scheduled':[], 'automations':[{'id':'cinema','name':'Modo cinema','enabled':True},{'id':'night','name':'Boa noite','enabled':True}]}

def load():
    with engine.begin() as c:
        c.execute(text('CREATE TABLE IF NOT EXISTS home_state (id INTEGER PRIMARY KEY, data TEXT NOT NULL)'))
        row=c.execute(text('SELECT data FROM home_state WHERE id=1')).first()
        return json.loads(row[0]) if row else initial()
state=load()
def save():
    with engine.begin() as c:
        c.execute(text('DELETE FROM home_state WHERE id=1'))
        c.execute(text('INSERT INTO home_state(id,data) VALUES (1,:data)'),{'data':json.dumps(state)})
def device(id):
    d=next((d for d in state['devices'] if d['id']==id),None)
    if not d: raise HTTPException(404,'Dispositivo não encontrado')
    return d

def execute(id, action, value=None, source='interface'):
    d=device(id)
    if not d['online']: raise HTTPException(409,'Dispositivo offline. Nenhuma ação foi confirmada.')
    allowed={'light':{'on','off','brightness','color'},'plug':{'on','off'},'coffee':{'brew'},'camera':set(),'sensor':set(),'fridge':set()}
    if action not in allowed[d['kind']]: raise HTTPException(422,'Ação incompatível com o dispositivo')
    if action=='brightness' and (not isinstance(value,int) or not 0<=value<=100): raise HTTPException(422,'Brilho entre 0 e 100')
    if action=='color' and (not isinstance(value,str) or not re.fullmatch(r'#[0-9a-fA-F]{6}',value)): raise HTTPException(422,'Cor RGB inválida')
    # Simulator acknowledgement. Physical adapters must return acknowledgement before updating state.
    if action in ('on','off','brew'): d['on']=action!='off'
    else: d[action]=value
    state['events'].append({'id':secrets.token_hex(6),'user':'demo','device':id,'action':action,'at':now().isoformat(),'room':d['room'],'source':source,'result':'confirmed','personalization':state['learning']})
    state['events']=state['events'][-1000:]
    save()
    return f"{d['name']}: comando confirmado pelo simulador."

async def broadcast():
    for ws in list(clients):
        try: await ws.send_json(state)
        except Exception: clients.discard(ws)

async def scheduler():
    while True:
        await asyncio.sleep(5)
        with lock:
            for job in state['scheduled']:
                if job['status']=='pending' and datetime.fromisoformat(job['at'])<=now():
                    try: execute('coffee','brew',source='schedule'); job['status']='confirmed'
                    except HTTPException: job['status']='failed'
                    save()
        await broadcast()

@asynccontextmanager
async def lifespan(app):
    task=asyncio.create_task(scheduler())
    yield
    task.cancel()
app=FastAPI(title='NEXUS HOME • Simulador IoT',lifespan=lifespan)
app.add_middleware(CORSMiddleware,allow_origins=os.getenv('CORS_ORIGINS','http://localhost:3000,http://127.0.0.1:3000').split(','),allow_methods=['*'],allow_headers=['*'])
def auth(authorization: str=Header(default='')):
    token=authorization.removeprefix('Bearer ')
    if token not in sessions: raise HTTPException(401,'Entre na residência de demonstração')
    return sessions[token]
class Command(BaseModel):
    action:str
    value: str|int|None=None
class Chat(BaseModel):
    text:str=Field(min_length=1,max_length=1000)
class Preference(BaseModel):
    learning:bool
class Inventory(BaseModel):
    quantity:int=Field(ge=0,le=10000)
class Decision(BaseModel):
    accept:bool

@app.get('/health')
def health(): return {'status':'ok','mode':'demonstration'}
@app.post('/auth/demo')
def login():
    token=secrets.token_urlsafe(32); sessions[token]={'last_device':None}
    return {'token':token,'user':'Alex','mode':'demonstration'}
@app.get('/home')
def home(user=Depends(auth)): return state
@app.post('/devices/{id}/commands')
async def command(id:str,body:Command,user=Depends(auth)):
    with lock: message=execute(id,body.action,body.value)
    await broadcast(); return {'status':'confirmed','message':message}
@app.post('/simulator/{id}/connection')
async def connection(id:str,user=Depends(auth)):
    with lock: d=device(id); d['online']=not d['online']; save()
    await broadcast(); return d
@app.patch('/inventory/{name}')
async def inventory(name:str,body:Inventory,user=Depends(auth)):
    with lock:
        item=next((x for x in state['inventory'] if x['name']==name),None)
        if not item: raise HTTPException(404,'Item não encontrado')
        item['quantity']=body.quantity; save()
    await broadcast(); return item
@app.post('/shopping/generate')
async def shopping(user=Depends(auth)):
    with lock:
        state['shopping']=[{'name':x['name'],'quantity':x['minimum']-x['quantity']} for x in state['inventory'] if x['quantity']<x['minimum']]; save()
    await broadcast(); return state['shopping']
@app.patch('/preferences')
async def preferences(body:Preference,user=Depends(auth)):
    with lock:
        state['learning']=body.learning
        if not body.learning: state['suggestions']=[]
        save()
    await broadcast(); return {'learning':state['learning']}
@app.delete('/history')
async def delete_history(user=Depends(auth)):
    with lock: state['events']=[]; state['suggestions']=[]; save()
    await broadcast(); return {'deleted':True}

def detect_coffee(reference):
    if not state['learning']: return
    events=[datetime.fromisoformat(e['at']) for e in state['events'] if e['device']=='coffee' and e['action']=='brew' and e['result']=='confirmed' and e.get('personalization')]
    days={e.date() for e in events if abs(e.hour*60+e.minute-900)<=20}
    if all((reference-timedelta(days=i)).date() in days for i in (1,2,3)) and not state['suggestions']:
        state['suggestions'].append({'id':'coffee-pattern','text':'Percebi que você costuma preparar café às 15h. Gostaria que eu preparasse novamente hoje?','reason':'Três dias consecutivos com preparo entre 14h40 e 15h20. Dados simulados; requer aceite.','status':'pending'})
@app.post('/simulator/coffee-routine')
async def simulate(user=Depends(auth)):
    if not state['learning']: raise HTTPException(409,'Ative o aprendizado com consentimento nas configurações.')
    with lock:
        reference=now().replace(hour=14,minute=0,second=0,microsecond=0)
        for i in (3,2,1):
            state['events'].append({'id':secrets.token_hex(6),'user':'demo','device':'coffee','action':'brew','at':(reference-timedelta(days=i)).replace(hour=15).isoformat(),'room':'Cozinha','source':'simulated-history','result':'confirmed','personalization':True})
        detect_coffee(reference); save()
    await broadcast(); return {'simulated_time':reference.isoformat(),'suggestions':state['suggestions']}
@app.post('/suggestions/{id}/decision')
async def decision(id:str,body:Decision,user=Depends(auth)):
    with lock:
        s=next((s for s in state['suggestions'] if s['id']==id),None)
        if not s: raise HTTPException(404,'Sugestão não encontrada')
        if s['status']!='pending': raise HTTPException(409,'Sugestão já respondida')
        s['status']='accepted' if body.accept else 'declined'
        if body.accept:
            at=now().replace(hour=15,minute=0,second=0,microsecond=0)
            if at<=now(): at+=timedelta(days=1)
            state['scheduled'].append({'at':at.isoformat(),'status':'pending','device':'coffee'})
        save()
    await broadcast(); return {'message':'Cafeteira simulada agendada para '+at.isoformat() if body.accept else 'Preferência registrada. Não vou insistir.'}
@app.post('/automations/{id}/run')
async def automation(id:str,user=Depends(auth)):
    routine=next((r for r in state['automations'] if r['id']==id),None)
    if not routine: raise HTTPException(404,'Rotina não encontrada')
    with lock:
        if id=='cinema': execute('living','brightness',20,source='automation')
        else:
            for d in state['devices']:
                if d['kind']=='light': execute(d['id'],'off',source='automation')
    await broadcast(); return {'message':'Rotina executada no simulador'}
@app.post('/chat')
async def chat(body:Chat,user=Depends(auth)):
    t=body.text.lower().strip(); message='Posso controlar luzes, consultar dispositivos e criar sua lista de compras. Experimente: acenda a luz da sala.'
    with lock:
        target=next((d for key,d in [('sala','living'),('quarto','bedroom'),('tomada','plug'),('café','coffee'),('cafeteira','coffee')] if key in t),user.get('last_device'))
        if 'lista' in t and ('compra' in t or 'geladeira' in t):
            await shopping(user); message='Lista de compras criada com base no inventário cadastrado. Nenhum envio foi realizado.'
        elif 'temperatura' in t: message='Sensor simulado do quarto: 23 °C. Umidade: 58%.'
        elif 'cinema' in t: message=(await automation('cinema',user))['message']
        elif target:
            if '%' in t:
                m=re.search(r'(\d+)\s*%',t)
                if not m: raise HTTPException(422,'Informe um percentual válido')
                message=execute(target,'brightness',int(m.group(1)),source='chat')
            elif any(c in t for c in ['azul','verde','vermelh']):
                color='#0088ff' if 'azul' in t else '#00ff9c' if 'verde' in t else '#ff365e'
                message=execute(target,'color',color,source='chat')
            elif any(w in t for w in ['deslig','apagu','apaga']): message=execute(target,'off',source='chat')
            elif any(w in t for w in ['lig','acend','acend','prepare','faça']): message=execute(target,'brew' if target=='coffee' else 'on',source='chat')
            else: message=f"{device(target)['name']}: {'online' if device(target)['online'] else 'offline'}."
            user['last_device']=target
    await broadcast(); return {'message':message,'status':'confirmed' if 'confirmado' in message else 'answered'}
@app.websocket('/ws')
async def websocket(ws:WebSocket):
    await ws.accept()
    try:
        token=await asyncio.wait_for(ws.receive_text(),timeout=5)
        if token not in sessions: await ws.close(code=1008); return
        clients.add(ws); await ws.send_json(state)
        while True: await ws.receive_text()
    except (WebSocketDisconnect,asyncio.TimeoutError): pass
    finally: clients.discard(ws)
