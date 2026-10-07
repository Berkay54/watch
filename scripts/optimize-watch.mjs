import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const encoder=process.env.FFMPEG_PATH || path.join(root,'.tools/package/ffmpeg.exe');
const args=['-hide_banner','-y','-i',path.join(root,'public/media/watch-01.mp4'),'-map','0:v:0','-an',
 '-vf','scale=1920:1080:flags=lanczos','-c:v','libx264','-preset','medium','-crf','17',
 '-pix_fmt','yuv420p','-g','3','-keyint_min','3','-sc_threshold','0','-bf','0','-movflags','+faststart',
 path.join(root,'public/media/watch-01-scrub.mp4')];
const result=spawnSync(encoder,args,{stdio:'inherit',windowsHide:true});
if(result.error)throw result.error;
process.exitCode=result.status ?? 1;
