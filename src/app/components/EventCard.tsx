import { motion } from "motion/react";
import { ImageWithFallback } from "./ImageWithFallback";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
  price: string;
  category: string;
  onClick: () => void;
}

export function EventCard({
  title,
  date,
  location,
  image,
  price,
  category,
  onClick
}: EventCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative overflow-hidden bg-white group cursor-pointer text-left w-full"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-900">
        <ImageWithFallback
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-black uppercase tracking-wide">
            {category}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-3">
        <h3 className="text-2xl font-bold text-black leading-tight">
          {title}
        </h3>

        <div className="space-y-1 text-sm text-zinc-600">
          <p className="font-medium text-black">{date}</p>
          <p>{location}</p>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-lg font-bold text-black">
            Desde {price}
          </span>
          <span className="text-sm font-semibold text-zinc-900 group-hover:translate-x-1 transition-transform">
            Ver tickets →
          </span>
        </div>
      </div>
    </motion.button>
  );
}
