import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Sliders,
  Cpu,
  Loader2
} from 'lucide-react';
import Card from '../components/common/Card';
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
    <div className="space-y-12 max-w-5xl mx-auto font-sans">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-[#1F150C] tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-[#1F150C]" />
          Workspace System Settings
        </h1>
        <p className="text-lg text-[#5E5648] leading-relaxed">
          Configure default AI models, citation format, retrieval chunk thresholds, and export defaults.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="p-8 space-y-8 bg-[#F8F6EF] border border-[#CBC3B2]">
          <div className="space-y-2 border-b border-[#CBC3B2] pb-4">
            <h2 className="text-xl font-bold text-[#1F150C] flex items-center gap-3">
              <Cpu className="w-6 h-6 text-[#1F150C]" />
              AI Model Configuration
            </h2>
            <p className="text-base text-[#5E5648]">Grounded LLM engine and prompt parameter settings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-base font-semibold text-[#1F150C]">Default Model</label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="w-full h-[50px] px-4 py-3 bg-[#E1DCC9] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] focus:outline-none focus:border-[#1F150C]"
              >
                <option value="gpt-4o-mini">Gemini 2.5 Flash / GPT-4o-mini (Recommended)</option>
                <option value="gpt-4o">GPT-4o (High Precision Synthesis)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-base font-semibold text-[#1F150C]">LLM Temperature ({temperature})</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-3 bg-[#E1DCC9] rounded-xl appearance-none cursor-pointer accent-[#1F150C] mt-3"
              />
              <p className="text-sm text-[#5E5648]">Lower temperature ensures strict factual adherence to evidence.</p>
            </div>
          </div>

          <div className="space-y-2 border-b border-[#CBC3B2] pb-4 pt-4">
            <h2 className="text-xl font-bold text-[#1F150C] flex items-center gap-3">
              <Sliders className="w-6 h-6 text-[#1F150C]" />
              RAG & Citation Preferences
            </h2>
            <p className="text-base text-[#5E5648]">Semantic evidence retrieval and export formats.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-base font-semibold text-[#1F150C]">Citation Style</label>
              <select
                value={citationStyle}
                onChange={(e) => setCitationStyle(e.target.value)}
                className="w-full h-[50px] px-4 py-3 bg-[#E1DCC9] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] focus:outline-none focus:border-[#1F150C]"
              >
                <option value="IEEE">IEEE (Document Name & Chunk ID)</option>
                <option value="APA">APA Style Excerpt References</option>
                <option value="Harvard">Harvard Reference Tags</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-base font-semibold text-[#1F150C]">Max Chunks Per Step</label>
              <input
                type="number"
                min="1"
                max="20"
                value={retrievalCount}
                onChange={(e) => setRetrievalCount(parseInt(e.target.value))}
                className="w-full h-[50px] px-4 py-3 bg-[#E1DCC9] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] focus:outline-none focus:border-[#1F150C]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-base font-semibold text-[#1F150C]">Default Export Format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="w-full h-[50px] px-4 py-3 bg-[#E1DCC9] border border-[#CBC3B2] rounded-xl text-base text-[#1F150C] focus:outline-none focus:border-[#1F150C]"
              >
                <option value="markdown">Markdown (.md)</option>
                <option value="pdf">PDF / Printable HTML</option>
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-[#CBC3B2] flex justify-end">
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
