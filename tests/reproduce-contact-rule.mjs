import {CombatScroll} from '../prototype/combat-scroll.mjs';
import {CombatContact} from '../prototype/combat-contact.mjs';
const boxes=[{from:0,to:1,x0:0,x1:1.5,y0:0,y1:1.65}];
const samples=[];
for(const Class of [CombatScroll,CombatContact]){
  const g=new Class({settings:{hitstopSeconds:0},skills:{highSlash:{damage:14,hitstun:.18,boxes}}});
  const b=g.fighter('B').body;b.state='down';b.downRemaining=.9;g.press('A','highSlash');g.tick(.1);
  samples.push({model:Class.name,identicalBox:boxes,targetState:'down',hp:g.fighter('B').hp,damageEvents:g.events.filter(e=>e.type==='damage')});
}
console.log(JSON.stringify(samples,null,2));
if(samples[0].hp!==200||samples[1].hp!==186)process.exitCode=1;
