// Render quiet, seamless camera-movement loops from existing brand photography.
// These are photo-based motion studies, not filmed campaign footage.
import fs from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import sharp from 'sharp';

const ffmpeg=process.env.FFMPEG_PATH||path.join(process.env.LOCALAPPDATA,'ms-playwright/ffmpeg-1011/ffmpeg-win64.exe');
await fs.mkdir('public/videos',{recursive:true});
const clips=[{id:3692,name:'hero-men',width:480},{id:3661,name:'hero-women',width:480},{id:3510,name:'campaign',width:640}];
for(const clip of clips){
 const source=await fs.readFile(`public/images/product-${clip.id}.webp`);
 const meta=await sharp(source).metadata();
 const width=clip.width,height=Math.round((meta.height/meta.width*width)/2)*2;
 const target=`public/videos/${clip.name}.webm`;
 const process=spawn(ffmpeg,['-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','mjpeg','-r','24','-i','pipe:0','-an','-c:v','libvpx','-b:v','350k','-crf','32','-deadline','good','-cpu-used','4',target],{stdio:['pipe','ignore','pipe']});
 let error='';process.stderr.on('data',data=>error+=data);const done=once(process,'close');
 for(let frame=0;frame<144;frame++){
  const zoom=1+.008*(1-Math.cos(2*Math.PI*frame/144));
  const w=Math.ceil(width*zoom),h=Math.ceil(height*zoom);
  const image=await sharp(source).resize(w,h,{fit:'fill'}).extract({left:Math.floor((w-width)/2),top:Math.floor((h-height)/2),width,height}).jpeg({quality:85}).toBuffer();
  if(!process.stdin.write(image))await once(process.stdin,'drain');
 }
 process.stdin.end();const [code]=await done;if(code!==0)throw Error(error||`Encoding ${target} failed`);
 console.log(`${clip.name}: ${width}×${height}, 6-second seamless loop, ${Math.round((await fs.stat(target)).size/1024)} KB`);
}
