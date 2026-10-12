/** Original Canvas bone poses and illustrated silhouette; no imported art. */
const feedbackMix=(a,b,t)=>a+(b-a)*t;
const feedbackSmooth=t=>t*t*(3-2*t);
export function feedbackPose(f,{risingFinisher=false}={}){
  const a=f.controller.action;
  let p={lean:-.02,crouch:0,arm:.65,blade:.3,step:0,backArm:1.4};
  if(a){
    const r=Math.min(1,a.elapsed/f.controller.frames[a.name][a.phase]);
    const cut=a.cut??0,launch=a.name==='launcher';
    const ready=launch?{lean:.2,crouch:16,arm:1.1,blade:1.1,step:13,backArm:2.2}:
      [{lean:-.2,crouch:8,arm:-2,blade:-2.7,step:14,backArm:1.8},
       {lean:.18,crouch:12,arm:.85,blade:.8,step:17,backArm:2.1},
       risingFinisher?{lean:.2,crouch:20,arm:1.1,blade:1.1,step:20,backArm:2.2}:{lean:-.18,crouch:15,arm:-1.8,blade:-1.9,step:20,backArm:1.5}][cut];
    const finish=launch?{lean:-.12,crouch:-3,arm:-1.05,blade:-1.32,step:18,backArm:1.7}:
      [{lean:.22,crouch:12,arm:.1,blade:.57,step:19,backArm:2.2},
       {lean:-.08,crouch:3,arm:-.6,blade:-1.14,step:20,backArm:2},
       risingFinisher?{lean:-.12,crouch:-3,arm:-1.05,blade:-1.32,step:25,backArm:1.7}:{lean:.32,crouch:19,arm:.25,blade:.87,step:25,backArm:2.4}][cut];
    let start=p,end=ready,t=feedbackSmooth(r);
    if(a.phase==='active'){start=ready;end=finish;t=Math.sin(r*Math.PI/2);}
    if(a.phase==='recovery'){start=finish;end=p;t=feedbackSmooth(r);}
    p=Object.fromEntries(Object.keys(p).map(k=>[k,feedbackMix(start[k],end[k],t)]));
  }else if(Math.hypot(f.input.x,f.input.z)>.1&&!f.stun){p.step=Math.sin(f.walk)*17;p.crouch=Math.abs(Math.sin(f.walk))*3;p.lean=.10;}
  if(f.guard){p.arm=-.8;p.blade=-1.7;p.crouch=9;p.lean=-.08;}
  const r=f.reaction;
  if(r){
    const t=Math.min(1,r.age/r.duration),direction=r.direction*f.facing;
    const keys={light:{lean:.23,crouch:5,arm:-1.0,blade:-1.7,step:5,backArm:2.2},
      reverse:{lean:.13,crouch:14,arm:.1,blade:.4,step:13,backArm:.3},
      heavy:{lean:.58,crouch:18,arm:-2.2,blade:-2.7,step:26,backArm:2.7},
      launch:{lean:.32,crouch:-5,arm:-2.6,blade:-2.9,step:18,backArm:2.9},
      air:{lean:.4,crouch:12,arm:-2,blade:-2.6,step:20,backArm:2.5},
      ground:{lean:.1,crouch:6,arm:-2.2,blade:-2.7,step:8,backArm:2.2}};
    const peak={...keys[r.kind]};peak.lean*=direction;
    const response=1-feedbackSmooth(Math.max(0,(t-.28)/.72));
    for(const k of Object.keys(p)){const hit=feedbackMix(r.from?.[k]??p[k],peak[k],Math.min(1,.7+t*3));p[k]=feedbackMix(p[k],hit,response);}
  }
  if(f.recovery?.kind==='protection'&&!a){p.crouch=10*(1-f.recovery.age/f.recovery.duration);p.arm=-.7;p.blade=-1.6;}
  return p;
}
export function feedbackWeapon(f,p=feedbackPose(f)){
  const ex=12+Math.cos(p.arm)*26,ey=-120+Math.sin(p.arm)*26;
  const hx=ex+Math.cos(p.arm+.15)*24,hy=ey+Math.sin(p.arm+.15)*24;
  const transform=(x,y)=>({x:f.body.enemyX+f.facing*(x*Math.cos(p.lean)-(y+65)*Math.sin(p.lean))/90,y:f.body.y-(-65+p.crouch+x*Math.sin(p.lean)+(y+65)*Math.cos(p.lean))/90});
  return {hand:transform(hx+5*Math.cos(p.blade),hy+5*Math.sin(p.blade)),tip:transform(hx+110*Math.cos(p.blade),hy+110*Math.sin(p.blade))};
}
export function drawFeedback(ctx,game,{debug=false,width=960,height=540,pose=feedbackPose,weapon=feedbackWeapon,risingFinisher=false}={}){
  ctx.save();ctx.scale(width/960,height/540);
  const camera=Math.max(-.2,Math.min(5,game.fighter('A').body.enemyX-.5));
  const ground=f=>405+f.lane*34;
  const sx=x=>275+(x-camera)*90;
  const effect=game.effects.filter(e=>e.type==='damage'&&game.time-e.time<.10).at(-1);
  if(effect){const t=game.time-effect.time,amp=effect.cut===2?3.6:1.6;ctx.translate(Math.sin(t*230)*amp,Math.cos(t*190)*amp*.45);}
  const bg=ctx.createLinearGradient(0,0,0,540);bg.addColorStop(0,'#0c1220');bg.addColorStop(.7,'#343844');bg.addColorStop(1,'#1d2431');ctx.fillStyle=bg;ctx.fillRect(0,0,960,540);
  ctx.fillStyle='#141c2b';ctx.fillRect(0,200,960,146);
  for(let i=-1;i<7;i++){const x=i*190-camera*14;ctx.fillStyle='#202938';ctx.fillRect(x,52,24,292);ctx.fillRect(x+128,52,24,292);ctx.strokeStyle='#2f3a49';ctx.lineWidth=12;ctx.beginPath();ctx.arc(x+76,166,66,Math.PI,0);ctx.stroke();ctx.fillStyle='#394451';ctx.fillRect(x-6,328,36,15);ctx.fillRect(x+122,328,36,15);}
  ctx.fillStyle='#48505a';ctx.fillRect(0,346,960,3);ctx.fillStyle='#282e39';ctx.fillRect(0,349,960,191);
  ctx.lineWidth=1;ctx.strokeStyle='#50515b66';for(let y=363;y<540;y+=35){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}for(let i=-3;i<12;i++){ctx.beginPath();ctx.moveTo(i*125-camera*18,349);ctx.lineTo(i*180-150-camera*28,540);ctx.stroke();}
  for(const x of [88,865]){const g=ctx.createRadialGradient(x,282,0,x,282,110);g.addColorStop(0,'#ffba6340');g.addColorStop(1,'#ffba6300');ctx.fillStyle=g;ctx.fillRect(x-110,172,220,220);ctx.fillStyle='#77604a';ctx.fillRect(x-5,271,10,63);ctx.fillStyle='#ffe0a4';ctx.beginPath();ctx.ellipse(x,264,5,13,0,0,7);ctx.fill();}
  const polygon=(points,color,stroke='#0c1220',line=2)=>{ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=color;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=line;ctx.stroke();}};
  const limb=(from,to,w,color)=>{ctx.strokeStyle='#0b1220';ctx.lineCap='round';ctx.lineWidth=w+3;ctx.beginPath();ctx.moveTo(...from);ctx.lineTo(...to);ctx.stroke();ctx.strokeStyle=color;ctx.lineWidth=w;ctx.stroke();};
  const blade=(hx,hy,angle,color,alpha=1)=>{ctx.save();ctx.globalAlpha*=alpha;ctx.translate(hx,hy);ctx.rotate(angle);polygon([[-15,-4],[0,-4],[0,4],[-15,4]],'#533e36');polygon([[-2,-11],[5,-12],[5,12],[-2,10]],'#d9b37a');polygon([[5,-5],[96,-5],[110,0],[96,5],[5,5]],color);polygon([[7,-4],[94,-4],[108,0],[7,0]],'#f5f3dd',null);ctx.restore();};
  for(const f of [...game.fighters].sort((a,b)=>a.lane-b.lane)){
    const x=sx(f.body.enemyX),floor=ground(f),y=floor-f.body.y*90,p=pose(f),a=f.controller.action;
    ctx.save();ctx.fillStyle='#050b1590';ctx.beginPath();ctx.ellipse(x,floor+2,32/(1+f.body.y*.1),7,0,0,7);ctx.fill();ctx.restore();
    ctx.save();ctx.translate(x,y);ctx.scale(f.facing,1);
    const down=f.dead||f.body.state==='down',air=f.body.state==='airborne';
    if(down){
      const land=f.recovery?.kind==='landing'?1-feedbackSmooth(f.recovery.age/f.recovery.duration):0;
      const flinch=f.reaction?.kind==='ground'?(1-f.reaction.age/f.reaction.duration):0;
      p.arm=-2.5+flinch*.5;p.blade=-Math.PI/2;p.lean=0;p.crouch=0;
      ctx.translate(-47,-19);ctx.rotate(Math.PI/2-land*.3);ctx.scale(.56,.56*(1-land*.18));
    }
    if(air){
      const rising=Math.max(0,Math.min(1,f.body.vy/6));
      const tilt=feedbackMix(-1.15,-.45,rising);
      ctx.translate(-20,-65);ctx.rotate(tilt);ctx.translate(0,65);
    }
    if(f.recovery?.kind==='rise'&&!a){const t=feedbackSmooth(f.recovery.age/f.recovery.duration);ctx.translate(-47*(1-t),-19*(1-t));ctx.rotate((1-t)*Math.PI/2);ctx.scale(feedbackMix(.56,1,t),feedbackMix(.56,1,t));p.crouch=15*(1-t);}
    const bodyAngle=p.lean;
    const teal=f.id==='A',armor=teal?'#306b83':'#9a454c',highlight=teal?'#7ddbd9':'#e79886',cloth=teal?'#143149':'#482635',skin='#edbc99';
    const flash=game.effects.some(e=>e.type==='damage'&&e.target===f.id&&game.time-e.time<.05);
    if(flash){ctx.shadowColor='#fff3bd';ctx.shadowBlur=18;}
    const hip=[0,-65+p.crouch];
    const kneeBack=[-15-p.step*.45,-30+p.crouch*.3],footBack=[-22-p.step*.5,-4];
    const kneeFront=[15+p.step*.42,-29+p.crouch*.4],footFront=[23+p.step*.48,-3];
    limb(hip,kneeBack,15,'#273449');limb(kneeBack,footBack,13,'#172536');
    polygon([[footBack[0]-7,-15],[footBack[0]+6,-15],[footBack[0]+14,-3],[footBack[0]+12,0],[footBack[0]-11,0]],'#1c2c3c');
    ctx.save();ctx.translate(...hip);ctx.rotate(bodyAngle);ctx.translate(0,65);
    // Long asymmetric coat, curved torso, breast plate and scarf.
    const sway=Math.sin(f.poseTime*5)*4;
    ctx.beginPath();ctx.moveTo(-15,-129);ctx.bezierCurveTo(-37,-104,-37+sway,-60,-52+sway,-39);ctx.quadraticCurveTo(-26,-42,-7,-78);ctx.lineTo(8,-117);ctx.closePath();ctx.fillStyle=cloth;ctx.fill();ctx.strokeStyle='#0e1726';ctx.lineWidth=2;ctx.stroke();
    const be=[-15+Math.cos(p.backArm)*28,-119+Math.sin(p.backArm)*28],bh=[be[0]+Math.cos(p.backArm-.6)*23,be[1]+Math.sin(p.backArm-.6)*23];limb([-15,-119],be,14,armor);limb(be,bh,11,skin);
    ctx.beginPath();ctx.moveTo(-17,-128);ctx.quadraticCurveTo(0,-139,19,-122);ctx.lineTo(12,-94);ctx.quadraticCurveTo(9,-80,-2,-71);ctx.lineTo(-19,-83);ctx.quadraticCurveTo(-26,-100,-17,-128);ctx.fillStyle=armor;ctx.fill();ctx.strokeStyle='#0b1525';ctx.stroke();
    polygon([[-14,-122],[8,-126],[14,-110],[4,-98],[-15,-104]],highlight);
    polygon([[-19,-85],[13,-87],[14,-76],[-20,-74]],'#392e30');polygon([[-3,-86],[5,-86],[5,-75],[-3,-75]],'#e3bd75');
    // Neck and profile with ear, cheek, chin and swept hair.
    limb([-1,-134],[1,-126],10,skin);
    ctx.beginPath();ctx.moveTo(-9,-151);ctx.quadraticCurveTo(2,-163,14,-151);ctx.lineTo(14,-140);ctx.lineTo(20,-135);ctx.lineTo(13,-132);ctx.quadraticCurveTo(11,-122,1,-126);ctx.lineTo(-10,-132);ctx.closePath();ctx.fillStyle=skin;ctx.fill();ctx.strokeStyle='#202332';ctx.stroke();
    polygon([[-15,-146],[-18,-157],[-9,-166],[2,-163],[13,-167],[19,-157],[17,-148],[6,-154],[-1,-144],[-9,-148],[-12,-135]],teal?'#d7e4dc':'#383040');
    ctx.strokeStyle='#30232d';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(8,-140);ctx.lineTo(14,-141);ctx.stroke();
    polygon([[-12,-127],[11,-126],[12,-117],[-8,-116]],'#d8b376');
    polygon([[-11,-125],[-38,-131],[-53-sway,-119],[-24,-118]],teal?'#68c5cb':'#d67c69');
    // Elbow/hand are animated; blade and trails use this identical transform.
    const shoulder=[12,-120],elbow=[12+Math.cos(p.arm)*26,-120+Math.sin(p.arm)*26],hand=[elbow[0]+Math.cos(p.arm+.15)*24,elbow[1]+Math.sin(p.arm+.15)*24];
    limb(shoulder,elbow,14,armor);limb(elbow,hand,10,skin);polygon([[9,-129],[22,-128],[29,-114],[9,-110]],highlight);
    ctx.fillStyle='#3c3841';ctx.beginPath();ctx.arc(...hand,7,0,7);ctx.fill();
    if(a?.phase==='active'){
      for(let i=3;i>=1;i--)blade(...hand,p.blade-(a.name==='launcher'||a.cut===1||(risingFinisher&&a.cut===2)?-1:1)*i*.17,highlight,.09);
      ctx.save();ctx.translate(...hand);ctx.strokeStyle=highlight+'99';ctx.lineWidth=8;ctx.beginPath();ctx.arc(0,0,94,p.blade-.55,p.blade+.12);ctx.stroke();ctx.strokeStyle='#f5fff4cc';ctx.lineWidth=2;ctx.stroke();ctx.restore();
    }
    blade(...hand,p.blade,flash?'#fff5bf':'#abc5d2');ctx.restore();
    limb(hip,kneeFront,16,'#30435a');limb(kneeFront,footFront,14,'#23364a');polygon([[footFront[0]-8,-16],[footFront[0]+6,-16],[footFront[0]+17,-5],[footFront[0]+17,0],[footFront[0]-10,0]],'#192b3e');
    polygon([[kneeFront[0]-7,kneeFront[1]-6],[kneeFront[0]+7,kneeFront[1]-6],[kneeFront[0]+6,kneeFront[1]+8],[kneeFront[0]-6,kneeFront[1]+8]],highlight);
    if(f.body.state==='invulnerable'){ctx.strokeStyle='#8ce2ffb0';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-80,41,88,0,0,7);ctx.stroke();}
    ctx.restore();
    if(debug&&a?.phase==='active'){const w=weapon(f);ctx.strokeStyle='#69ffd7';ctx.lineWidth=10;ctx.globalAlpha=.4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(sx(w.hand.x),floor-w.hand.y*90);ctx.lineTo(sx(w.tip.x),floor-w.tip.y*90);ctx.stroke();ctx.globalAlpha=1;}
    if(debug){const b=f.body.enemyBox();ctx.strokeStyle='#ffd18b';ctx.lineWidth=1.5;ctx.strokeRect(sx(b.x0),floor-b.y1*90,(b.x1-b.x0)*90,(b.y1-b.y0)*90);ctx.fillStyle='#ffd18b';ctx.font='11px sans-serif';ctx.fillText('受击盒',sx(b.x0),floor-b.y1*90-5);for(const box of game.attackBoxes(f)){ctx.fillStyle='#69ffd728';ctx.strokeStyle='#69ffd7';ctx.fillRect(sx(box.x0),floor-box.y1*90,(box.x1-box.x0)*90,(box.y1-box.y0)*90);ctx.strokeRect(sx(box.x0),floor-box.y1*90,(box.x1-box.x0)*90,(box.y1-box.y0)*90);}}
  }
  for(const e of game.effects){const age=game.time-e.time,x=sx(e.x),floor=405+e.lane*34,y=e.impactY!==undefined?floor-e.impactY*90:floor-e.y*90-(e.type==='landing'?0:55);
    if(e.type==='landing'){ctx.globalAlpha=Math.max(0,1-age/.18);ctx.strokeStyle='#c9c0a9';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(x,y,20+age*140,3+age*8,0,0,7);ctx.stroke();ctx.globalAlpha=1;continue;}
    if(age<.18){ctx.save();ctx.translate(x,y);ctx.globalCompositeOperation='screen';const g=ctx.createRadialGradient(0,0,0,0,0,38);g.addColorStop(0,'#fff4ca');g.addColorStop(.2,'#ffd679');g.addColorStop(1,'#ffa54000');ctx.fillStyle=g;ctx.globalAlpha=1-age/.18;ctx.fillRect(-38,-38,76,76);ctx.strokeStyle=e.type==='guard'?'#84d9ff':e.weight===3?'#ffb66b':'#fff3cb';for(let i=0;i<12;i++){const angle=i*2.4,len=(e.cut===2?55:35)*(1+age*4);ctx.lineWidth=i%2?1:3;ctx.beginPath();ctx.moveTo(Math.cos(angle)*8,Math.sin(angle)*8);ctx.lineTo(Math.cos(angle)*len,Math.sin(angle)*len);ctx.stroke();}ctx.restore();}
    if(e.type==='damage'&&e.weight===3&&age<.22){ctx.save();ctx.translate(x,y);ctx.rotate((e.direction??1)*-.55);ctx.strokeStyle='#ffde99';ctx.globalAlpha=(1-age/.22)*.8;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-16-age*80,0);ctx.lineTo(24+age*220,0);ctx.stroke();ctx.restore();}
    ctx.globalAlpha=Math.max(0,1-age/.55);ctx.fillStyle='#ffe8b2';ctx.font='italic bold 25px sans-serif';ctx.fillText(e.type==='guard'?'BLOCK':String(e.damage),x-12,y-48-age*55);ctx.globalAlpha=1;
  }
  ctx.restore();
}

