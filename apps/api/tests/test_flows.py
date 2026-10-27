import pytest
from fastapi.testclient import TestClient
from nexus import main

@pytest.fixture
def client(tmp_path,monkeypatch):
    from sqlalchemy import create_engine
    monkeypatch.setattr(main,'engine',create_engine(f'sqlite:///{tmp_path}/test.db'))
    main.load()
    main.state=main.initial()
    main.sessions.clear()
    with TestClient(main.app) as c:
        token=c.post('/auth/demo').json()['token']
        c.headers['Authorization']='Bearer '+token
        yield c

def test_auth(client):
    assert client.get('/home',headers={'Authorization':''}).status_code==401

def test_contextual_commands(client):
    for message in ['Acenda a luz da sala','Agora diminua para 40%','E deixe azul']:
        r=client.post('/chat',json={'text':message}); assert r.status_code==200; assert r.json()['status']=='confirmed'
    d=client.get('/home').json()['devices'][0]
    assert d['on'] and d['brightness']==40 and d['color']=='#0088ff'

def test_shopping(client):
    r=client.post('/chat',json={'text':'Faça uma lista de compras da geladeira'})
    assert 'Nenhum envio' in r.json()['message']
    assert client.get('/home').json()['shopping']==[{'name':'Leite','quantity':2},{'name':'Ovos','quantity':3}]

def test_coffee_consent_and_decline(client):
    assert client.post('/simulator/coffee-routine').status_code==409
    client.patch('/preferences',json={'learning':True})
    data=client.post('/simulator/coffee-routine').json()
    assert len(data['suggestions'])==1
    assert len(client.get('/home').json()['events'])==3
    client.post('/suggestions/coffee-pattern/decision',json={'accept':False})
    assert client.post('/simulator/coffee-routine').json()['suggestions'][0]['status']=='declined'
    assert not main.state['scheduled']

def test_coffee_accept_is_only_schedule(client):
    client.patch('/preferences',json={'learning':True})
    client.post('/simulator/coffee-routine')
    assert client.post('/suggestions/coffee-pattern/decision',json={'accept':True}).status_code==200
    assert main.state['scheduled'][0]['status']=='pending'
    assert not main.device('coffee')['on']
    assert client.post('/suggestions/coffee-pattern/decision',json={'accept':True}).status_code==409

def test_offline_no_false_confirmation(client):
    client.post('/simulator/living/connection')
    r=client.post('/chat',json={'text':'Acenda a luz da sala'})
    assert r.status_code==409
    assert not main.state['events']

def test_privacy(client):
    client.patch('/preferences',json={'learning':True})
    client.post('/simulator/coffee-routine')
    client.patch('/preferences',json={'learning':False})
    client.post('/devices/living/commands',json={'action':'off'})
    assert not main.state['events'][-1]['personalization']
    assert not main.state['suggestions']
    assert client.post('/simulator/coffee-routine').status_code==409
    assert client.delete('/history').status_code==200
    assert not main.state['events']

def test_websocket_cross_client(client):
    t=client.post('/auth/demo').json()['token']
    with client.websocket_connect('/ws') as ws:
        ws.send_text(t); ws.receive_json()
        client.post('/devices/living/commands',json={'action':'off'})
        assert ws.receive_json()['devices'][0]['on'] is False

def test_validation(client):
    assert client.post('/devices/living/commands',json={'action':'brightness','value':101}).status_code==422
    assert client.post('/devices/camera/commands',json={'action':'on'}).status_code==422
    assert client.patch('/inventory/Leite',json={'quantity':-1}).status_code==422

def test_persistence(client):
    client.post('/devices/living/commands',json={'action':'off'})
    assert main.load()['devices'][0]['on'] is False
