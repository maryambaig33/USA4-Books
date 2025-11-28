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
      const [classicBooks, scifiBooks] = await Promise.all([
        getCuratedShelf("American Classics"),
        getCuratedShelf("Thought-Provoking Sci-Fi")
      ]);
      setClassics(classicBooks);
      setScifi(scifiBooks);
      setLoadingShelves(false);
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

  return (
    <div className="min-h-screen flex flex-col font-sans text-library-wood">
      
      {/* Navigation */}
      <nav className="bg-library-wood text-library-cream sticky top-0 z-40 shadow-xl border-b border-library-gold/20 bg-wood-pattern">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => {
                setView(ViewState.HOME);
                setSearchQuery('');
                setSearchResults([]);
            }}
          >
            <div className="bg-library-gold p-2 rounded-full text-library-wood shadow-lg group-hover:bg-white transition-colors">
              <BookOpen size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-serif font-bold tracking-tight text-white group-hover:text-library-gold transition-colors">USA4Books</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-library-gold">The Enhanced Library</p>
            </div>
          </div>
          
          <div className="hidden md:flex gap-6 text-sm font-bold uppercase tracking-wider text-white/70">
            <button onClick={() => setView(ViewState.HOME)} className="hover:text-library-gold transition-colors">Collection</button>
            <button className="hover:text-library-gold transition-colors">About</button>
          </div>
        </div>
      </nav>

      {/* Hero Section (Only on Home) */}
      {view === ViewState.HOME && (
        <header className="relative bg-library-wood-light py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-library-wood-light to-transparent"></div>
          
          <div className="container mx-auto relative z-10 max-w-3xl text-center">
            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 drop-shadow-md">
              Discover Your Next <span className="text-library-gold italic">Great Read</span>
            </h2>
            <p className="text-lg text-white/80 mb-10 font-light leading-relaxed">
              Explore a curated collection enhanced by artificial intelligence. 
              Search for a topic, feeling, or genre, and let our digital concierge guide you.
            </p>

            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto transform transition-all hover:scale-105 duration-300">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Find a book about resilience in the 1920s..." 
                className="w-full pl-6 pr-14 py-5 rounded-full shadow-2xl text-lg font-serif text-library-wood focus:outline-none focus:ring-4 focus:ring-library-gold/50 placeholder:text-gray-400"
              />
              <button 
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-library-wood hover:bg-library-wood-light text-white rounded-full w-12 flex items-center justify-center transition-colors"
              >
                {isSearching ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"/> : <Search size={20} />}
              </button>
            </form>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-12">
        
        {/* Search Results View */}
        {view === ViewState.SEARCH_RESULTS && (
          <div className="animate-fade-in">
             <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setView(ViewState.HOME)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-3xl font-serif font-bold">
                    Results for <span className="text-library-red italic">"{searchQuery}"</span>
                </h2>
             </div>
             
             {isSearching ? (
                 <div className="flex flex-col items-center justify-center py-20">
                     <div className="w-16 h-16 border-4 border-library-wood border-t-library-gold rounded-full animate-spin mb-4"></div>
                     <p className="font-serif italic text-library-wood-light">Consulting the archives...</p>
                 </div>
             ) : (
                <BookShelf title="Search Findings" books={searchResults} onBookClick={handleBookClick} />
             )}
          </div>
        )}

        {/* Home View Shelves */}
        {view === ViewState.HOME && (
          <div className="space-y-12 animate-fade-in">
            <BookShelf 
                title="American Classics" 
                books={classics} 
                isLoading={loadingShelves} 
                onBookClick={handleBookClick} 
            />
            <BookShelf 
                title="Thought-Provoking Sci-Fi" 
                books={scifi} 
                isLoading={loadingShelves} 
                onBookClick={handleBookClick} 
            />
          </div>
        )}

        {/* Book Details View */}
        {view === ViewState.BOOK_DETAILS && selectedBook && (
          <div className="animate-fade-in max-w-5xl mx-auto bg-white shadow-2xl rounded-sm overflow-hidden border border-stone-200">
             <div className="grid md:grid-cols-12 min-h-[600px]">
                {/* Left: Visual */}
                <div className="md:col-span-5 bg-stone-100 p-12 flex flex-col items-center justify-center border-r border-stone-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-paper-pattern opacity-50"></div>
                    <button onClick={handleBack} className="absolute top-4 left-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-library-wood hover:text-library-red transition-colors z-20">
                        <ArrowLeft size={16} /> Back
                    </button>
                    
                    <div className="transform scale-125 z-10 drop-shadow-2xl">
                        <BookCard book={selectedBook} onClick={() => {}} variant="cover" />
                    </div>
                </div>

                {/* Right: Information */}
                <div className="md:col-span-7 p-10 md:p-14 flex flex-col bg-paper-pattern">
                    <h2 className="text-4xl md:text-5xl font-serif font-black text-library-wood mb-2 leading-tight">
                        {selectedBook.title}
                    </h2>
                    <p className="text-xl text-library-wood-light font-serif italic mb-8">by {selectedBook.author}</p>

                    <div className="flex gap-4 mb-8">
                        {selectedBook.genre && (
                            <span className="px-3 py-1 bg-library-wood/10 text-library-wood text-xs font-bold uppercase tracking-widest rounded-full">
                                {selectedBook.genre}
                            </span>
                        )}
                        {selectedBook.year && (
                             <span className="px-3 py-1 bg-library-wood/10 text-library-wood text-xs font-bold uppercase tracking-widest rounded-full">
                                {selectedBook.year}
                            </span>
                        )}
                    </div>

                    <div className="prose prose-stone prose-lg mb-8 text-library-wood/80 leading-relaxed">
                        <p>{selectedBook.description}</p>
                    </div>

                    {/* AI Analysis Section */}
                    <div className="mt-auto border-t border-library-wood/10 pt-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Star className="text-library-gold fill-library-gold" size={20} />
                            <h3 className="font-bold text-library-wood uppercase tracking-wider text-sm">Librarian's Analysis</h3>
                        </div>
                        
                        {analyzingBook ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-4 bg-library-wood/10 rounded w-3/4"></div>
                                <div className="h-4 bg-library-wood/10 rounded w-full"></div>
                                <div className="h-4 bg-library-wood/10 rounded w-5/6"></div>
                            </div>
                        ) : analysis ? (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-bold text-library-wood mb-1">Themes</p>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.themes.map((t, i) => (
                                            <span key={i} className="text-xs bg-library-gold/20 text-library-wood-light px-2 py-1 rounded-sm border border-library-gold/30">{t}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-library-cream p-4 rounded-r-lg border-l-4 border-library-gold">
                                    <p className="text-sm italic text-library-wood">
                                        <span className="font-bold not-italic mr-2">Did you know?</span> 
                                        {analysis.funFact}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-red-500">Analysis unavailable at the moment.</p>
                        )}
                    </div>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-library-wood text-library-cream py-12 border-t-4 border-library-gold">
        <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <BookOpen size={32} className="text-library-gold"/>
                <span className="text-2xl font-serif font-bold">USA4Books</span>
            </div>
            <p className="text-white/50 max-w-md mx-auto mb-8 font-light">
                Reimagining the library experience for the digital age. Powered by Google Gemini.
            </p>
            <div className="text-xs uppercase tracking-widest text-library-gold/50">
                © {new Date().getFullYear()} USA4Books Enhanced. All rights reserved.
            </div>
        </div>
      </footer>

      {/* Floating Chat */}
      <LibrarianChat />
    </div>
  );
};

export default App;