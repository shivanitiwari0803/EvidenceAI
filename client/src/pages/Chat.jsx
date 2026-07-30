import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  Trash2,
  FileText,
  ArrowLeft,
  Loader2,
  Copy,
  Check,
  Bot,
  User,
  PlusCircle,
  ArrowDown,
  Lock,
  CheckCircle2,
  XCircle,
  ArrowRight
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useResearch } from '../context/ResearchContext';
import { useToast } from '../context/ToastContext';

export const Chat = () => {
  const { researchId: paramResearchId } = useParams();
  const navigate = useNavigate();
  const {
    currentResearch,
    currentBrief,
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
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const userJustSentRef = useRef(false);

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
    if (userJustSentRef.current || isUserAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      userJustSentRef.current = false;
    }
  }, [chatMessages, chatLoading]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isBottom = scrollHeight - scrollTop - clientHeight < 80;
    setIsUserAtBottom(isBottom);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setIsUserAtBottom(true);
  };

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || chatLoading || !currentResearch?._id) return;

    const msg = inputMessage;
    setInputMessage('');
    userJustSentRef.current = true;
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
      <div className="space-y-6 max-w-4xl mx-auto py-16 text-center">
        <div className="h-12 w-12 mx-auto rounded-xl bg-[#1F150C]/10 border border-[#1F150C]/20 flex items-center justify-center text-[#1F150C] animate-spin">
          <MessageSquare className="w-6 h-6" />
        </div>
        <p className="text-base text-[#5E5648] font-medium">Loading chat workspace...</p>
      </div>
    );
  }

  if (!currentResearch && (!history || history.length === 0)) {
    return (
      <Card className="p-12 text-center space-y-6 max-w-3xl mx-auto my-12 bg-[#FAF8F2] border border-[#CBC3B2]">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-[#1F150C]/10 border border-[#1F150C]/20 flex items-center justify-center text-[#1F150C]">
          <MessageSquare className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#1F150C]">No Active Research Project</h2>
          <p className="text-base text-[#5E5648]">
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

  /* STEP VALIDATION SAFEGUARD */
  if (currentResearch && !currentBrief) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto font-sans">
        <Card className="p-10 text-center space-y-6 bg-[#FAF8F2] border border-[#CBC3B2] shadow-2xs">
          <div className="h-16 w-16 mx-auto rounded-2xl bg-[#D97706]/10 border border-[#D97706]/30 flex items-center justify-center text-[#D97706]">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <Badge variant="amber">Step Locked: Brief Synthesis Required</Badge>
            <h2 className="text-3xl font-bold text-[#1F150C] tracking-tight">Complete Previous Step</h2>
            <p className="text-base text-[#5E5648] max-w-lg mx-auto leading-relaxed">
              Generate and review the Research Brief before starting evidence-grounded conversations for "{currentResearch.title}".
            </p>
          </div>

          <div className="bg-[#EDE8D8] p-5 rounded-xl border border-[#CBC3B2] max-w-md mx-auto space-y-3 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5E5648] block">Prerequisite Checklist:</span>
            <div className="space-y-2 text-sm font-semibold">
              <div className="flex items-center gap-2 text-[#1F150C]">
                <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
                <span>1. Retrieve & Audit Evidence Claims</span>
              </div>
              <div className="flex items-center gap-2 text-[#B3261E]">
                <XCircle className="w-5 h-5 text-[#B3261E]" />
                <span>2. Synthesize 12-Section Research Brief (Missing)</span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(`/brief/${currentResearch._id}`)}
            icon={ArrowRight}
          >
            Go to Research Brief Synthesis
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto flex flex-col h-[calc(100vh-140px)] font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="space-y-1">
          <Link
            to={`/details/${currentResearch._id}`}
            className="text-sm font-semibold text-[#5E5648] hover:text-[#1F150C] flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Research Workspace
          </Link>
          <h1 className="text-2xl font-bold text-[#1F150C] tracking-tight flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-[#1F150C]" />
            Evidence-Grounded AI Assistant
          </h1>
          <p className="text-base text-[#5E5648]">
            Answers are generated strictly from stored empirical evidence for "{currentResearch.title}".
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="danger"
            size="md"
            onClick={() => clearChatHistory(currentResearch._id)}
            icon={Trash2}
          >
            Clear History
          </Button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="relative flex-1 flex flex-col min-h-0 bg-[#FAF8F2] border border-[#CBC3B2] rounded-2xl overflow-hidden shadow-2xs">
        {/* Scrollable Messages Area */}
        <div
          ref={chatContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-8 space-y-8"
        >
          {/* Welcome Message */}
          <div className="flex items-start gap-4 bg-[#EDE8D8] border border-[#CBC3B2] p-6 rounded-2xl">
            <div className="h-10 w-10 rounded-xl bg-[#1F150C] text-[#FFFFFF] flex items-center justify-center shrink-0 font-bold">
              <Bot className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 text-base text-[#1F150C]">
              <h3 className="font-bold text-[#1F150C] text-lg">Grounded RAG Assistant Ready</h3>
              <p className="leading-relaxed text-[#5E5648]">
                I can answer follow-up questions regarding <strong>"{currentResearch.title}"</strong> strictly using extracted document evidence.
              </p>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#5E5648] uppercase tracking-wider block">Suggested Questions:</span>
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickQuestion(qp)}
                  className="px-4 py-2.5 rounded-xl bg-[#EDE8D8] hover:bg-[#D7D0BE] border border-[#CBC3B2] text-sm font-medium text-[#1F150C] transition-colors text-left"
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
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-[#FFFFFF] font-bold text-sm ${
                  msg.role === 'user' ? 'bg-[#5E5648]' : 'bg-[#1F150C]'
                }`}
              >
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              <div
                className={`max-w-3xl space-y-3 p-6 rounded-2xl text-base leading-relaxed border ${
                  msg.role === 'user'
                    ? 'bg-[#EDE8D8] border-[#CBC3B2] text-[#1F150C]'
                    : 'bg-[#FAF8F2] border-[#CBC3B2] text-[#1F150C]'
                }`}
              >
                <div className="flex items-center justify-between gap-4 border-b border-[#CBC3B2] pb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#5E5648]">
                    {msg.role === 'user' ? 'You' : 'EvidenceAI Assistant'}
                  </span>
                  <div className="flex items-center gap-2">
                    {msg.latencyMs > 0 && (
                      <span className="text-xs font-mono text-[#5E5648]">{msg.latencyMs}ms</span>
                    )}
                    <button
                      onClick={() => handleCopyText(msg.content, idx)}
                      className="text-[#5E5648] hover:text-[#1F150C] p-1"
                      title="Copy text"
                    >
                      {copiedIdx === idx ? <Check className="w-4 h-4 text-[#2E7D32]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <p className="whitespace-pre-line font-sans text-base leading-relaxed text-[#1F150C]">{msg.content}</p>

                {/* Inline Citation Pills */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-3 border-t border-[#CBC3B2] space-y-2">
                    <span className="text-xs font-bold text-[#5E5648] uppercase tracking-wider block">
                      Traceable Citations:
                    </span>
                    <div className="space-y-2">
                      {msg.citations.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-3 rounded-xl bg-[#EDE8D8] border border-[#CBC3B2] text-sm text-[#1F150C] space-y-1 font-mono"
                        >
                          <div className="flex items-center gap-2 text-[#1F150C] font-semibold">
                            <FileText className="w-4 h-4 shrink-0 text-[#5E5648]" />
                            <span>{c.docName}</span>
                            <span className="text-[#5E5648]">• Chunk {c.chunkNumber}</span>
                          </div>
                          <p className="text-xs text-[#5E5648] italic">"{c.excerpt}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {chatLoading && (
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-[#1F150C] text-[#FFFFFF] flex items-center justify-center animate-pulse">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-[#EDE8D8] border border-[#CBC3B2] p-5 rounded-2xl space-y-2 animate-pulse min-w-[240px]">
                <div className="h-4 bg-[#CBC3B2] rounded w-3/4"></div>
                <div className="h-3 bg-[#CBC3B2]/60 rounded w-1/2"></div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Scroll-to-Bottom Button */}
        {!isUserAtBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-20 right-8 p-3 px-4 rounded-full bg-[#1F150C] hover:bg-[#382819] text-[#FFFFFF] shadow-lg transition-all flex items-center gap-2 text-sm font-semibold"
            title="Scroll to bottom"
          >
            <ArrowDown className="w-4 h-4" />
            <span>Scroll</span>
          </button>
        )}

        {/* Input Form Footer */}
        <form onSubmit={handleSend} className="p-4 bg-[#EDE8D8] border-t border-[#CBC3B2] flex items-center gap-3 shrink-0">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask a question grounded strictly in uploaded evidence..."
            className="flex-1 h-[50px] px-4 py-3 bg-[#FAF8F2] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] placeholder:text-[#5E5648] focus:outline-none focus:border-[#1F150C]"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputMessage.trim() || chatLoading}
            icon={chatLoading ? Loader2 : Send}
            className={chatLoading ? 'animate-spin' : ''}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
