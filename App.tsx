import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Star, Info, X, ArrowLeft } from 'lucide-react';
import { searchBooks, getCuratedShelf, analyzeBook } from './services/geminiService';
import { Book, ViewState } from './types';
import { BookCard } from './components/BookCard';
import { BookShelf } from './components/BookShelf';
import { LibrarianChat } from './components/LibrarianChat';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [analysis, setAnalysis] = useState<{ summary: string, themes: string[], funFact: string } | null>(null);
  
  // Shelves state
  const [classics, setClassics] = useState<Book[]>([]);
  const [scifi, setScifi] = useState<Book[]>([]);
  const [loadingShelves, setLoadingShelves] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [analyzingBook, setAnalyzingBook] = useState(false);

  // Initial Data Load
  useEffect(() => {
    const loadShelves = async () => {
      setLoadingShelves(true);
      try {
        const [classicBooks, scifiBooks] = await Promise.all([
            getCuratedShelf("American Classics"),
            getCuratedShelf("Thought-Provoking Sci-Fi")
        ]);
        setClassics(classicBooks);
        setScifi(scifiBooks);
      } catch (e) {
          console.error("Error loading initial shelves", e);
      } finally {
        setLoadingShelves(false);
      }
    };
    loadShelves();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setView(ViewState.SEARCH_RESULTS);
    const results = await searchBooks(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleBookClick = async (book: Book) => {
    setSelectedBook(book);
    setView(ViewState.BOOK_DETAILS);
    setAnalyzingBook(true);
    setAnalysis(null);
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Fetch analysis
    const result = await analyzeBook(book.title, book.author);
    setAnalysis(result);
    setAnalyzingBook(false);
  };

  const handleBack = () => {
    setSelectedBook(null);
    setView(searchResults.length > 0 && view === ViewState.BOOK_DETAILS ? ViewState.SEARCH_RESULTS : ViewState.HOME);
  };

  const handleResetHome = () => {
    setView(ViewState.HOME);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedBook(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-library-wood bg-paper-pattern relative">
      {/* Texture Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-5 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]"></div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-library-wood text-library-gold shadow-xl border-b-4 border-library-gold/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div 
              className="flex items-center gap-3 cursor-pointer group" 
              onClick={handleResetHome}
            >
              <div className="bg-library-gold p-2 rounded-sm shadow-inner transform group-hover:rotate-3 transition-transform">
                 <BookOpen className="text-library-wood h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tighter text-library-paper">USA4BOOKS</h1>
                <p className="text-[10px] md:text-xs text-library-gold uppercase tracking-[0.2em] opacity-80">The AI Library</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, or mood..."
                className="w-full bg-library-wood-light/50 text-white placeholder-white/40 border border-library-gold/20 rounded-full py-2.5 pl-5 pr-12 focus:outline-none focus:bg-library-wood-light focus:ring-2 focus:ring-library-gold transition-all font-serif"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-library-gold hover:text-white transition-colors"
                disabled={isSearching}
              >
                {isSearching ? (
                   <div className="animate-spin h-5 w-5 border-2 border-library-gold border-t-transparent rounded-full"></div>
                ) : (
                   <Search size={20} />
                )}
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
        {view === ViewState.HOME && (
          <div className="animate-fade-in">
             <div className="text-center mb-12 py-10 border-b border-library-wood/10">
                <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 text-library-wood">Welcome to the Archives</h2>
                <p className="text-lg text-library-wood-light max-w-2xl mx-auto italic font-serif opacity-80">
                  "A room without books is like a body without a soul."
                </p>
             </div>

            <BookShelf 
              title="American Classics" 
              books={classics} 
              onBookClick={handleBookClick} 
              isLoading={loadingShelves}
            />
            
            <BookShelf 
              title="Thought-Provoking Sci-Fi" 
              books={scifi} 
              onBookClick={handleBookClick} 
              isLoading={loadingShelves}
            />
          </div>
        )}

        {view === ViewState.SEARCH_RESULTS && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <button onClick={handleResetHome} className="p-2 hover:bg-library-wood/5 rounded-full transition-colors">
                <ArrowLeft className="text-library-wood" />
              </button>
              <h2 className="text-3xl font-serif font-bold">Results for "{searchQuery}"</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 p-8 bg-library-wood/5 rounded-sm border border-library-wood/10">
              {isSearching ? (
                 [1,2,3,4,5].map(i => <div key={i} className="h-64 bg-library-wood/10 rounded animate-pulse"></div>)
              ) : searchResults.length > 0 ? (
                searchResults.map((book, idx) => (
                    <div key={idx} className="flex justify-center">
                        <BookCard book={book} onClick={handleBookClick} />
                    </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 text-library-wood/50 font-serif italic text-lg">
                    No tomes found matching your query. Please try again.
                </div>
              )}
            </div>
          </div>
        )}

        {view === ViewState.BOOK_DETAILS && selectedBook && (
          <div className="animate-fade-in max-w-5xl mx-auto bg-white rounded-sm shadow-2xl overflow-hidden border border-library-wood/10">
            <div className="bg-wood-pattern p-1 md:p-2 bg-library-wood">
                <div className="bg-white rounded-sm overflow-hidden flex flex-col md:flex-row">
                    {/* Left Column: Cover & Quick Stats */}
                    <div className="md:w-1/3 p-8 bg-stone-50 border-r border-stone-200 flex flex-col items-center">
                        <div className="w-48 mb-8 transform hover:scale-105 transition-transform duration-500">
                            <BookCard book={selectedBook} onClick={() => {}} variant="cover" />
                        </div>
                        
                        <div className="w-full space-y-4">
                            <div className="flex items-center gap-3 text-library-wood-light">
                                <Star size={18} className="fill-library-gold text-library-gold" />
                                <span className="font-bold">{selectedBook.rating || '4.5'}/5 Rating</span>
                            </div>
                            <div className="flex items-center gap-3 text-library-wood-light">
                                <BookOpen size={18} />
                                <span>{selectedBook.genre || 'Fiction'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-library-wood-light">
                                <Info size={18} />
                                <span>{selectedBook.year || 'Classic'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details & AI Analysis */}
                    <div className="md:w-2/3 p-8 md:p-12">
                        <button onClick={handleBack} className="mb-6 flex items-center text-sm text-library-wood/50 hover:text-library-wood transition-colors font-bold uppercase tracking-widest">
                            <ArrowLeft size={16} className="mr-2" /> Back to Shelves
                        </button>

                        <h1 className="text-4xl md:text-5xl font-serif font-black text-library-wood mb-2 leading-tight">
                            {selectedBook.title}
                        </h1>
                        <p className="text-xl text-library-wood-light font-serif italic mb-8 border-b border-stone-200 pb-8">
                            by {selectedBook.author}
                        </p>

                        <div className="prose prose-stone max-w-none">
                            <h3 className="font-serif font-bold text-xl text-library-wood mb-3">Librarian's Note</h3>
                            <p className="text-lg leading-relaxed text-gray-700 mb-8 font-serif">
                                {selectedBook.description}
                            </p>

                            <h3 className="font-serif font-bold text-xl text-library-wood mb-4 flex items-center gap-2">
                                {analyzingBook ? (
                                    <>
                                        <span className="w-2 h-2 bg-library-gold rounded-full animate-ping"></span>
                                        Analyzing Text...
                                    </>
                                ) : (
                                    <>
                                        <span className="w-2 h-2 bg-library-gold rounded-full"></span>
                                        Deep Analysis
                                    </>
                                )}
                            </h3>
                            
                            {analyzingBook ? (
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                </div>
                            ) : analysis ? (
                                <div className="bg-paper-pattern p-6 rounded border border-library-wood/10 shadow-inner">
                                    <p className="italic text-gray-700 mb-4">"{analysis.summary}"</p>
                                    
                                    <div className="mb-4">
                                        <span className="font-bold text-xs uppercase tracking-widest text-library-wood-light block mb-2">Key Themes</span>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.themes.map((theme, i) => (
                                                <span key={i} className="px-3 py-1 bg-library-wood/5 text-library-wood text-sm rounded-full border border-library-wood/10">
                                                    {theme}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {analysis.funFact && (
                                        <div className="mt-6 pt-4 border-t border-library-wood/10">
                                            <span className="font-bold text-xs uppercase tracking-widest text-library-gold block mb-1">Did you know?</span>
                                            <p className="text-sm text-gray-600">{analysis.funFact}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">Analysis unavailable at this time.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-library-wood text-library-paper/60 py-8 border-t-4 border-library-gold/20 text-center text-sm font-serif mt-12">
        <p>&copy; 2024 USA4Books. All rights reserved. Curated by Artificial Intelligence.</p>
      </footer>

      {/* Chat Widget */}
      <LibrarianChat />
    </div>
  );
};

export default App;