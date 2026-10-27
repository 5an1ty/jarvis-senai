export type Device = { id:string; name:string; room:string; kind:string; online:boolean; on:boolean; brightness:number; color:string; watts:number };
export type Suggestion = {id:string; text:string; reason:string; status:string};
export type HomeState = {devices:Device[]; inventory:{name:string; quantity:number; minimum:number}[]; shopping:{name:string;quantity:number}[]; suggestions:Suggestion[]; events:{id:string; device:string; action:string; at:string; result:string; source:string}[]; learning:boolean; automations:{id:string;name:string;enabled:boolean}[]};
export const tokens = {background:'#050816',surface:'#0B1023',cyan:'#00D9FF',purple:'#8B5CF6',success:'#00FF9C'};
