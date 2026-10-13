/** Deterministic original wood/tap synthesis. Contains no DNF sound samples. */
export function summonerImpactSamples(stage,sampleRate=48000){
  if(![0,1,2].includes(stage)||!Number.isFinite(sampleRate)||sampleRate<8000)throw new RangeError('invalid impact sound');
  const length=Math.ceil(sampleRate*[.07,.08,.11][stage]),samples=new Float32Array(length);
  let seed=0x1234+stage*177;const frequency=[220,185,135][stage];
  for(let i=0;i<length;i++){const t=i/sampleRate;seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const noise=(seed/4294967296)*2-1,attack=Math.min(1,t/.0015),envelope=Math.exp(-t*[65,55,40][stage]);
    samples[i]=attack*envelope*(Math.sin(2*Math.PI*frequency*t)*.21+Math.sin(2*Math.PI*frequency*2.17*t)*.08+noise*Math.exp(-t*95)*.17);}
  return samples;
}
