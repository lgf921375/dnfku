/** V8 unified basic attack: actual active boxes determine contact, not target labels. */
import {CombatScroll} from './combat-scroll.mjs';
import {DUEL_SKILLS} from './combat-duel.mjs';
export class CombatContact extends CombatScroll {
  constructor(options={}) {
    super({...options,geometricHits:true,skills:{...options.skills,
      highSlash:{...DUEL_SKILLS.highSlash,...options.skills?.highSlash,
        boxes:options.skills?.highSlash?.boxes??[{from:0,to:1,x0:0,x1:1.5,y0:0,y1:1.65}]}}});
  }
  basic(id='A'){return this.press(id,'highSlash');}
}
