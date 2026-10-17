import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../mario_game.html',import.meta.url),'utf8');
const source=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function boot({noAudio=false,blockedStorage=false}={}) {
  const handlers=new Map(), nodes=new Map(), frames=[], tones=[];
  function node(id) {
    if(nodes.has(id))return nodes.get(id);
    const listeners=new Map();
    const el={textContent:'',hidden:false,dataset:{},classList:{add(){},remove(){}},
      addEventListener(t,fn){listeners.set(t,fn);},setAttribute(){},focus(){},closest(){return null;},
      setPointerCapture(){},listeners};
    nodes.set(id,el);return el;
  }
  const context2d=new Proxy({}, {get(target,key){
    if(key==='createLinearGradient'||key==='createRadialGradient')return ()=>({addColorStop(){}});
    if(key==='measureText')return text=>({width:String(text).length*8});
    return target[key] ?? (()=>{});
  },set(target,key,value){target[key]=value;return true;}});
  node('c').getContext=()=>context2d;
  const touch=['ArrowLeft','ArrowRight','Space','ArrowUp'].map(key=>{const n=node('touch-'+key);n.dataset.key=key;return n;});
  class AudioContext {
    state='running';currentTime=0;destination={};
    createGain(){return {gain:{value:1,setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}};}
    createOscillator(){return {set type(value){assert.ok(['square','triangle','sawtooth','sine'].includes(value),'valid audio waveform');tones.push(value);},frequency:{},connect(){},start(){},stop(){}};}
    resume(){return Promise.resolve();}
  }
  const upgrades=['air','rapid','magnet','shield'].map(id=>{const n=node('upgrade-'+id);n.dataset.upgrade=id;return n;});
  const document={hidden:false,getElementById:node,querySelectorAll:selector=>selector==='[data-upgrade]'?upgrades:touch,
    addEventListener(type,fn){handlers.set('document:'+type,fn);}};
  const window={AudioContext:noAudio?undefined:AudioContext,
    addEventListener(type,fn){handlers.set('window:'+type,fn);}};
  const store=new Map();
  const sandbox={document,window,console,localStorage:{getItem(k){if(blockedStorage)throw Error('disabled');return store.get(k)??null;},setItem(k,v){if(blockedStorage)throw Error('disabled');store.set(k,v);}},
    requestAnimationFrame(fn){frames.push(fn);},setTimeout(){return 1;},clearTimeout(){}};
  vm.createContext(sandbox);
  vm.runInContext(source+'\nglobalThis.api={game,keys,STATE,Player,Platform,Enemy,Boss,Projectile,Coin,PowerBean,Audio,loop,startRun,setPaused,toggleHelp,toggleSound,syncUI,clearInput,chooseUpgrade,getPaused:()=>paused};',sandbox);
  return {...sandbox.api,document,nodes,handlers,tones,touch,store,upgrades};
}

test('each world starts, renders and schedules valid audio',()=>{
  const b=boot();b.startRun();
  for(let level=1;level<=4;level++){
    b.game.startLevel(level);
    for(let frame=0;frame<120;frame++){b.game.update();b.game.draw();}
    assert.equal(b.game.level,level);assert.ok(Number.isFinite(b.game.player.y));
  }
  assert.ok(b.tones.includes('triangle'));assert.ok(b.tones.includes('sawtooth'));
});
test('instructions are safe before starting and preserve an active world',()=>{
  const b=boot();b.toggleHelp();assert.equal(b.game.state,b.STATE.HELP);
  b.game.update();b.game.draw();b.toggleHelp();assert.equal(b.game.state,b.STATE.MENU);
  b.startRun();const pos=b.game.player.x;const tick=b.game.tick;
  b.toggleHelp();b.loop(0);b.loop(1000);assert.equal(b.game.player.x,pos);assert.equal(b.game.tick,tick);
  b.toggleHelp();assert.equal(b.game.state,b.STATE.PLAY);
  b.setPaused(true);b.toggleHelp();b.toggleHelp();assert.equal(b.getPaused(),true);
});
test('60 and 144 Hz displays simulate the same number of physics steps',()=>{
  const steps=[];
  for(const hz of [60,144]){
    const b=boot();let count=0;b.game.update=()=>count++;b.game.draw=()=>{};
    for(let i=0;i<=hz*5;i++)b.loop(i*1000/hz);
    steps.push(count);
  }
  assert.equal(steps[0],300);assert.equal(steps[1],300);
});
test('pause and tab hiding freeze time without catching up on return',()=>{
  const b=boot();b.startRun();b.loop(0);b.loop(17);
  b.keys.ArrowRight=true;b.handlers.get('window:blur')();assert.equal(b.getPaused(),true);assert.equal(b.keys.ArrowRight,false);
  const tick=b.game.tick;b.loop(1000);assert.equal(b.game.tick,tick);
  b.document.hidden=true;b.loop(2000);b.document.hidden=false;b.loop(9000);
  b.setPaused(false);b.loop(9017);assert.ok(b.game.tick<=tick+2);
});
test('buffered jump triggers on landing; edge grace does not increase jump speed',()=>{
  const b=boot(),floor={rect:{x:0,y:520,w:1000,h:40}};
  const pl=new b.Player(80,450);pl.vy=10;b.keys.ArrowUp=true;
  let jumped=false;
  for(let i=0;i<6;i++){pl.update([floor],i);if(pl.vy<0)jumped=true;}
  assert.equal(jumped,true);
  const edge=new b.Player(80,200);b.keys.ArrowUp=false;edge.onGround=true;edge.update([],0);
  b.keys.ArrowUp=true;edge.update([],1);assert.equal(edge.vy,-13.5+.52);
});
test('touch release and cancellation clear controls; shooting uses existing cooldown',()=>{
  const b=boot();b.startRun();const left=b.touch[0],fire=b.touch[2];
  const event={pointerId:4,preventDefault(){}};
  left.listeners.get('pointerdown')(event);assert.equal(b.keys.ArrowLeft,true);
  left.listeners.get('pointercancel')(event);assert.equal(b.keys.ArrowLeft,false);
  fire.listeners.get('pointerdown')({...event,pointerId:5});
  fire.listeners.get('pointerup')({...event,pointerId:5});
  assert.equal(b.game.player.bullets.length,1);assert.equal(b.game.player.shootCooldown,18);
});
test('three traveler drawings and all result screens render without errors',()=>{
  const b=boot();b.startRun();
  for(let i=0;i<3;i++){
    b.handlers.get('document:keydown')({code:'KeyZ',target:{closest(){return null;}},preventDefault(){}});
    b.game.draw();
  }
  for(const state of [b.STATE.GAME_OVER,b.STATE.WIN]){
    b.game.state=state;b.game.draw();b.syncUI();assert.equal(b.nodes.get('result-overlay').hidden,false);
  }
});
test('game remains playable when audio and local storage are unavailable',()=>{
  const b=boot({noAudio:true,blockedStorage:true});b.startRun();b.game.score=123;b.syncUI();b.game.update();b.game.draw();
  assert.equal(b.nodes.get('best-readout').textContent,'123');
});

