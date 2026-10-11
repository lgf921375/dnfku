/** Original isolated combat model. NOT upstream DNF. Values are test-only design choices. */
export const SETTINGS = Object.freeze({
  "gravity": 22,
  "launchVelocity": 10.5,
  "airTapVelocity": 5.5,
  "knockdownSeconds": 0.9,
  "comboWindowSeconds": 1.6,
  "airHitLimit": 4,
  "groundHitLimit": 3,
  "totalHitLimit": 7,
  "protectedInvulnerabilitySeconds": 0.6,
  "fixedStep": 0.008333333333333333,
  "minHitIntervalSeconds": 0.09
});
export const ATTACKS = Object.freeze({
  "launcher": {
    "x0": 0,
    "x1": 1.5,
    "y0": 0.05,
    "y1": 1.85,
    "allowed": [
      "idle",
      "airborne"
    ],
    "effect": "launch"
  },
  "airTap": {
    "x0": 0,
    "x1": 1.5,
    "y0": 0.65,
    "y1": 3.5,
    "allowed": [
      "airborne"
    ],
    "effect": "airtap"
  },
  "groundSweep": {
    "x0": 0,
    "x1": 1.5,
    "y0": 0,
    "y1": 0.4,
    "allowed": [
      "down"
    ],
    "effect": "ground"
  },
  "highSlash": {
    "x0": 0,
    "x1": 1.5,
    "y0": 0.6,
    "y1": 1.65,
    "allowed": [
      "idle",
      "airborne"
    ],
    "effect": "none"
  }
});
export class CombatArena {
  constructor(overrides = {}) {
    this.cfg = {...SETTINGS, ...overrides};
    this.time=0; this.accumulator=0; this.playerX=0; this.enemyX=0.8;
    this.state="idle"; this.y=0; this.vy=0; this.downRemaining=0; this.invulnerabilityRemaining=0;
    this.airHits=0; this.groundHits=0; this.totalHits=0; this.comboExpires=-Infinity; this.lastHitTime=-Infinity;
    this.events=[];
  }
  snapshot() {
    return {time:this.time,state:this.state,enemyX:this.enemyX,y:this.y,vy:this.vy,
      downRemaining:this.downRemaining,invulnerabilityRemaining:this.invulnerabilityRemaining,
      airHits:this.airHits,groundHits:this.groundHits,totalHits:this.totalHits};
  }
  resetCombo() { this.airHits=0; this.groundHits=0; this.totalHits=0; this.comboExpires=-Infinity; }
  record(type,detail) {
    const event={time:Number(this.time.toFixed(5)),type,...detail};
    this.events.push(event);return event;
  }
  overlap(a,b) {
    return a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  }
  enemyBox() {
    if (this.state==="down") return {x0:this.enemyX-0.54,x1:this.enemyX+0.54,y0:0,y1:0.32};
    return {x0:this.enemyX-0.34,x1:this.enemyX+0.34,y0:this.y,y1:this.y+1.8};
  }
  attackBox(def) {return {x0:this.playerX+def.x0,x1:this.playerX+def.x1,y0:def.y0,y1:def.y1};}
  forcedStand(reason) {
    this.state="invulnerable";this.y=0;this.vy=0;this.downRemaining=0;
    this.invulnerabilityRemaining=this.cfg.protectedInvulnerabilitySeconds;
    this.record("forced-stand",{reason,airHits:this.airHits,groundHits:this.groundHits,totalHits:this.totalHits});
    this.resetCombo();
  }
  hit(name) {
    const def=ATTACKS[name];
    if(!def) throw new Error("Unknown attack: "+name);
    if(this.state==="invulnerable") return this.record("blocked",{attack:name,reason:"protected-invulnerability"});
    if(!def.allowed.includes(this.state)) return this.record("blocked",{attack:name,reason:"invalid-target-state"});
    if(!this.overlap(this.attackBox(def),this.enemyBox())) return this.record("blocked",{attack:name,reason:"aabb-miss"});
    if(this.time-this.lastHitTime < this.cfg.minHitIntervalSeconds-1e-9) return this.record("blocked",{attack:name,reason:"hit-cadence"});
    if(this.time > this.comboExpires) this.resetCombo();
    this.totalHits++;this.lastHitTime=this.time;this.comboExpires=this.time+this.cfg.comboWindowSeconds;
    if(def.effect==="launch") {
      this.airHits++;this.state="airborne";this.y=Math.max(this.y,0.01);this.vy=this.cfg.launchVelocity;
    }else if(def.effect==="airtap") {
      this.airHits++;this.vy=this.cfg.airTapVelocity;
    }else if(def.effect==="ground") {
      this.groundHits++;this.downRemaining=this.cfg.knockdownSeconds;
    }else if(this.state==="airborne") {
      this.airHits++;
    }
    const event=this.record("hit",{attack:name,state:this.state});
    if(this.airHits>=this.cfg.airHitLimit || this.groundHits>=this.cfg.groundHitLimit || this.totalHits>=this.cfg.totalHitLimit) {
      this.forcedStand(this.airHits>=this.cfg.airHitLimit?"air-limit":this.groundHits>=this.cfg.groundHitLimit?"ground-limit":"total-limit");
    }
    return event;
  }
  fixedTick() {
    const dt=this.cfg.fixedStep;
    this.time+=dt;
    if(this.state==="airborne"){
      this.vy-=this.cfg.gravity*dt;
      this.y+=this.vy*dt;
      if(this.y<=0){
        this.y=0;this.vy=0;this.state="down";this.downRemaining=this.cfg.knockdownSeconds;
        this.record("landed",{downRemaining:this.downRemaining});
      }
    }else if(this.state==="down"){
      this.downRemaining=Math.max(0,this.downRemaining-dt);
      if(this.downRemaining<=0){this.state="idle";this.record("ordinary-stand",{});}
    }else if(this.state==="invulnerable"){
      this.invulnerabilityRemaining=Math.max(0,this.invulnerabilityRemaining-dt);
      if(this.invulnerabilityRemaining<=0){this.state="idle";this.record("protection-ended",{});}
    }
    if(this.state==="idle"&&this.time>this.comboExpires) this.resetCombo();
  }
  tick(seconds) {
    if(!Number.isFinite(seconds)||seconds<0||seconds>5) throw new RangeError("tick seconds must be 0..5");
    this.accumulator+=seconds;
    while(this.accumulator + 1e-10 >= this.cfg.fixedStep){
      this.accumulator-=this.cfg.fixedStep;
      if(this.accumulator < 0) this.accumulator=0;
      this.fixedTick();
    }
    return this.snapshot();
  }
}
