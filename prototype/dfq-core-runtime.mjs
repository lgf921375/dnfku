// VM and ABI adapter only. The selected Lua gameplay modules are not translated.
export function createDFQCore(fengari,sources,platform,fixture){
 const {lua,lauxlib,lualib,to_luastring,to_jsstring}=fengari;
 const L=lauxlib.luaL_newstate();lualib.luaL_openlibs(L);
 const error=()=>new Error(to_jsstring(lua.lua_tostring(L,-1)));
 const run=(s,name)=>{if(lauxlib.luaL_loadbuffer(L,to_luastring(s),null,to_luastring(name))!==lua.LUA_OK||lua.lua_pcall(L,0,0,0)!==lua.LUA_OK)throw error();};
 run(platform,'dnfku-platform-abi');
 for(const [name,source] of Object.entries(sources))run(`package.preload[${JSON.stringify(name)}]=function(...)\n${source}\nend`,'@DFQ/'+name);
 run(fixture,'dnfku-fixture');
 function value(index){const type=lua.lua_type(L,index);if(type===lua.LUA_TNUMBER)return lua.lua_tonumber(L,index);if(type===lua.LUA_TBOOLEAN)return !!lua.lua_toboolean(L,index);if(type===lua.LUA_TSTRING)return to_jsstring(lua.lua_tostring(L,index));if(type===lua.LUA_TNIL)return null;
  if(type!==lua.LUA_TTABLE)throw new Error('Unsupported snapshot type '+type);const absolute=lua.lua_absindex(L,index),out={};lua.lua_pushnil(L);let numeric=true,count=0;while(lua.lua_next(L,absolute)){const k=value(-2);out[k]=value(-1);numeric&&=typeof k==='number'&&Number.isInteger(k)&&k>=1;count++;lua.lua_pop(L,1);}if(numeric&&count>0&&Object.keys(out).length===count){const a=[];for(let i=1;i<=count;i++)a.push(out[i]);return a;}return out;
 }
 return {call(name,...args){if(!['reset','strike','closeWindow','tick','snapshot'].includes(name))throw new Error('Unsupported API');const top=lua.lua_gettop(L);try{lua.lua_getglobal(L,to_luastring('DFQ_CORE'));lua.lua_getfield(L,-1,to_luastring(name));for(const arg of args){if(typeof arg==='number'){if(!Number.isFinite(arg))throw new Error('Nonfinite argument');lua.lua_pushnumber(L,arg);}else if(typeof arg==='boolean')lua.lua_pushboolean(L,arg);else if(typeof arg==='string')lua.lua_pushstring(L,to_luastring(arg));else throw new Error('Unsupported argument');}if(lua.lua_pcall(L,args.length,1,0)!==lua.LUA_OK)throw error();return value(-1);}finally{lua.lua_settop(L,top);}},close(){lua.lua_close(L);}};
}