test('level completion waits for one upgrade and grants exactly one rank',()=>{
  const b=boot();b.startRun();b.game.state=b.STATE.LEVEL_END;b.game.levelEndTimer=1;
  b.game.update();b.syncUI();assert.equal(b.game.state,b.STATE.UPGRADE);
  assert.equal(b.nodes.get('upgrade-overlay').hidden,false);
  const y=b.game.player.y;for(let i=0;i<10;i++)b.game.update();assert.equal(b.game.player.y,y);
  b.chooseUpgrade('air');assert.equal(b.game.level,2);assert.equal(b.game.upgrades.air,1);
  b.chooseUpgrade('air');assert.equal(b.game.upgrades.air,1);
});
test('air jump upgrade grants a bounded number of extra jumps',()=>{
  const b=boot();b.startRun();b.game.upgrades.air=1;
  const p=b.game.player;p.onGround=false;p.y=150;p.vy=4;
  b.keys.ArrowUp=true;p.update([],0);assert.ok(p.vy<0);assert.equal(p.airJumpsUsed,1);
  b.keys.ArrowUp=false;p.update([],1);b.keys.ArrowUp=true;const previous=p.vy;p.update([],2);
  assert.ok(p.vy>previous);assert.equal(p.airJumpsUsed,1);
});
test('rapid fire shortens cooldown, magnet attracts coins, shield blocks only collision damage',()=>{
  const b=boot();b.startRun();b.game.upgrades.rapid=1;b.keys.Space=true;
  for(let i=0;i<30;i++)b.game.player.update([],i);
  assert.equal(b.game.player.bullets.length,3);
  b.keys.Space=false;b.game.upgrades.magnet=1;
  const pl=b.game.player;pl.x=80;pl.y=450;pl.vx=0;pl.vy=0;
  b.game.enemies=[];b.game.coins=[new b.Coin(150,470)];const x=b.game.coins[0].x;
  b.game.update();assert.ok(b.game.coins[0].x<x);
  b.game.shields=1;pl.invincible=0;const hp=pl.hp;pl.hurt(b.game);
  assert.equal(pl.hp,hp);assert.equal(b.game.shields,0);
  b.game.shields=1;pl.invincible=0;const lives=b.game.lives;pl.die(b.game);
  assert.equal(b.game.lives,lives-1);
});
test('exploration reward pays once; upgrades reset only on a new run',()=>{
  const b=boot();b.startRun();b.game.totalCoins=b.game.challenge.target;
  b.game.updateChallenge();assert.equal(b.game.score,300);
  b.game.updateChallenge();assert.equal(b.game.score,300);
  b.game.upgrades.shield=2;b.game.startLevel(3);assert.equal(b.game.shields,2);
  b.game.state=b.STATE.UPGRADE;b.chooseUpgrade('shield');assert.equal(b.game.upgrades.shield,2);
  b.startRun();assert.equal(b.game.upgrades.shield,0);assert.equal(b.game.score,0);
});
