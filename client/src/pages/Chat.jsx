import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Trash2,
  Sparkles,
  FileText,
  Clock,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  Bot,
  User,
  HelpCircle,
  PlusCircle
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useResearch } from '../context/ResearchContext';
import { useToast } from '../context/ToastContext';

export const Chat = () => {
  const { researchId: paramResearchId } = useParams();
  const {
    currentResearch,
    chatMessages,
    history,
    fetchHistory,
    loadResearch,
    sendChatMessage,
    clearChatHistory,
    chatLoading,
    loading
  } = useResearch();

  const { showToast } = useToast();
  const activeResId = paramResearchId || currentResearch?._id;

  const [inputMessage, setInputMessage] = useState('');
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    if (activeResId) {
      loadResearch(activeResId);
    } else if (history && history.length > 0 && !currentResearch) {
      loadResearch(history[0]._id);
    }
  }, [activeResId, history, currentResearch, loadResearch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatLoading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || chatLoading || !currentResearch?._id) return;

    const msg = inputMessage;
    setInputMessage('');
    try {
      await sendChatMessage(currentResearch._id, msg);
    } catch (err) {
      // Toast error handled in context
    }
  };

  const handleQuickQuestion = (qText) => {
    setInputMessage(qText);
  };

  const handleCopyText = (content, idx) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    showToast('Message copied to clipboard');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const quickPrompts = [
    'What evidence supports the primary thesis?',
    'Summarize conflicting empirical findings.',
    'What evidence is weakest across evaluated steps?',
    'Which documents discuss system latency or vulnerabilities?'
  ];

  if (loading && !currentResearch) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-12 text-center">
        <div className="h-12 w-12 mx-auto rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 animate-spin">
          <MessageSquare className="w-6 h-6" />
        </div>
        <p className="text-sm text-slate-300">Loading evidence-based chat workspace...</p>
      </div>
    );
  }

  if (!currentResearch && (!history || history.length === 0)) {
    return (
      <Card className="p-12 text-center space-y-6 max-w-2xl mx-auto my-12 bg-slate-900/80">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-950/80 border border-indigo-800 flex items-center justify-center text-indigo-400">
          <MessageSquare className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">No Active Research Project Found</h2>
          <p className="text-base text-slate-300">
            Create a research project to interact with the Evidence-Grounded AI Chat Assistant.
          </p>
        </div>
        <Link to="/new">
          <Button variant="primary" size="lg" icon={PlusCircle}>
            Create New Research Project
          </Button>
        </Link>
      </Card>
    );
  }

  if (!currentResearch) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto py-12 text-center">
        <div className="h-12 w-12 mx-auto rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 animate-spin">
          <MessageSquare className="w-6 h-6" />
        </div>
        <p className="text-sm text-slate-300">Selecting active research workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="space-y-1">
          <Link
            to={`/details/${currentResearch._id}`}
            className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 mb-1"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Research Workspace
          </Link>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <MessageSquare className="w-7 h-7 text-indigo-400" />
            Evidence-Grounded AI Assistant
          </h1>
          <p className="text-xs text-slate-300">
            Answers are generated strictly from stored empirical evidence for "{currentResearch.title}".
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearChatHistory(currentResearch._id)}
            icon={Trash2}
            className="text-rose-400 hover:text-rose-300 border border-rose-900/40"
          >
            Clear History
          </Button>
        </div>
      </div>

      {/* Main Chat Messages Container */}
      <Card className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/90 border-slate-800 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Welcome Message */}
          <div className="flex items-start gap-4 bg-indigo-950/40 border border-indigo-800/60 p-5 rounded-2xl">
            <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div className="space-y-2 text-sm text-slate-200">
              <h3 className="font-bold text-white text-base">Evidence-Grounded RAG Assistant Ready</h3>
              <p className="leading-relaxed">
                I can answer follow-up questions regarding <strong>"{currentResearch.title}"</strong> strictly using extracted document evidence. I will never hallucinate or invent unverified claims.
              </p>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">Suggested Questions:</span>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(qp)}
                  className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-indigo-300 transition-colors text-left"
                >
                  💬 {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Stream */}
          {chatMessages.map((msg, idx) => (
            <div
              key={msg._id || idx}
              className={`flex items-start gap-4 ${
                msg.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-indigo-600 text-white'
                }`}
              >
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              <div
                className={`max-w-2xl space-y-3 p-5 rounded-2xl text-sm leading-relaxed border ${
                  msg.role === 'user'
                    ? 'bg-purple-950/60 border-purple-800/80 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-100'
                }`}
              >
                <div className="flex items-center justify-between gap-4 border-b border-slate-800/60 pb-2">
                  <span className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                    {msg.role === 'user' ? 'You' : 'EvidenceAI Assistant'}
                  </span>
                  <div className="flex items-center gap-2">
                    {msg.latencyMs > 0 && (
                      <span className="text-[11px] font-mono text-slate-400">{msg.latencyMs}ms</span>
                    )}
                    <button
                      onClick={() => handleCopyText(msg.content, idx)}
                      className="text-slate-400 hover:text-white p-1"
                      title="Copy text"
                    >
                      {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <p className="whitespace-pre-line font-sans">{msg.content}</p>

                {/* Inline Citation Chips */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-2">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                      Evidence Citations:
                    </span>
                    <div className="space-y-2">
                      {msg.citations.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1 font-mono"
                        >
                          <div className="flex items-center gap-2 text-indigo-300 font-bold">
                            <FileText className="w-3.5 h-3.5 text-indigo-400" />
                            <span>{c.docName}</span>
                            <span className="text-slate-400">• Chunk {c.chunkNumber}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 italic">"{c.excerpt}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Skeleton */}
          {chatLoading && (
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-2 animate-pulse min-w-[250px]">
                <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                <div className="h-3 bg-slate-800/60 rounded w-1/2"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="pt-4 border-t border-slate-800 flex items-center gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a question grounded strictly in uploaded evidence..."
            className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!inputMessage.trim() || chatLoading}
            icon={chatLoading ? Loader2 : Send}
            className={chatLoading ? 'animate-spin' : ''}
          >
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Chat;
