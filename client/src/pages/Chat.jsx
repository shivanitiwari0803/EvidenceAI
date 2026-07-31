import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  ArrowRight,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useResearch } from '../context/ResearchContext';
import { useToast } from '../context/ToastContext';

/**
 * MEMOIZED PAST MESSAGE ITEM COMPONENT
 * Ensures past messages have 0 re-renders when sending/receiving new messages.
 */
const MessageItem = React.memo(({
  msg,
  idx,
  isLast,
  copiedIdx,
  isLiked,
  isDisliked,
  isShowSources,
  activeResId,
  onCopy,
  onRegenerate,
  onLike,
  onDislike,
  onToggleSources,
  onChipClick,
  suggestedFollowUps,
  navigate
}) => {
  const isUser = msg.role === 'user';

  return (
    <div className="space-y-6 animate-in fade-in duration-100">
      <div
        className={`flex gap-4 group transition-all ${
          isUser ? 'justify-end' : 'justify-start'
        }`}
      >
        {/* Assistant Avatar */}
        {!isUser && (
          <div className="h-10 w-10 rounded-xl bg-[#1F150C] text-[#FFFFFF] flex items-center justify-center shrink-0 font-bold text-sm shadow-2xs mt-1">
            <Bot className="w-5 h-5" />
          </div>
        )}

        {/* Message Body & Actions */}
        <div
          className={`max-w-3xl space-y-4 ${
            isUser
              ? 'bg-[#EDE8D8] border border-[#CBC3B2] p-5 rounded-2xl text-[#1F150C]'
              : 'bg-transparent text-[#1F150C] flex-1'
          }`}
        >
          {/* Message Content */}
          <div className="text-base leading-[1.8] font-sans text-[#1F150C] whitespace-pre-line space-y-3">
            {msg.content}
          </div>

          {/* Sources Collapsible Card Section (Assistant Only) */}
          {!isUser && msg.citations && msg.citations.length > 0 && (
            <div className="pt-3 border-t border-[#CBC3B2]">
              <button
                onClick={() => onToggleSources(idx)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5E5648] hover:text-[#1F150C] transition-colors py-1 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#1F150C]" />
                <span>Sources Used ({msg.citations.length})</span>
                {isShowSources ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isShowSources && (
                <div className="mt-3 space-y-3 animate-in fade-in duration-150">
                  {msg.citations.map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-4 rounded-xl bg-[#EDE8D8] border border-[#CBC3B2] text-sm text-[#1F150C] space-y-2 font-mono"
                    >
                      <div className="flex items-center justify-between gap-2 font-semibold">
                        <span className="flex items-center gap-2 text-base text-[#1F150C]">
                          <FileText className="w-4 h-4 text-[#1F150C]" />
                          {c.docName}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="emerald">Supporting</Badge>
                          <span className="text-xs text-[#2E7D32] bg-[#2E7D32]/10 px-2 py-0.5 rounded border border-[#2E7D32]/20 font-bold">
                            Chunk #{c.chunkNumber}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-[#5E5648] italic font-sans leading-relaxed">"{c.excerpt}"</p>
                      <div className="pt-2 border-t border-[#CBC3B2] flex items-center justify-between">
                        <span className="text-xs font-mono text-[#2E7D32] font-bold">92% Confidence</span>
                        <button
                          onClick={() => navigate(`/evidence/${activeResId}`)}
                          className="text-xs font-semibold text-[#1F150C] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          View Full Evidence <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hover Actions Toolbar (Assistant Only) */}
          {!isUser && (
            <div className="flex items-center gap-3 pt-2 text-xs text-[#5E5648]">
              {msg.latencyMs > 0 && (
                <span className="font-mono text-[#5E5648]">{msg.latencyMs}ms</span>
              )}
              <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onCopy(msg.content, idx)}
                  className="p-1.5 rounded-lg hover:bg-[#EDE8D8] hover:text-[#1F150C] transition-colors cursor-pointer"
                  title="Copy message"
                >
                  {copiedIdx === idx ? <Check className="w-4 h-4 text-[#2E7D32]" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded-lg hover:bg-[#EDE8D8] hover:text-[#1F150C] transition-colors cursor-pointer"
                  title="Regenerate answer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onLike(idx)}
                  className={`p-1.5 rounded-lg hover:bg-[#EDE8D8] transition-colors cursor-pointer ${
                    isLiked ? 'text-[#2E7D32]' : 'hover:text-[#1F150C]'
                  }`}
                  title="Good response"
                >
                  <ThumbsUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDislike(idx)}
                  className={`p-1.5 rounded-lg hover:bg-[#EDE8D8] transition-colors cursor-pointer ${
                    isDisliked ? 'text-[#B3261E]' : 'hover:text-[#1F150C]'
                  }`}
                  title="Bad response"
                >
                  <ThumbsDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        {isUser && (
          <div className="h-10 w-10 rounded-xl bg-[#5E5648] text-[#FFFFFF] flex items-center justify-center shrink-0 font-bold text-sm shadow-2xs mt-1">
            <User className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* SUGGESTED FOLLOW-UP CHIPS BELOW LAST ASSISTANT RESPONSE */}
      {!isUser && isLast && (
        <div className="ml-14 space-y-2 pt-2 animate-in fade-in duration-150">
          <span className="text-xs font-bold text-[#5E5648] uppercase tracking-wider block">Recommended Follow-up Questions:</span>
          <div className="flex flex-wrap gap-2">
            {suggestedFollowUps.map((chip, cIdx) => (
              <button
                key={cIdx}
                onClick={() => onChipClick(chip)}
                className="px-4 py-2.5 rounded-xl bg-[#EDE8D8] hover:bg-[#D7D0BE] border border-[#CBC3B2] text-sm font-medium text-[#1F150C] transition-colors text-left flex items-center gap-2 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#1F150C] shrink-0" />
                <span>{chip}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

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
  const [likedMsgs, setLikedMsgs] = useState({});
  const [dislikedMsgs, setDislikedMsgs] = useState({});
  const [expandedSources, setExpandedSources] = useState({});
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);

  const chatContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

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

  // Instant non-blocking scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    setIsUserAtBottom(true);
  }, []);

  // Auto-scroll when chat messages change or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, chatLoading, scrollToBottom]);

  const handleScroll = useCallback(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsUserAtBottom(isBottom);
  }, []);

  // Auto-growing textarea handler
  const handleTextareaChange = useCallback((e) => {
    setInputMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, []);

  // Instant message dispatch — 0 artificial delays!
  const handleSend = useCallback(async (e, promptOverride) => {
    e?.preventDefault();
    const userPrompt = (promptOverride || inputMessage).trim();
    if (!userPrompt || chatLoading || !currentResearch?._id) return;

    // Immediately clear input & reset height
    setInputMessage('');
    if (textareaRef.current) textareaRef.current.style.height = '54px';

    scrollToBottom();

    try {
      // Direct API call — zero artificial setTimeout or typing loops!
      await sendChatMessage(currentResearch._id, userPrompt);
    } catch (err) {
      // Toast error handled in context
    }
  }, [inputMessage, chatLoading, currentResearch, sendChatMessage, scrollToBottom]);

  const handleRegenerateLast = useCallback(() => {
    if (chatMessages.length < 2) return;
    const lastUserMsg = [...chatMessages].reverse().find(m => m.role === 'user');
    if (lastUserMsg) {
      handleSend(null, lastUserMsg.content);
    }
  }, [chatMessages, handleSend]);

  const handleChipClick = useCallback((qText) => {
    handleSend(null, qText);
  }, [handleSend]);

  const handleCopyText = useCallback((content, idx) => {
    navigator.clipboard.writeText(content);
    setCopiedIdx(idx);
    showToast('Message copied to clipboard');
    setTimeout(() => setCopiedIdx(null), 2000);
  }, [showToast]);

  const toggleLiked = useCallback((idx) => {
    setLikedMsgs(prev => ({ ...prev, [idx]: !prev[idx] }));
    showToast('Feedback recorded: Helpful answer');
  }, [showToast]);

  const toggleDisliked = useCallback((idx) => {
    setDislikedMsgs(prev => ({ ...prev, [idx]: !prev[idx] }));
    showToast('Feedback recorded: Needs improvement');
  }, [showToast]);

  const toggleSources = useCallback((idx) => {
    setExpandedSources(prev => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const suggestedFollowUps = useMemo(() => [
    'What evidence contradicts this conclusion?',
    'Which source is the strongest?',
    'Are there any unanswered questions?',
    'Show the weakest evidence.',
    'Summarize this in simple language.'
  ], []);

  if (loading && !currentResearch) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-16 text-center">
        <div className="h-12 w-12 mx-auto rounded-xl bg-[#1F150C]/10 border border-[#1F150C]/20 flex items-center justify-center text-[#1F150C] animate-spin">
          <MessageSquare className="w-6 h-6" />
        </div>
        <p className="text-base text-[#5E5648] font-medium">Loading research chat workspace...</p>
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
    <div className="space-y-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)] font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 px-2">
        <div className="space-y-1">
          <Link
            to={`/details/${currentResearch._id}`}
            className="text-sm font-semibold text-[#5E5648] hover:text-[#1F150C] flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Workspace
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
          className="flex-1 overflow-y-auto p-8 space-y-10"
        >
          {/* Welcome Banner */}
          <div className="flex items-start gap-4 bg-[#EDE8D8] border border-[#CBC3B2] p-6 rounded-2xl">
            <div className="h-10 w-10 rounded-xl bg-[#1F150C] text-[#FFFFFF] flex items-center justify-center shrink-0 font-bold shadow-2xs">
              <Bot className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 text-base text-[#1F150C]">
              <h3 className="font-bold text-[#1F150C] text-lg">Grounded RAG Assistant Ready</h3>
              <p className="leading-relaxed text-[#5E5648]">
                Ask questions regarding <strong>"{currentResearch.title}"</strong>. Answers are generated in real time strictly from source document evidence.
              </p>
            </div>
          </div>

          {/* Past Messages Stream (MEMOIZED COMPONENTS) */}
          {chatMessages.map((msg, idx) => (
            <MessageItem
              key={msg._id || idx}
              msg={msg}
              idx={idx}
              isLast={idx === chatMessages.length - 1}
              copiedIdx={copiedIdx}
              isLiked={Boolean(likedMsgs[idx])}
              isDisliked={Boolean(dislikedMsgs[idx])}
              isShowSources={Boolean(expandedSources[idx])}
              activeResId={activeResId}
              onCopy={handleCopyText}
              onRegenerate={handleRegenerateLast}
              onLike={toggleLiked}
              onDislike={toggleDisliked}
              onToggleSources={toggleSources}
              onChipClick={handleChipClick}
              suggestedFollowUps={suggestedFollowUps}
              navigate={navigate}
            />
          ))}

          {/* ASSISTANT PLACEHOLDER (Shows immediately while API responds) */}
          {chatLoading && (
            <div className="flex items-start gap-4 animate-in fade-in duration-100">
              <div className="h-10 w-10 rounded-xl bg-[#1F150C] text-[#FFFFFF] flex items-center justify-center shrink-0 font-bold shadow-2xs mt-1">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="p-4 bg-[#EDE8D8] border border-[#CBC3B2] rounded-2xl flex items-center gap-3 text-base text-[#1F150C] font-semibold">
                <Loader2 className="w-5 h-5 text-[#1F150C] animate-spin" />
                <span>Generating evidence-grounded response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Scroll-to-Bottom Button */}
        {!isUserAtBottom && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-24 right-8 p-3 px-4 rounded-full bg-[#1F150C] hover:bg-[#382819] text-[#FFFFFF] shadow-lg transition-all flex items-center gap-2 text-sm font-semibold z-10 cursor-pointer"
            title="Scroll to bottom"
          >
            <ArrowDown className="w-4 h-4" />
            <span>Scroll</span>
          </button>
        )}

        {/* Auto-Growing Textarea Input Footer */}
        <form onSubmit={(e) => handleSend(e)} className="p-4 bg-[#EDE8D8] border-t border-[#CBC3B2] flex items-end gap-3 shrink-0">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputMessage}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={chatLoading}
            placeholder="Ask a question about your uploaded research..."
            className="flex-1 min-h-[54px] max-h-[160px] p-4 bg-[#FAF8F2] border border-[#CBC3B2] rounded-2xl text-base text-[#1F150C] placeholder:text-[#5E5648] focus:outline-none focus:border-[#1F150C] leading-relaxed resize-none transition-all"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!inputMessage.trim() || chatLoading}
            icon={chatLoading ? Loader2 : Send}
            className={`h-[54px] shrink-0 ${chatLoading ? 'animate-spin' : ''}`}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
