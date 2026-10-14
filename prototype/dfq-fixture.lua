-- Original fixture/input adapter. Source attack parameters below come from
-- the project's Swordman normalAttack cfg, NOT from a Summoner implementation.
local P=DFQ_PLATFORM
local Class=require('core.class')
local Caller=require('core.caller')
local Point=require('graphics.drawunit.point3')
local Color=require('graphics.drawunit.color')
local Solid=require('graphics.drawunit.solidRect')
local Attacker=require('actor.component.attacker')
local Battle=require('actor.component.battle')
local Attack=require('actor.gear.attack')
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
 e.states.caller:AddListener(nil,function() P.log('state',{entity=id,state=e.states.current:GetName(),hp=e.attributes.hp,z=e.transform.position.z}) end)
 -- Observer first, then real upstream HP listener. Caller invokes in reverse.
 e.battle.beatenCaller:AddListener(nil,function()
  local c=e.battle.beatenConfig;P.log('hit',{entity=id,damage=c.damage,hp=e.attributes.hp,state=e.states.current:GetName(),x=c.position.x,y=c.position.y,z=c.position.z})
  BattleService.DieTick(e.battle,e.attributes,e.transform,e.attacker,e.identity)
 end)
 AttributesSystem.OnEnter({},e)
 return e
end
local function geometry()
 local e=G.target;local p=e.transform.position;local down=e.states.current:HasTag('down') or e.states.current:HasTag('sit')
 local body=Solid.New(-15,-8,8,0,30,down and 18 or 80);body:Set(p.x,p.y,p.z);e.aspect.bodyRects={body}
 local o=G.owner;local rect=Solid.New(0,-8,8,G.low and 0 or 25,75,G.low and 20 or 55);rect:Set(o.transform.position.x,o.transform.position.y,o.transform.position.z)
 o.aspect.body={GetCollider=function() return {GetList=function(_,key) if key=='attack' and G.window then return {rect} end;return {} end} end};G.attackRect=rect;G.bodyRect=body
end
function G.reset(scene,lane,armor,lowHP)
 P.entities={};P.events={};P.clock=0;P.animations={};math.randomseed(12345)
 G.owner=entity('owner',0,1);G.target=entity('target',45,2);G.target.transform.position.y=lane or 0
 if armor then G.target.battle.banCountMap.stun=1;G.target.battle.banCountMap.flight=1 end
 if lowHP then G.target.attributes.hp=5 end
 P.entities={G.owner,G.target};G.attack=Attack.New(G.owner);G.window=false;G.low=false;G.stage=0
 local upper={AddSystem=function() end,DelSystem=function() end,Add=function() end,Del=function() end};G.stopSystem=AttackerSystem.New(upper);G.stateSystem=StatesSystem.New(upper)
 if scene=='flight' then BattleService.Flight(G.target.battle,G.target.states,8,.417,.501,0,0,-1,{},nil)
 elseif scene=='down' then State.Play(G.target.states,'down') end
 geometry();return G.snapshot()
end
function G.strike(stage,low)
 G.stage=stage or 1;G.low=low or false;geometry();local data=require('lib.table').Clone(normal.attack[G.stage]);local stops=normal.hitstop.katana;data.hitstop=stops[1];data.selfstop=stops[2];data.shake.time=data.hitstop
 G.attack:Enter(data);G.window=true;P.log('attack-start',{stage=G.stage,hitstop=data.hitstop,selfstop=data.selfstop,fixture=true});G.attack:Update();return G.snapshot()
end
function G.closeWindow() G.window=false;G.attack:Exit() end
function G.tick(dt)
 assert(dt>=0 and dt<=1000);P.clock=P.clock+dt;G.stopSystem:Update(dt)
 G.stateSystem:Update(dt,dt/17);for _,e in ipairs(P.entities) do e.battle.shaker:Update(dt) end
 geometry();G.attack:Update();return G.snapshot()
end
function G.snapshot()
 local e,o=G.target,G.owner;local p=e.transform.position;local s=e.states.current
 return {time=P.clock,state=s:GetName(),hp=e.attributes.hp,x=p.x,y=p.y,z=p.z,height=-p.z,paused=e.identity.isPaused,ownerPaused=o.identity.isPaused,ownerStop=o.attacker.hitstopTimer.to-o.attacker.hitstopTimer.from,targetStop=e.attacker.hitstopTimer.to-e.attacker.hitstopTimer.from,animation=e.aspect.animation,flightProcess=s._process or 0,banAttack=e.battle.banCountMap.attack,dead=e.battle.deadProcess,stage=G.stage,events=P.events}
end
DFQ_CORE=G
G.reset('stay',0,false,false)
return G
