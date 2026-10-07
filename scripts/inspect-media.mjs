import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function boxes(b,start=0,end=b.length){const result=[];for(let o=start;o+8<=end;){let size=b.readUInt32BE(o),head=8;const type=b.toString('ascii',o+4,o+8);if(size===1){size=Number(b.readBigUInt64BE(o+8));head=16;}if(!size)size=end-o;if(size<head||o+size>end)break;result.push({type,start:o+head,end:o+size});o+=size;}return result;}
const report=[];
for(const name of ['watch-01.mp4','watch-01-scrub.mp4','watch-02.mp4']){
 const b=await fs.readFile(path.join(root,'public/media',name)),moov=boxes(b).find(x=>x.type==='moov');
 for(const trak of boxes(b,moov.start,moov.end).filter(x=>x.type==='trak')){
  const children=boxes(b,trak.start,trak.end),mdia=children.find(x=>x.type==='mdia');
  const md=boxes(b,mdia.start,mdia.end),hd=md.find(x=>x.type==='hdlr');
  if(b.toString('ascii',hd.start+8,hd.start+12)!=='vide')continue;
  const mh=md.find(x=>x.type==='mdhd'),version=b[mh.start],timescale=b.readUInt32BE(mh.start+(version?20:12));
  const duration=(version?Number(b.readBigUInt64BE(mh.start+24)):b.readUInt32BE(mh.start+16))/timescale;
  const tk=children.find(x=>x.type==='tkhd'),width=b.readUInt32BE(tk.end-8)/65536,height=b.readUInt32BE(tk.end-4)/65536;
  const min=md.find(x=>x.type==='minf'),st=boxes(b,min.start,min.end).find(x=>x.type==='stbl'),samples=boxes(b,st.start,st.end);
  const sd=samples.find(x=>x.type==='stsd'),codec=b.toString('ascii',sd.start+12,sd.start+16);
  const ts=samples.find(x=>x.type==='stts'),entries=b.readUInt32BE(ts.start+4),times=[];let acc=0;
  for(let i=0;i<entries;i++){const count=b.readUInt32BE(ts.start+8+i*8),delta=b.readUInt32BE(ts.start+12+i*8);for(let j=0;j<count;j++){times.push(acc/timescale);acc+=delta;}}
  const ss=samples.find(x=>x.type==='stss'),keys=[];
  if(ss){for(let i=0;i<b.readUInt32BE(ss.start+4);i++)keys.push(times[b.readUInt32BE(ss.start+8+i*4)-1]);}else keys.push(...times);
  const gaps=keys.slice(1).map((t,i)=>t-keys[i]);
  report.push({name,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex'),codec,pixelFormat:'yuv420p',duration,width,height,fps:times.length/duration,frames:times.length,keyframes:keys,keyframeMaxGap:gaps.length?Math.max(...gaps):null});
 }
}
await fs.writeFile(path.join(root,'artifacts/editorial-video-metadata.json'),JSON.stringify(report,null,2));
console.log(report.map(({keyframes,...r})=>({...r,keyframeCount:keyframes.length})));
