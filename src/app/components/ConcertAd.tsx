import { motion, AnimatePresence } from "framer-motion";
import { Ticket } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

const PLAYLIST = [
  { id: "x5qCbLcWgps", duration: 180 }, 
  { id: "OQInJiCCqUQ", duration: 200 }, 
  { id: "dbmNWN_dEkI", duration: 190 }, 
  { id: "v742oCBECdQ", duration: 3000 }, 
  { id: "Cr8K88UcO0s", duration: 250 }, 
  { id: "vBynw9Isr28", duration: 240 }  
];

export const ConcertAd = () => {
  const [videoData, setVideoData] = useState({ id: "", start: 0 });

  const getRandomVideo = useCallback(() => {
    const video = PLAYLIST[Math.floor(Math.random() * PLAYLIST.length)];
    const randomStart = Math.floor(Math.random() * (video.duration * 0.8)) + 10;
    return { id: video.id, start: randomStart };
  }, []);

  useEffect(() => {
    setVideoData(getRandomVideo());
    const interval = setInterval(() => {
      setVideoData(getRandomVideo());
    }, 10000);
    return () => clearInterval(interval);
  }, [getRandomVideo]);

  const videoSrc = `https://www.youtube.com/embed/${videoData.id}?autoplay=1&mute=1&controls=0&start=${videoData.start}&modestbranding=1&rel=0&iv_load_policy=3`;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      className="relative w-full overflow-hidden rounded-2xl bg-black h-[180px] md:h-[220px] group border border-white/5"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`${videoData.id}-${videoData.start}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 w-full h-full"
        >
          <iframe
            src={videoSrc}
            className="absolute top-1/2 left-1/2 w-[110%] h-[150%] -translate-x-1/2 -translate-y-1/2 object-cover pointer-events-none scale-110"
            allow="autoplay; encrypted-media"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />

      <div className="relative h-full px-8 md:px-12 flex items-center justify-between">
        
        <div className="flex flex-col">
          <h3 className="text-2xl md:text-4xl font-black text-white leading-tight italic uppercase tracking-tighter">
            EXPLORA LA <br/> 
            <span className="text-red-500 font-black not-italic text-3xl md:text-5xl">EXPERIENCIA LIVE</span>
          </h3>
        </div>

        <div className="flex-none">

        </div>
      </div>


      <motion.div 
        key={`bar-${videoData.id}-${videoData.start}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 10, ease: "linear" }}
        className="absolute bottom-0 left-0 h-1 bg-red-600 origin-left w-full shadow-[0_0_10px_rgba(220,38,38,0.8)]"
      />
    </motion.div>
  );
}; 