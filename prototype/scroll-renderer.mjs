/** Original articulated Canvas illustration/animation. No third-party game art. */
export function drawScroll(ctx,game,{width=960,height=540,debug=false}={}) {
  ctx.save();ctx.scale(width/960,height/540);
  const a=game.fighter('A'),camera=Math.max(0,Math.min(5,a.body.enemyX-1));
  const recent=game.effects.filter(e=>e.type==='damage'&&game.time-e.time<0.09);
  if(recent.length){const age=game.time-recent.at(-1).time;ctx.translate(Math.sin(age*230)*3,Math.cos(age*190)*2);}
  const gradient=ctx.createLinearGradient(0,0,0,540);gradient.addColorStop(0,'#111c2b');gradient.addColorStop(.65,'#3e3940');gradient.addColorStop(1,'#171e2a');ctx.fillStyle=gradient;ctx.fillRect(0,0,960,540);
  // Perspective hall, broken arches and distant mountain ridges.
  const polygon=(points,fill,stroke)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}};
  polygon([[0,230],[70,180],[130,208],[240,125],[340,212],[440,150],[530,240],[680,163],[780,220],[920,136],[960,198],[960,350],[0,350]],'#202d3c');
  for(let i=-1;i<6;i++){const x=i*220-camera*18;ctx.fillStyle='#192431';ctx.fillRect(x,70,30,270);ctx.fillRect(x+166,70,30,270);ctx.strokeStyle='#293747';ctx.lineWidth=22;ctx.beginPath();ctx.arc(x+98,185,82,Math.PI,0);ctx.stroke();ctx.lineWidth=1;ctx.fillStyle='#34404d';ctx.fillRect(x,80,30,7);ctx.fillRect(x+166,80,30,7);}
  ctx.fillStyle='#55505a';ctx.fillRect(0,333,960,5);
  polygon([[0,338],[960,338],[960,540],[0,540]],'#2c3039');
  ctx.strokeStyle='#44464d';ctx.lineWidth=1;
  for(let y=346;y<540;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}
  for(let i=-3;i<12;i++){ctx.beginPath();ctx.moveTo(i*140-camera*25,338);ctx.lineTo(i*210-180-camera*35,540);ctx.stroke();}
  for(const x of [120,825]){const g=ctx.createRadialGradient(x,264,0,x,264,100);g.addColorStop(0,'#ffae4244');g.addColorStop(1,'#ffae4200');ctx.fillStyle=g;ctx.fillRect(x-100,164,200,200);ctx.fillStyle='#685448';ctx.fillRect(x-4,275,8,46);polygon([[x-10,276],[x-4,255],[x,263],[x+7,248],[x+11,277]],'#ffba65');}
  const screen=(f)=>({x:300+(f.body.enemyX-camera)*100,y:408+f.lane*32-f.body.y*54});
  for(const f of [...game.fighters].sort((a,b)=>a.lane-b.lane)){
    const p=screen(f);ctx.save();ctx.translate(p.x,408+f.lane*32);ctx.scale(1,.3);ctx.beginPath();ctx.ellipse(0,0,29,15,0,0,Math.PI*2);ctx.fillStyle='#0007';ctx.fill();ctx.restore();
    const action=f.controller.action;const phase=action?.phase;const ratio=action?Math.min(1,action.elapsed/f.controller.frames[action.name][phase]):0;
    const moving=Math.hypot(f.input.x,f.input.z)>0.1&&!action&&!f.stun&&f.body.state==='idle';
    const walk=moving?Math.sin(f.walk)*14:0;
    let lean=moving?0.08:Math.sin(f.controller.actionTime*3)*0.025;
    let arm=0.65,sword=0.45;
    if(action){
      if(phase==='startup'){arm=-2.2;sword=-2.7;lean=-.13*ratio;}
      if(phase==='active'){arm=action.name==='launcher'?-1.8:(action.name==='groundSweep'?0.9:0.15);sword=arm+0.2;lean=.18;}
      if(phase==='recovery'){arm=0.25-ratio*.6;sword=arm-.2;lean=.16*(1-ratio);}
    }
    if(f.guard){arm=-1.2;sword=-1.65;}
    if(f.stun>0){lean=-.32;arm=-1.3;sword=-1.4;}
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(f.facing,1);
    if(f.dead||f.body.state==='down'){ctx.translate(0,-16);ctx.rotate(-Math.PI/2);}
    else if(f.body.state==='airborne'){ctx.rotate(-.28);lean=-.15;}
    ctx.rotate(lean);const teal=f.id==='A';const base=teal?'#4b7e8c':'#965852',light=teal?'#8ac5c9':'#daa079',cloth=teal?'#253949':'#492d36';
    const flash=game.effects.some(e=>e.type==='damage'&&e.target===f.id&&game.time-e.time<.065);
    const poly=(pts,c)=>polygon(pts,flash?'#fff7d8':c,'#111b29');
    ctx.lineWidth=2;
    // Cloak, segmented boots and armor establish a full human silhouette.
    poly([[-17,-113],[-31,-82],[-27,-33],[-10,-48],[5,-40],[8,-102]],cloth);
    const leg=(x,k)=>{poly([[x-7,-49],[x+8,-49],[x+8+k*.4,-23],[x+3+k,-7],[x-8+k,-7],[x-8+k*.4,-23]],'#263342');poly([[x-8+k,-15],[x+4+k,-15],[x+12+k,-3],[x+13+k,1],[x-10+k,1]],'#182531');ctx.strokeStyle=light;ctx.beginPath();ctx.moveTo(x-6+k*.4,-28);ctx.lineTo(x+6+k*.4,-27);ctx.stroke();};
    leg(-11,-walk);leg(10,walk);
    poly([[-17,-105],[12,-105],[22,-77],[12,-49],[-13,-49],[-23,-77]],base);
    poly([[-13,-98],[9,-98],[13,-76],[-1,-62],[-16,-79]],light);
    poly([[-17,-56],[15,-56],[16,-47],[-16,-47]],'#bd9870');
    poly([[-25,-106],[-10,-110],[-4,-95],[-24,-90],[-30,-98]],'#617484');
    // Rear arm and glove.
    poly([[-20,-93],[-25,-76],[-18,-64],[-10,-70],[-17,-80],[-11,-96]],'#33495b');
    ctx.fillStyle='#d0aa8c';ctx.beginPath();ctx.arc(-13,-67,5,0,7);ctx.fill();
    // Head, face and original swept hair.
    poly([[-9,-123],[10,-122],[12,-110],[4,-103],[-8,-108]],'#d5ae90');
    poly([[-14,-124],[-5,-137],[9,-134],[20,-124],[8,-120],[-1,-126],[-11,-114]],teal?'#d7d9c7':'#372c37');
    ctx.strokeStyle='#171d2b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(5,-116);ctx.lineTo(10,-116);ctx.stroke();
    // Sword arm rotates around shoulder, with blade drawn in the same transform.
    ctx.save();ctx.translate(14,-94);ctx.rotate(arm);
    poly([[-6,-7],[10,-7],[25,0],[26,9],[10,10],[-6,4]],base);
    poly([[21,-3],[37,-2],[40,8],[24,10]],'#9c806d');ctx.translate(37,4);ctx.rotate(sword-arm);
    poly([[-5,-7],[8,-7],[8,7],[-5,7]],'#544333');poly([[3,-11],[10,-11],[10,12],[3,12]],'#c7a267');
    poly([[11,-5],[64,-5],[80,0],[64,5],[11,5]],'#c3d4d9');poly([[13,-4],[64,-4],[77,0],[14,0]],'#f2f1dd');ctx.restore();
    if(f.body.state==='invulnerable'){ctx.strokeStyle='#9bdbffa0';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-68,40,77,0,0,7);ctx.stroke();}
    if(f.controller.armored){ctx.strokeStyle='#f9c777';ctx.beginPath();ctx.arc(0,-78,35,0,7);ctx.stroke();}
    ctx.restore();
    // Blade arcs exist only during the actual attack active phase.
    if(phase==='active'){
      ctx.save();ctx.translate(p.x,p.y-70);ctx.scale(f.facing,1);ctx.rotate(action.name==='launcher'?-.6:action.name==='groundSweep'?.5:0);
      ctx.strokeStyle=teal?'#a1f5e6cc':'#ffd5accc';ctx.lineWidth=12;ctx.beginPath();ctx.ellipse(20,0,84,65,0,-1.25,1.2);ctx.stroke();ctx.strokeStyle='#f5fff5';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(20,0,90,69,0,-1.2,1.2);ctx.stroke();ctx.restore();
    }
    if(debug){ctx.strokeStyle='#69ff7a';for(const b of game.attackBoxes(f)){ctx.strokeRect(300+(b.x0-camera)*100,408+f.lane*32-b.y1*54,(b.x1-b.x0)*100,(b.y1-b.y0)*54);}}
  }
  for(const e of game.effects){const age=game.time-e.time,x=300+(e.x-camera)*100,y=408+e.lane*32-e.y*54-60;
    if(age<.16){ctx.strokeStyle=e.type==='guard'?'#8dccff':'#ffe4a7';ctx.lineWidth=3;for(let i=0;i<9;i++){const r=i*2.4,dist=12+age*220;ctx.beginPath();ctx.moveTo(x+Math.cos(r)*dist*.3,y+Math.sin(r)*dist*.3);ctx.lineTo(x+Math.cos(r)*dist,y+Math.sin(r)*dist);ctx.stroke();}}
    ctx.globalAlpha=Math.max(0,1-age/.6);ctx.fillStyle=e.type==='guard'?'#b6ddff':'#ffe5af';ctx.font='bold 26px sans-serif';ctx.fillText(e.type==='guard'?'格挡':String(e.damage),x-10,y-40-age*80);ctx.globalAlpha=1;
  }
  ctx.fillStyle='#e1cda3';ctx.font='12px sans-serif';ctx.fillText('原创横版战斗原型 · 非 DNF 官方资源',24,518);ctx.restore();
}
