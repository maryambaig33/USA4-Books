import React from 'react';
import { Book } from '../types';
import { BookOpen } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
  variant?: 'spine' | 'cover';
}

export const BookCard: React.FC<BookCardProps> = ({ book, onClick, variant = 'cover' }) => {
  // Determine text color based on background brightness approximation
  const isDark = (color?: string) => {
    if (!color) return true; // Default to dark background logic if undefined
    
    let c = color.replace('#', '');
    if (c.length === 3) {
        c = c.split('').map(char => char + char).join('');
    }
    if (c.length !== 6) return true; // Fallback

    const rgb = parseInt(c, 16);   
    if (isNaN(rgb)) return true; // Fallback

    const r = (rgb >> 16) & 0xff;
    const g = (rgb >>  8) & 0xff;
    const b = (rgb >>  0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; 
    return luma < 128;
  };

  const bgColor = book.coverColor || '#5D4037';
  const darkBackground = isDark(bgColor);
  const textColor = darkBackground ? 'text-library-paper' : 'text-library-wood';
  const borderColor = darkBackground ? 'border-white/20' : 'border-black/10';

  if (variant === 'spine') {
     return (
        <div 
            onClick={() => onClick(book)}
            className="group relative cursor-pointer flex-shrink-0 mx-1 h-64 w-12 rounded-sm border-l border-r border-white/10 flex flex-col items-center justify-center p-2 transition-all duration-300 hover:-translate-y-4 hover:shadow-xl"
            style={{ backgroundColor: bgColor }}
        >
            <div className={`writing-vertical-rl transform rotate-180 text-xs font-serif font-bold tracking-wider truncate h-4/5 ${textColor}`}>
                {book.title}
            </div>
            <div className={`mt-2 w-full h-[1px] ${textColor} opacity-50`}></div>
             <div className="absolute top-2 w-full h-8 bg-gradient-to-b from-white/20 to-transparent"></div>
        </div>
     );
  }

  return (
    <div 
      onClick={() => onClick(book)}
      className="perspective-container group cursor-pointer w-full max-w-[200px] mx-auto"
    >
      <div 
        className={`book-cover-3d relative aspect-[2/3] rounded-r-md shadow-2xl transition-all duration-300 border-l-4 border-l-white/10 overflow-hidden flex flex-col justify-between p-4 ${textColor}`}
        style={{ backgroundColor: bgColor }}
      >
        {/* Cover Texture Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leather.png')] opacity-30 mix-blend-multiply pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
            <div className={`border-b-2 ${borderColor} pb-2 mb-2`}>
                 <h3 className="font-serif font-bold text-lg leading-tight line-clamp-3">
                    {book.title}
                </h3>
            </div>
           
            <div className="flex-grow flex items-center justify-center opacity-80">
                <BookOpen size={32} />
            </div>

            <div className="mt-auto">
                <p className="text-xs uppercase tracking-widest font-bold opacity-75">{book.author}</p>
                {book.year && <p className="text-[10px] opacity-60 mt-1">{book.year}</p>}
            </div>
        </div>

        {/* Spine Illusion on left */}
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-black/50 to-transparent"></div>
      </div>
      
      {book.reason && (
          <div className="mt-3 text-xs text-library-wood-light italic leading-relaxed line-clamp-2">
            "{book.reason}"
          </div>
      )}
    </div>
  );
};