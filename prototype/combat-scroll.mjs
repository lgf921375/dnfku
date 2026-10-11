/** Original V7 side-scrolling control adapter, preserving V6 combat rules. */
import {CombatDuel} from './combat-duel.mjs';
export class CombatScroll extends CombatDuel {
  constructor(options={}) {
    super(options);this.ai=options.ai??false;this.effects=[];this.aiNext=0;
    for(const f of this.fighters){f.lane=0;f.input={x:0,z:0};f.knockback=0;f.walk=0;}
    this.fighter('A').body.enemyX=0;this.fighter('B').body.enemyX=1.15;
  }
  setInput(id,x,z=0) {
    if(!Number.isFinite(x)||!Number.isFinite(z))throw new RangeError('invalid input');
    const length=Math.max(1,Math.hypot(x,z));this.fighter(id).input={x:x/length,z:z/length};
  }
  clearInputs(){for(const f of this.fighters)f.input={x:0,z:0};}
  attackBoxes(f){const other=this.fighters.find(t=>t!==f);if(Math.abs((f.lane??0)-(other.lane??0))>0.55)return [];return super.attackBoxes(f);}
  basic(id='A'){const t=this.fighters.find(f=>f.id!==id);return this.press(id,t.body.state==='down'?'groundSweep':'highSlash');}
  fixedTick(){
    const dt=this.settings.fixedStep;
    if(this.ai){const b=this.fighter('B'),a=this.fighter('A');const dx=a.body.enemyX-b.body.enemyX,dz=a.lane-b.lane;
      this.setInput('B',Math.abs(dx)>1?Math.sign(dx):0,Math.abs(dz)>0.25?Math.sign(dz):0);
      if(Math.abs(dx)<1.25&&Math.abs(dz)<0.4&&this.time>=this.aiNext&&!b.dead){b.facing=Math.sign(dx)||-1;this.basic('B');this.aiNext=this.time+0.7;}
    }
    for(const f of this.fighters){
      const frozen=f.body.hitstopRemaining>0||f.controller.attackerHitstopRemaining>0;
      if(!f.dead&&!frozen&&Math.abs(f.knockback)>0.02){f.body.enemyX+=f.knockback*dt;f.knockback*=Math.exp(-14*dt);}
      if(!f.dead&&!frozen&&!f.stun&&!f.controller.action&&f.body.state==='idle'){
        const {x,z}=f.input;this.move(f.id,x*3.6*dt);f.lane=Math.max(-1.2,Math.min(1.2,f.lane+z*1.9*dt));
        if(Math.hypot(x,z)>0.1)f.walk+=dt*10;
      }
      f.body.enemyX=Math.max(-3,Math.min(9,f.body.enemyX));
    }
    super.fixedTick();this.effects=this.effects.filter(e=>this.time-e.time<0.6);
  }
  resolve(intent){
    const before=this.events.length;super.resolve(intent);
    const e=this.events.slice(before).find(e=>e.type==='damage'||e.type==='guard');
    if(e){const t=intent.target;this.effects.push({...e,x:t.body.enemyX,y:t.body.y,lane:t.lane});
      if(e.type==='damage'&&!e.armored&&!e.protectedStand&&!t.dead)t.knockback=intent.f.facing*(intent.a.name==='launcher'?0.7:1.7);
    }
  }
}
