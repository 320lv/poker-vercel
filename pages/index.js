import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import dynamic from 'next/dynamic';

const TableScene = dynamic(() => import('../src/components/TableScene'), { ssr: false });

let socket;

export default function Home() {
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState(null);
  const [nick, setNick] = useState('Gracz' + Math.floor(Math.random()*1000));
  const [avatar, setAvatar] = useState('avatar1');
  const [myId, setMyId] = useState(null);
  const [maxPlayers] = useState(9);

  useEffect(()=> {
    const url = process.env.NEXT_PUBLIC_SOCKET_URL || '';
    socket = io(url || window.location.origin);
    socket.on('connect', () => { setConnected(true); setMyId(socket.id); });
    socket.on('roomState', state => setRoom(state));
    return () => { if (socket) socket.disconnect(); }
  }, []);

  function join() {
    socket.emit('joinRoom', { roomId: 'main', name: nick, avatar, maxPlayers });
  }

  function start() {
    socket.emit('startGame', { roomId: 'main' });
  }

  return (
    <div className='app'>
      <div className='header'>
        <h1>Poker Club — Demo</h1>
        <div style={{marginLeft:'auto'}}>Socket: {connected ? 'connected' : 'offline'}</div>
      </div>

      <div className='lobby'>
        <div className='card' style={{width:320}}>
          <h3>Lobby</h3>

          <div>
            <label>Nick</label><br/>
            <input value={nick} onChange={e=>setNick(e.target.value)} />
          </div>
          <div style={{marginTop:8}}>
            <label>Avatar</label><br/>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <select value={avatar} onChange={e=>setAvatar(e.target.value)}>
                <option value='avatar1'>Avatar 1</option>
                <option value='avatar2'>Avatar 2</option>
                <option value='avatar3'>Avatar 3</option>
              </select>
              <img src={'/images/'+avatar+'.svg'} style={{width:48,height:48,borderRadius:8}} alt='avatar' />
            </div>
          </div>
          <div style={{marginTop:12}}>
            <button onClick={join}>Dołącz do stołu</button>
            <button onClick={start} style={{marginLeft:8}}>Start (host)</button>
          </div>

        </div>

        <div style={{flex:1}}>
          <div className='card'>
            <h3>Stół (max {maxPlayers} osób)</h3>

            <div style={{height:380}} className='canvas-wrap'>
              <TableScene room={room} myId={myId} />
            </div>
            <div style={{marginTop:8, display:'flex', gap:8, alignItems:'center'}} className='card'>
              <div style={{flex:1}}>
                <strong>Players:</strong>
                <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
                  {room?.players?.map(p=>(
                    <div key={p.id} style={{padding:8,background:'#071229',borderRadius:8}}>
                      <img src={'/images/'+(p.avatar||'avatar1')+'.svg'} style={{width:40,height:40}} alt='' />
                      <div>{p.name}</div>
                      <div>Chips: {p.chips}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{width:320}}>
                <strong>Controls</strong>
                <div style={{marginTop:8,display:'flex',gap:8}}>
                  <button onClick={()=>socket.emit('playerAction',{roomId:'main', action:'fold'})}>Fold</button>
                  <button onClick={()=>socket.emit('playerAction',{roomId:'main', action:'call'})}>Call</button>
                  <input id='raiseAmt' type='number' defaultValue={100} style={{width:100,padding:6}} />
                  <button onClick={()=>{ const v=document.getElementById('raiseAmt').value; socket.emit('playerAction',{roomId:'main', action:'raise', amount: Number(v)}); }}>Raise</button>
                </div>
                <div style={{marginTop:8}}>Pot: {room?.pot || 0} | Stage: {room?.stage || 'waiting'}</div>
              </div>
            </div>

            <div style={{marginTop:12}}>
              <pre style={{whiteSpace:'pre-wrap'}}>{room ? JSON.stringify(room, null, 2) : 'Brak stanu'}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
