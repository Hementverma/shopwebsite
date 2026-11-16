import { useState } from 'react';

export default function StarRating({ rating = 0, onChange, size = 'md', readonly = false }) {
  const [hover, setHover] = useState(0);
  const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          className={`${sizeClass} leading-none transition ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} ${(hover || rating) >= star ? 'text-amber-400' : 'text-navy-200'}`}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => !readonly && onChange?.(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
