import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BrainCircuit,
  FileText,
  Layers,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import searchApi from '../api/searchApi';

export const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await searchApi.globalSearch(query, filterType);
      if (res?.success) {
        setResults(res.data);
      }
    } catch (err) {
      console.error('Global search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query.trim().length >= 3) {
      const delay = setTimeout(() => {
        handleSearch();
      }, 300);
      return () => clearTimeout(delay);
    }
  }, [query, filterType]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Search className="w-8 h-8 text-indigo-400" />
          Universal Global Search
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          Search across research projects, source documents, classified evidence, research briefs, and conversation history.
        </p>
      </div>

      {/* Search Bar & Filters */}
      <Card className="p-6 space-y-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across projects, documents, evidence excerpts, or chats..."
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {['all', 'projects', 'documents', 'evidence', 'briefs'].map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all min-h-[44px] ${
                  filterType === t
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </form>
      </Card>

      {/* Search Results Display */}
      {results && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">
              Found {results.resultsCount} matches for "{query}"
            </span>
          </div>

          {/* Research Projects Results */}
          {results.projects?.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                Research Projects ({results.projects.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.projects.map((p) => (
                  <Card key={p._id} className="p-5 space-y-2 border-slate-800">
                    <div className="flex items-center justify-between">
                      <Badge variant="emerald">{p.status}</Badge>
                      <Link to={`/details/${p._id}`}>
                        <Button variant="ghost" size="sm" icon={ArrowRight}>Open</Button>
                      </Link>
                    </div>
                    <h3 className="font-bold text-white text-base">{p.title}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2">"{p.researchQuestion}"</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Documents Results */}
          {results.documents?.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                Documents ({results.documents.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.documents.map((d) => (
                  <Card key={d._id} className="p-5 space-y-2 border-slate-800">
                    <div className="flex items-center justify-between">
                      <Badge variant="indigo">{d.mimeType || 'Document'}</Badge>
                      <span className="text-xs text-slate-400 font-mono">{d.chunkCount} Chunks</span>
                    </div>
                    <h3 className="font-bold text-white text-base">{d.filename}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2">{d.rawText}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Results */}
          {results.evidence?.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Evidence Items ({results.evidence.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.evidence.map((e) => (
                  <Card key={e._id} className="p-5 space-y-2 border-slate-800">
                    <div className="flex items-center justify-between">
                      <Badge variant={e.classification === 'Supporting' ? 'emerald' : 'amber'}>
                        {e.classification}
                      </Badge>
                      <span className="text-xs font-mono text-emerald-400 font-bold">{e.confidence}% Conf.</span>
                    </div>
                    <p className="text-xs text-slate-200 italic bg-slate-950 p-3 rounded-lg border border-slate-800">
                      "{e.excerpt}"
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
