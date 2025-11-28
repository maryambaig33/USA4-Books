import React from 'react';
import { Book } from '../types';
import { BookCard } from './BookCard';

interface BookShelfProps {
  title: string;
  books: Book[];
  onBookClick: (book: Book) => void;
  isLoading?: boolean;
}

export const BookShelf: React.FC<BookShelfProps> = ({ title, books, onBookClick, isLoading }) => {
  return (
    <div className="mb-16">
      <div className="flex items-baseline gap-4 mb-6 border-b border-library-wood/20 pb-2">
        <h2 className="text-3xl font-serif font-bold text-library-wood">{title}</h2>
        <span className="text-sm font-sans text-library-wood-light/60 uppercase tracking-widest">Curated Collection</span>
      </div>

      <div className="relative bg-library-wood p-8 rounded-sm shadow-inner shadow-black/50 bg-wood-pattern">
        {/* Shelf Background Detail */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-black/20 shadow-lg"></div>
        
        {isLoading ? (
          <div className="flex gap-6 overflow-x-auto pb-8 pt-4 no-scrollbar">
            {[1, 2, 3, 4, 5].map((i) => (
               <div key={i} className="flex-shrink-0 w-[200px] h-[300px] bg-white/5 rounded-md animate-pulse border border-white/10"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 relative z-10">
            {books.length > 0 ? (
                books.map((book, idx) => (
                <div key={idx} className="flex justify-center mb-4">
                    <BookCard book={book} onClick={onBookClick} />
                </div>
                ))
            ) : (
                <div className="col-span-full text-center py-12 text-white/50 font-serif italic">
                    The shelves are currently being dusted. Please check back shortly.
                </div>
            )}
          </div>
        )}

        {/* Shelf Board */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-b from-[#2a1a16] to-[#3E2723] shadow-lg border-t border-white/10"></div>
      </div>
    </div>
  );
};
