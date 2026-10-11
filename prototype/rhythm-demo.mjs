/** Demonstration uses only public inputs and ordinary physics, no state/HP injection. */
export class RhythmDemo {
  constructor(game){this.game=game;this.phase='三段普通攻击';this.start=game.time;this.sent=0;this.done=false;this.lastHit=0;}
  update(){
    const g=this.game,a=g.fighter('A'),b=g.fighter('B'),t=g.time-this.start;
    const approach=()=>{const dx=b.body.enemyX-a.body.enemyX;g.setInput('A',Math.abs(dx)>1?Math.sign(dx):0,0);};
    if(this.phase==='三段普通攻击'){
      if(this.sent<3&&t>this.sent*.34+.05){g.basic();this.sent++;}
      if(t>3.1&&b.body.state==='idle'){this.phase='上挑浮空';this.sent=0;}
    }else if(this.phase==='上挑浮空'){
      approach();if(Math.abs(b.body.enemyX-a.body.enemyX)<1.1&&!a.controller.action){g.clearInputs();g.press('A','launcher');this.phase='同键空中追击';this.sent=0;}
    }else if(this.phase==='同键空中追击'){
      // Wait for the target to fall into the SAME basic attack box. No high-air skill.
      if(this.sent===0&&b.body.state==='airborne'&&b.body.vy<0&&b.body.y<1.8&&!a.controller.action){g.basic();this.sent=1;}
      if(this.sent===1&&!a.controller.action&&b.body.state==='airborne'&&b.body.y<1.7){g.basic();this.sent=2;}
      if(b.body.state==='down'){this.phase='落地同键追击';this.sent=0;}
      if(b.body.state==='invulnerable'){this.phase='保护起身';this.done=true;}
    }else if(this.phase==='落地同键追击'){
      approach();if(!a.controller.action&&b.body.state==='down'&&Math.abs(b.body.enemyX-a.body.enemyX)<1.2){g.clearInputs();g.basic();this.sent++;}
      if(b.body.state==='invulnerable'){g.clearInputs();this.phase='保护起身';this.done=true;}
      else if(b.body.state==='idle'){g.clearInputs();this.phase='倒地追击未衔接，需复查';this.done=true;}
    }
  }
}
