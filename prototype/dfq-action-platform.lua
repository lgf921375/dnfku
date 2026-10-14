-- Display/fixture ABI only. Original Frameani, Actor Frameani and Collider
-- own time progression, frame switches and collider selection.
local P=DFQ_PLATFORM
local function module(name,value) package.preload[name]=function() return value end end
local Class=require('core.class')
local Sprite=Class()
function Sprite:Ctor(upperEvent)
 self._upperEvent=upperEvent
 self._renderer={GetAttri=function(_,key)
  if key=='position' then local e=upperEvent.entity;return e.transform.position.x,e.transform.position.y+e.transform.position.z end
  if key=='scale' then local e=upperEvent.entity;return e.transform.scale.x*e.transform.direction,e.transform.scale.y end
 end}
end
function Sprite:SetData(data) self._data=data;self._path=data and data.path or '' end
function Sprite:GetData() return self._data end
function Sprite:GetPath() return self._path end
function Sprite:SetAttri() end
module('graphics.drawable.sprite',Sprite)
module('actor.service.equipment',{GetSubKind=function() return 'katana' end})
local aspect=require('actor.service.aspect')
local oldPlay=aspect.Play
aspect.Play=function(a,data)
 if a.sourceDrawable then a.body:Play(data);a.animation=data.path;P.log('animation',{entity=a.id,animation=data.path})
 else oldPlay(a,data) end
end
local ffi=require('ffi')
local oldMetatype=ffi.metatype
ffi.metatype=function(name,meta)
 if name=='integerPoint' or name=='floatPoint' then return function(x,y)
  x=x or 0;y=y or 0
  if name=='integerPoint' then x=x<0 and math.ceil(x) or math.floor(x);y=y<0 and math.ceil(y) or math.floor(y) end
  return setmetatable({x=x,y=y},meta)
 end end
 return oldMetatype(name,meta)
end
require('config').debug={collider=false}
return P
