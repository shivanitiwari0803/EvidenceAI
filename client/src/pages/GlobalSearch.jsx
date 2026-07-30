import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BrainCircuit,
  FileText,
  Layers,
  ArrowRight
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
    <div className="space-y-12 max-w-6xl mx-auto font-sans">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#1F150C] tracking-tight flex items-center gap-3">
          <Search className="w-8 h-8 text-[#1F150C]" />
          Universal Global Search
        </h1>
        <p className="text-lg text-[#5E5648] leading-relaxed">
          Search across research projects, source documents, classified evidence, research briefs, and conversation history.
        </p>
      </div>

      {/* Search Bar & Filters */}
      <Card className="p-8 space-y-6 bg-[#F8F6EF] border border-[#CBC3B2]">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5E5648]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across projects, documents, evidence excerpts, or chats..."
              className="w-full h-[50px] pl-12 pr-4 bg-[#E1DCC9] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] placeholder:text-[#5E5648] focus:outline-none focus:border-[#1F150C]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {['all', 'projects', 'documents', 'evidence', 'briefs'].map((t) => (
              <button
                type="button"
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-colors h-[50px] ${
                  filterType === t
                    ? 'bg-[#1F150C] text-[#FFFFFF]'
                    : 'bg-[#E1DCC9] text-[#1F150C] hover:bg-[#D7D0BE] border border-[#CBC3B2]'
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
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-[#5E5648]">
              Found {results.resultsCount} matches for "{query}"
            </span>
          </div>

          {/* Research Projects Results */}
          {results.projects?.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#1F150C] flex items-center gap-3">
                <BrainCircuit className="w-6 h-6 text-[#1F150C]" />
                Research Projects ({results.projects.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.projects.map((p) => (
                  <Card key={p._id} className="p-6 space-y-3 bg-[#F8F6EF] border border-[#CBC3B2]">
                    <div className="flex items-center justify-between">
                      <Badge variant="emerald">{p.status}</Badge>
                      <Link to={`/details/${p._id}`}>
                        <Button variant="ghost" size="sm" icon={ArrowRight}>Open</Button>
                      </Link>
                    </div>
                    <h3 className="font-bold text-[#1F150C] text-lg">{p.title}</h3>
                    <p className="text-base text-[#5E5648] line-clamp-2">"{p.researchQuestion}"</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Documents Results */}
          {results.documents?.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#1F150C] flex items-center gap-3">
                <FileText className="w-6 h-6 text-[#1F150C]" />
                Documents ({results.documents.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.documents.map((d) => (
                  <Card key={d._id} className="p-6 space-y-3 bg-[#F8F6EF] border border-[#CBC3B2]">
                    <div className="flex items-center justify-between">
                      <Badge variant="indigo">{d.mimeType || 'Document'}</Badge>
                      <span className="text-sm text-[#5E5648] font-mono">{d.chunkCount} Chunks</span>
                    </div>
                    <h3 className="font-bold text-[#1F150C] text-lg">{d.filename}</h3>
                    <p className="text-base text-[#5E5648] line-clamp-2">{d.rawText}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Results */}
          {results.evidence?.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-[#1F150C] flex items-center gap-3">
                <Layers className="w-6 h-6 text-[#1F150C]" />
                Evidence Items ({results.evidence.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.evidence.map((e) => (
                  <Card key={e._id} className="p-6 space-y-3 bg-[#F8F6EF] border border-[#CBC3B2]">
                    <div className="flex items-center justify-between">
                      <Badge variant={e.classification === 'Supporting' ? 'emerald' : 'amber'}>
                        {e.classification}
                      </Badge>
                      <span className="text-sm font-mono text-[#2E7D32] font-bold">{e.confidence}% Conf.</span>
                    </div>
                    <p className="text-base text-[#1F150C] italic bg-[#E1DCC9] p-4 rounded-xl border border-[#CBC3B2]">
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
