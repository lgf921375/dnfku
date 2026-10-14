-- Original compatibility glue for a blank stage and telemetry. Gameplay modules
-- remain byte-identical to DFQ. No DNF textures/audio or job animation are loaded.
local P={entities={},events={},clock=0,animations={}}
DFQ_PLATFORM=P
local function module(name,value) package.preload[name]=function() return value end end
local function log(kind,data) data=data or {};data.type=kind;data.time=P.clock;P.events[#P.events+1]=data end
P.log=log
love={timer={getTime=function() return P.clock/1000 end,getFPS=function() return 60 end}}
-- The upstream LuaJIT structs are replaced only at their primitive ABI boundary.
-- Supported structs: Color and int/float Point3. No generic LuaJIT emulation.
module('ffi',{cdef=function() end,metatype=function(name,meta)
 local keys=name=='color' and {'red','green','blue','alpha'} or {'x','y','z'}
 return function(...) local t,args={},{...};for i,k in ipairs(keys) do local v=args[i] or 0;if name=='integerPoint3' then v=v<0 and math.ceil(v) or math.floor(v) end;t[k]=v end;return setmetatable(t,meta) end
end})
module('lib.graphics',{})
module('config',{language='cn',user={}})
module('lib.sound',{Play=function() end,RandomPlay=function() end})
module('actor.resmgr',{GetSoundData=function(path) return {path=path} end,GetInstanceData=function(path) return {path=path} end})
module('lib.resource',{})
module('actor.service.duelist',{})
module('actor.service.effect',{})
module('actor.service.buff',{})
module('actor.service.input',{GetArrowDirection=function() return 0 end})
module('util.gear.tweener',{})
module('util.gear.mockTweener',{})
module('actor.factory',{NewWithPool=function(data,param) log('effect',{x=param.x,y=param.y,z=param.z});return {} end,New=function() return {} end})
module('actor.world',{AddDamageTip=function(damage,kind,x,y,critical) log('damage-tip',{damage=damage,x=x,y=y,critical=critical}) end})
module('actor.ecsmgr',{NewComboList=function(pass)
 local list={};local function selected() local out={};for _,e in ipairs(P.entities) do local ok=true;for k in pairs(pass) do if not e[k] then ok=false end end;if ok then out[#out+1]=e end end;return out end
 function list:GetLength() return #selected() end;function list:Get(i) return selected()[i] end;return list
end})
local matrix={ToNode=function(_,value) return math.floor(value/32) end,GetNode=function() return false end,ToPosition=function(_,node) return node*32 end}
module('map.init',{GetMatrix=function() return matrix end,AddLoadListener=function() end,camera={Shake=function() end}})
module('actor.service.aspect',{
 GetPart=function(aspect) return aspect.body end,
 GetBodySolidRectList=function(aspect) return aspect.bodyRects end,
 Play=function(aspect,data) aspect.animation=data and data.path or 'none';log('animation',{entity=aspect.id,animation=aspect.animation}) end,
 StuffFrameaniDataSet=function(_,path,out) out[1]={path=path} end
})
-- Only display-only flashing is represented by a tiny backend object; Hitstop,
-- collision, state decisions, gravity/easemove, timers and HP use upstream code.
P.flashBackend=function(color) return {GetSubject=function() return color end,Enter=function() end} end
return P
