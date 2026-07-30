import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Sliders,
  Cpu,
  FileCode,
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useResearch } from '../context/ResearchContext';
import { useToast } from '../context/ToastContext';

export const SettingsPage = () => {
  const { userSettings, fetchSettings, updateSettings } = useResearch();
  const { showToast } = useToast();

  const [defaultModel, setDefaultModel] = useState('gpt-4o-mini');
  const [citationStyle, setCitationStyle] = useState('IEEE');
  const [retrievalCount, setRetrievalCount] = useState(5);
  const [temperature, setTemperature] = useState(0.2);
  const [exportFormat, setExportFormat] = useState('markdown');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (userSettings) {
      setDefaultModel(userSettings.defaultModel || 'gpt-4o-mini');
      setCitationStyle(userSettings.citationStyle || 'IEEE');
      setRetrievalCount(userSettings.retrievalCount || 5);
      setTemperature(userSettings.temperature || 0.2);
      setExportFormat(userSettings.exportFormat || 'markdown');
    }
  }, [userSettings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateSettings({
        defaultModel,
        citationStyle,
        retrievalCount: Number(retrievalCount),
        temperature: Number(temperature),
        exportFormat
      });
    } catch (err) {
      // Toast error handled in context
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-indigo-400" />
          Workspace System Settings
        </h1>
        <p className="text-base text-slate-300 leading-relaxed">
          Configure default AI models, citation format, retrieval chunk thresholds, and export defaults.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-8 space-y-6 border-slate-800">
          <div className="space-y-2 border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-400" />
              AI Model Configuration
            </h2>
            <p className="text-xs text-slate-400">OpenAI-compatible language model engine settings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-200">Default Model</label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 focus:outline-none focus:border-indigo-500 min-h-[48px]"
              >
                <option value="gpt-4o-mini">gpt-4o-mini (Recommended - Fast & Accurate)</option>
                <option value="gpt-4o">gpt-4o (High Precision Synthesis)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (OpenAI Proxy)</option>
                <option value="deepseek-r1">DeepSeek R1 (OpenAI Proxy)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-200">LLM Temperature ({temperature})</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-3 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <p className="text-xs text-slate-400">Lower temperature ensures strict factual adherence to evidence.</p>
            </div>
          </div>

          <div className="space-y-2 border-b border-slate-800 pb-4 pt-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              RAG & Citation Preferences
            </h2>
            <p className="text-xs text-slate-400">Semantic evidence retrieval and export formats.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-200">Citation Style</label>
              <select
                value={citationStyle}
                onChange={(e) => setCitationStyle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 focus:outline-none focus:border-indigo-500 min-h-[48px]"
              >
                <option value="IEEE">IEEE (Document Name & Chunk ID)</option>
                <option value="APA">APA Style Excerpt References</option>
                <option value="Harvard">Harvard Reference Tags</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-200">Max Chunks Per Step</label>
              <input
                type="number"
                min="1"
                max="20"
                value={retrievalCount}
                onChange={(e) => setRetrievalCount(parseInt(e.target.value))}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 focus:outline-none focus:border-indigo-500 min-h-[48px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-200">Default Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-base text-slate-100 focus:outline-none focus:border-indigo-500 min-h-[48px]"
              >
                <option value="markdown">Markdown (.md)</option>
                <option value="pdf">PDF / Printable HTML</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSaving}
              icon={isSaving ? Loader2 : Save}
              className={isSaving ? 'animate-pulse' : ''}
            >
              {isSaving ? 'Saving Settings...' : 'Save Settings'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default SettingsPage;
