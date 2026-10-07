import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.mp4':'video/mp4','.json':'application/json'};
http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/favicon.ico'){res.writeHead(204).end();return;}
  const file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.stat(file,(error,stat)=>{
    if(error||!stat.isFile()){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');
    res.setHeader('Accept-Ranges','bytes');
    res.setHeader('Cache-Control','no-cache');
    const range=/^bytes=(\d+)-(\d*)$/.exec(req.headers.range||'');
    if(range){const start=Number(range[1]),end=Math.min(range[2]?Number(range[2]):stat.size-1,stat.size-1);
      if(start>end){res.writeHead(416,{'Content-Range':'bytes */'+stat.size}).end();return;}
      res.writeHead(206,{'Content-Range':'bytes '+start+'-'+end+'/'+stat.size,'Content-Length':end-start+1});
      fs.createReadStream(file,{start,end}).pipe(res);
    }else{res.setHeader('Content-Length',stat.size);fs.createReadStream(file).pipe(res);}
  });
}).listen(Number(process.env.PORT)||5173,'0.0.0.0',()=>console.log('Watch prototype: http://localhost:5173'));
