"use client";

import { Star, StarHalf, StarOff } from 'lucide-react'; // StarOff can be used for 0 rating or empty

interface StarRatingProps {
  rating: number;
  totalStars?: number;
  size?: number;
  className?: string;
  showText?: boolean;
}

export default function StarRating({
  rating,
  totalStars = 5,
  size = 20,
  className,
  showText = false,
}: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = totalStars - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} fill="hsl(var(--accent))" strokeWidth={0} size={size} className="text-accent" />
      ))}
      {hasHalfStar && <StarHalf key="half" fill="hsl(var(--accent))" strokeWidth={0} size={size} className="text-accent" />}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} fill="hsl(var(--muted))" strokeWidth={0} size={size} className="text-muted-foreground" />
      ))}
      {showText && <span className="ml-2 text-sm text-muted-foreground">({rating.toFixed(1)})</span>}
    </div>
  );
}
