import React,{useEffect,useRef,useState} from 'react';
import {Pause,Play} from 'lucide-react';

export function VideoMotionControl({paused,onToggle,label}){
 return <button className="video-motion-control" type="button" onClick={onToggle} aria-label={`${paused?'Play':'Pause'} ${label}`} aria-pressed={paused}>{paused?<Play size={15} fill="currentColor"/>:<Pause size={15} fill="currentColor"/>}</button>;
}

export default function CinematicMedia({src,poster,alt,paused=false,priority=false}){
 const videoRef=useRef(null),wrapperRef=useRef(null);
 const [enabled,setEnabled]=useState(false),[ready,setReady]=useState(false),[visible,setVisible]=useState(false),[reduced,setReduced]=useState(()=>matchMedia('(prefers-reduced-motion: reduce)').matches);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');
  const change=()=>setReduced(media.matches);media.addEventListener('change',change);
  const observer=new IntersectionObserver(entries=>setVisible(entries[0].isIntersecting),{threshold:.05});
  observer.observe(wrapperRef.current);
  return()=>{observer.disconnect();media.removeEventListener('change',change);};
 },[]);
 useEffect(()=>{if(visible&&!reduced&&!navigator.connection?.saveData)setEnabled(true);},[visible,reduced]);
 useEffect(()=>{
  const video=videoRef.current;if(!video)return;
  const update=()=>{
   const playable=enabled&&visible&&!paused&&!reduced&&!document.hidden;
   if(playable){video.muted=true;video.play().catch(()=>setReady(false));}else video.pause();
  };
  update();video.addEventListener('canplay',update);document.addEventListener('visibilitychange',update);
  return()=>{video.removeEventListener('canplay',update);document.removeEventListener('visibilitychange',update);video.pause();};
 },[enabled,visible,paused,reduced]);
 return <div className={`cinematic-media ${ready&&!reduced?'video-ready':''}`} ref={wrapperRef}>
  <img src={poster} alt={alt} width="800" height="1000" loading={priority?'eager':'lazy'} fetchPriority={priority?'high':'auto'}/>
  <video ref={videoRef} src={enabled?src:undefined} poster={poster} autoPlay={enabled&&!paused&&!reduced} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} onPlaying={()=>setReady(true)} onError={()=>setReady(false)}/>
 </div>;
}
