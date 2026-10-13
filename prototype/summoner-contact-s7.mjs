/** Original 2D capsule-contact candidate. Not an official DNF hurtbox model.
 * Capsule = rectangular band + two round caps; earliest entry into the union
 * rejects the empty corners of its axis-aligned bounding rectangle.
 */
export function summonerCapsuleContactS7(a,b,c,d,bodyRadius,staffRadius=2.1){
 if(![a.x,a.y,b.x,b.y,c.x,c.y,d.x,d.y,bodyRadius,staffRadius].every(Number.isFinite)||bodyRadius<0||staffRadius<0)throw new RangeError('invalid capsule');
 const dx=b.x-a.x,dy=b.y-a.y,px=d.x-c.x,py=d.y-c.y,L=Math.hypot(px,py),R=bodyRadius+staffRadius,entries=[];
 const circle=o=>{const ox=a.x-o.x,oy=a.y-o.y,A=dx*dx+dy*dy,C=ox*ox+oy*oy-R*R;
  if(C<=1e-10){entries.push(0);return;}if(A<1e-20)return;const B=2*(ox*dx+oy*dy),disc=B*B-4*A*C;if(disc< -1e-10)return;
  const t=(-B-Math.sqrt(Math.max(0,disc)))/(2*A);if(t>=-1e-10&&t<=1+1e-10)entries.push(Math.max(0,Math.min(1,t)));
 };
 circle(c);if(L>1e-10){circle(d);const ux=px/L,uy=py/L,vx=-uy,vy=ux;let lo=0,hi=1;
  for(const [o,v,min,max] of [[(a.x-c.x)*ux+(a.y-c.y)*uy,dx*ux+dy*uy,0,L],[(a.x-c.x)*vx+(a.y-c.y)*vy,dx*vx+dy*vy,-R,R]]){
   if(Math.abs(v)<1e-12){if(o<min-1e-10||o>max+1e-10){hi=-1;break;}}
   else {const u=(min-o)/v,w=(max-o)/v;lo=Math.max(lo,Math.min(u,w));hi=Math.min(hi,Math.max(u,w));}
  }if(lo<=hi+1e-10&&hi>=0&&lo<=1)entries.push(Math.max(0,lo));
 }
 if(!entries.length)return null;const t=Math.min(...entries),p={x:a.x+dx*t,y:a.y+dy*t};
 const u=L>1e-10?Math.max(0,Math.min(1,((p.x-c.x)*px+(p.y-c.y)*py)/(L*L))):0,q={x:c.x+px*u,y:c.y+py*u},distance=Math.hypot(p.x-q.x,p.y-q.y);
 // At ordinary entry, place the spark on the body surface. If the staff
 // already starts inside the body, use the actual overlap point instead.
 const point=distance>bodyRadius&&distance>1e-10?{x:q.x+(p.x-q.x)*bodyRadius/distance,y:q.y+(p.y-q.y)*bodyRadius/distance}:p;
 return {point,staffPoint:p,axisPoint:q,t,distance};
}
