-- Original fixture/input adapter. Source attack parameters below come from
-- the project's Swordman normalAttack cfg, NOT from a Summoner implementation.
require('fixture.actionPlatform')
local P=DFQ_PLATFORM
local Class=require('core.class')
local Caller=require('core.caller')
local Point=require('graphics.drawunit.point3')
local Color=require('graphics.drawunit.color')
local Solid=require('graphics.drawunit.solidRect')
local Attacker=require('actor.component.attacker')
local Battle=require('actor.component.battle')
local NormalAttack=require('actor.state.duelist.swordman.normalAttack')
local Frameani=require('actor.drawable.frameani')
local Table=require('lib.table')
local State=require('actor.service.state')
local BattleService=require('actor.service.battle')
local AttributesSystem=require('actor.system.attributes')
local AttackerSystem=require('actor.system.attacker')
local StatesSystem=require('actor.system.states')
local Shaker=require('util.gear.shaker')
local Base=require('actor.state.base')
local classes={stun=require('actor.state.duelist.stun'),flight=require('actor.state.duelist.flight'),down=require('actor.state.duelist.down'),sit=require('actor.state.duelist.sit'),stay=Base}
local normal=require('fixture.normalAttack')
local framePaths={stun={'damage1','damage2'},flight={'damage1','damage2','damage3','damage4'},down={'down','damage3'},sit={'sit'},stay={'stay'}}
local G={}
local function entity(id,x,camp)
 local e={id=id,identity={isPaused=false,rate=1},attributes={hp=120,maxHp=120,negativeHp=0,phyAtk=12,magAtk=12,phyAtkRate=1,magAtkRate=1,phyDef=0,magDef=0,criticalRate=0,stunRate=1}}
 e.transform={position=Point.New(false,x,0,0),direction=id=='owner' and 1 or -1,radian={Get=function() return 0 end,Set=function() end},obstructCaller=Caller.New()}
 e.aspect={id=id,bodyRects={},body={GetAttri=function() return 0,0 end,SetAttri=function() end,GetHeight=function() return 80 end}}
 e.attacker=Attacker.New();e.battle=Battle.New({camp=camp,hasEffect=false,hasDestroy=false},{})
 e.battle.shaker=Shaker.New({x=0,y=0},{x={0,0,0},y={0,0,0}});e.battle.pureColorTweener=P.flashBackend(Color.New())
 e.states={map={},caller=Caller.New()};e.duelist={weight=0}
 for name,C in pairs(classes) do local data=name=='stay' and {tagMap={},nextState='stay'} or require('fixture.'..name);local s=C.New(data,nil,name);s:Init(e);s._frameaniDataSets={};for i,path in ipairs(framePaths[name]) do s._frameaniDataSets[i]={path=path} end;e.states.map[name]=s end
 State.Play(e.states,'stay')
 local observedState='stay'
 e.states.caller:AddListener(nil,function()
  local name=e.states.current:GetName()
  if name~=observedState then P.log('state',{entity=id,state=name,hp=e.attributes.hp,z=e.transform.position.z});observedState=name end
 end)
 -- Observer first, then real upstream HP listener. Caller invokes in reverse.
 e.battle.beatenCaller:AddListener(nil,function()
  local c=e.battle.beatenConfig;P.log('hit',{entity=id,damage=c.damage,hp=e.attributes.hp,state=e.states.current:GetName(),stage=G.normal:GetProcess(),frame=G.owner.aspect.body:GetFrame(),x=c.position.x,y=c.position.y,z=c.position.z})
  BattleService.DieTick(e.battle,e.attributes,e.transform,e.attacker,e.identity)
 end)
 AttributesSystem.OnEnter({},e)
 return e
end
local function geometry()
 local e=G.target;local p=e.transform.position
 local down=e.states.current:HasTag('down') or e.states.current:HasTag('sit')
 local body=Solid.New(-15,-8,8,0,30,down and 18 or 80);body:Set(p.x,p.y,p.z);e.aspect.bodyRects={body}
 G.owner.aspect.body:AdjustCollider()
end
local function frameData(stage)
 local out={path='source-katana-attack'..stage,list={}}
 for i,v in ipairs(require('fixture.frames'..stage)) do
  local collider
  local number=v.sprite
  if number=='3' or number=='4' or number=='12' or number=='13' or number=='35' or number=='36' then collider=require('fixture.collider'..number) end
  out.list[i]={time=v.time,spriteData={path='source-slot-'..number,colliderData=collider}}
 end
 return out
