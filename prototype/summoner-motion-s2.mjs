/** S2: body landmarks estimated from public852x480/30fps empty-swing frames.
 * The elevated ankles are VISIBLE POSE, not measured jump physics or victim lift.
 * Anchor x removes the clip's unobserved movement input. No intrinsic advance inferred.
 */
import {SummonerMotion,SUMMONER_KEYS,SUMMONER_REFERENCE,summonerStaff} from './summoner-motion.mjs';
export const S2_CALIBRATION=Object.freeze({
  url:SUMMONER_REFERENCE.url,sourceResolution:[852,480],fps:30,
  crop:{x:170,y:252,width:254,height:176},floorPixelY:104,
  unitsPerPixel:90/82,manualUncertaintyPixels:3,
  scope:'Estimated 2D body landmarks, selected frames only; exact collision/input/physics NOT COVERED'
});
// Pixels in the analysis crop. These are original factual landmark estimates;
// no video frames or third-party images are bundled. Repeated pose at frame29.
export const S2_PIXEL_SAMPLES=Object.freeze([
  {frame:11,anchorX:142,hip:[141,58],shoulder:[143,46],head:[143,32],hand:[159,30],backKnee:[119,65],backFoot:[105,68],frontKnee:[155,68],frontFoot:[171,74],freeHand:[140,63]},
  {frame:12,anchorX:142,hip:[141,58],shoulder:[143,46],head:[143,32],hand:[159,30],backKnee:[119,65],backFoot:[105,68],frontKnee:[155,68],frontFoot:[171,74],freeHand:[140,63]},
  {frame:22,anchorX:151,hip:[151,64],shoulder:[159,49],head:[167,40],hand:[156,78],backKnee:[143,72],backFoot:[138,80],frontKnee:[166,62],frontFoot:[176,62],freeHand:[149,47]},
  {frame:24,anchorX:151,hip:[151,63],shoulder:[160,54],head:[167,43],hand:[143,59],backKnee:[145,66],backFoot:[141,74],frontKnee:[166,61],frontFoot:[176,65],freeHand:[163,57]},
  {frame:29,anchorX:151,hip:[151,63],shoulder:[160,54],head:[167,43],hand:[143,59],backKnee:[145,66],backFoot:[141,74],frontKnee:[166,61],frontFoot:[176,65],freeHand:[163,57]}
]);
const byFrame=new Map(S2_PIXEL_SAMPLES.map(p=>[p.frame,p]));
export const S2_KEYS=Object.freeze(SUMMONER_KEYS.map(k=>{
  const raw=byFrame.get(k.frame);if(!raw)return {...k};
  const p={...k};for(const name of ['hip','shoulder','head','hand','backKnee','backFoot','frontKnee','frontFoot','freeHand'])
    p[name]=[(raw[name][0]-raw.anchorX)*S2_CALIBRATION.unitsPerPixel,(S2_CALIBRATION.floorPixelY-raw[name][1])*S2_CALIBRATION.unitsPerPixel];
  return p;
}));
function mixS2(a,b,t){
 const p={};for(const k of Object.keys(a)){
  if(Array.isArray(a[k]))p[k]=a[k].map((v,i)=>v+(b[k][i]-v)*t);
  else if(k==='staffAngle')p[k]=a[k]+Math.atan2(Math.sin(b[k]-a[k]),Math.cos(b[k]-a[k]))*t;
  else p[k]=a[k]+(b[k]-a[k])*t;
 }return p;
}
export function summonerPoseS2(frame){
 if(!Number.isFinite(frame))throw new RangeError('invalid S2 motion frame');
 const f=Math.max(0,Math.min(30,Math.floor(frame+1e-8)));let a=S2_KEYS[0],b=S2_KEYS.at(-1);
 for(let i=1;i<S2_KEYS.length;i++){b=S2_KEYS[i];if(f<=b.frame)break;a=b;}
 return mixS2(a,b,b.frame===a.frame?0:(f-a.frame)/(b.frame-a.frame));
}
export class SummonerMotionS2 extends SummonerMotion {
 fixedTick(){const old=this.returnPose;super.fixedTick();
  if(this.returnPose&&this.returnPose!==old)this.returnPose.pose=summonerPoseS2(SUMMONER_REFERENCE.stageEnds[this.lastStage]);
 }
 pose(){if(this.preview!==null)return summonerPoseS2(this.preview);
  if(this.action)return summonerPoseS2(this.action.frame);
  if(this.returnPose){const t=Math.min(1,(this.time-this.returnPose.time)/.12);return mixS2(this.returnPose.pose,S2_KEYS.at(-1),t*t*(3-2*t));}
  return {...S2_KEYS.at(-1)};
 }
 staff(){return summonerStaff(this.pose(),{x:this.x,facing:this.facing});}
 snapshot(){return {...super.snapshot(),poseModel:'S2 body calibration; elevated feet are animation landmarks, no air physics'};}
}