end
function G.reset(scene,lane,armor,lowHP,distance,attackRate)
 P.entities={};P.events={};P.clock=0;P.animations={};math.randomseed(12345)
 G.owner=entity('owner',0,1);G.target=entity('target',distance or 45,2);G.target.transform.position.y=lane or 0
 G.owner.attributes.attackRate=attackRate or 1
 if armor then G.target.battle.banCountMap.stun=1;G.target.battle.banCountMap.flight=1 end
 if lowHP then G.target.attributes.hp=5 end
 P.entities={G.owner,G.target}
 local o=G.owner
 o.transform.scale=Point.New(false,1,1,1)
 local stayData={path='source-idle-slots',list={}}
 for i,v in ipairs(require('fixture.idleFrames')) do stayData.list[i]={time=v.time,spriteData={path='source-slot-'..v.sprite}} end
 o.aspect.body=Frameani.New({entity=o,GetZ=function() return o.transform.position.z end},stayData)
 o.aspect.sourceDrawable=true;o.aspect.rate=1
 o.states.map.stay._tagMap.autoPlay=true;o.states.map.stay._frameaniDataSets={stayData}
 o.ais={enable=false};o.input={};o.equipments={};o.skills={container={Pairs=function() return function() end end}}
 local data=Table.Clone(normal)
 data.frameaniPathSet=nil;data.soundDataSet={voice={{}},swing={katana={{}}},hitting={katana={{}}}}
 data.attackDataSet=data.attack;data.colliderDataSet={require('fixture.collider12').attack,require('fixture.collider36').attack}
 local s=NormalAttack.New(data,nil,'normalAttack');s:Init(o);s._frameaniDataSets={frameData(1),frameData(2),frameData(3)}
 o.states.map.normalAttack=s;G.normal=s
 G.skill={attackValues={{}},GetKey=function() return 'attack' end,Reset=function() P.log('source-process',{stage=s:GetProcess()}) end}
 State.Play(o.states,'stay')
 local upper={AddSystem=function() end,DelSystem=function() end,Add=function() end,Del=function() end}
 G.stopSystem=AttackerSystem.New(upper);G.stateSystem=StatesSystem.New(upper)
 if scene=='flight' then BattleService.Flight(G.target.battle,G.target.states,8,.417,.501,0,0,-1,{},nil)
 elseif scene=='down' then State.Play(G.target.states,'down') end
 geometry();return G.snapshot()
end
function G.strike()
 State.Play(G.owner.states,'normalAttack',false,G.skill)
 return G.snapshot()
end
function G.closeWindow() end -- No fixture timer closes or fabricates source colliders.
function G.tick(dt)
 assert(dt>=0 and dt<=1000);P.clock=P.clock+dt;G.stopSystem:Update(dt)
 local o=G.owner
 if not o.identity.isPaused then o.aspect.body:Update(dt*o.aspect.rate*o.identity.rate) end
 geometry();G.stateSystem:Update(dt,dt/17)
 for _,e in ipairs(P.entities) do e.battle.shaker:Update(dt) end
 geometry()
 return G.snapshot()
end
function G.snapshot()
 local e,o=G.target,G.owner;local p=e.transform.position;local s=e.states.current;local main=o.aspect.body
 local collider=main:GetCollider();local rects=collider and collider:GetList('attack') or {};local boxes={}
 for _,v in ipairs(rects) do local x,y,w,h=v.rectGroup.xz:Get();boxes[#boxes+1]={x=x,y=y,w=w,h=h} end
 return {time=P.clock,state=s:GetName(),hp=e.attributes.hp,x=p.x,y=p.y,z=p.z,height=-p.z,paused=e.identity.isPaused,ownerPaused=o.identity.isPaused,ownerStop=o.attacker.hitstopTimer.to-o.attacker.hitstopTimer.from,targetStop=e.attacker.hitstopTimer.to-e.attacker.hitstopTimer.from,animation=e.aspect.animation,flightProcess=s._process or 0,banAttack=e.battle.banCountMap.attack,dead=e.battle.deadProcess,stage=G.normal:GetProcess() or 0,ownerState=o.states.current:GetName(),ownerX=o.transform.position.x,frame=main:GetFrame(),tick=main:GetTick(),length=main:GetLength(),attackColliderCount=#rects,attackBoxes=boxes,buffered=G.normal._hasPressed or false,sourceAttackRunning=G.normal._attack.isRunning or false,events=P.events}
end
DFQ_CORE=G
G.reset('stay',0,false,false)
return G
