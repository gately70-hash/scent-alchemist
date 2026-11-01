'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  Sparkles, Layers, FlaskConical, 
  Flame, Camera, Upload, X, Loader2, 
  Trash2, Plus, RotateCcw 
} from 'lucide-react';

const POPULAR_PRESETS = [
  "Dior Sauvage EdT", "Bleu de Chanel EdP", "Creed Aventus", 
  "Lattafa Asad", "Armaf Club de Nuit Intense Man", "Zara Warm Black",
  "Maison Margiela By the Fireplace", "Tom Ford Noir Extreme",
  "Kilian Angels Share", "Versace Eros EdT", "Afnan 9PM", "Lattafa Khamrah"
];

const TARGET_PRESETS = [
  {
    name: "Angels Share",
    house: "Kilian Paris",
    retail: "£200+ (50ml)",
    notes: ["Cognac", "Cinnamon", "Tonka Bean", "Oak Wood", "Praline", "Vanilla"],
    solo: {
      name: "Lattafa Khamrah",
      price: "~£25",
      match: "88%",
      desc: "Sweeter and more date-heavy than Angels Share, missing some dry cognac oak, but identical in sillage."
    },
    duo: {
      base: "Lattafa Khamrah (2 sprays)",
      accent: "Zara Sand Desert At Sunset (1 spray)",
      match: "94%",
      desc: "The dry iris, cedarwood, and booze in Zara cuts the syrupy date sweetness of Khamrah, creating charred cognac barrel accords."
    }
  },
  {
    name: "Lost Cherry",
    house: "Tom Ford",
    retail: "£280+ (50ml)",
    notes: ["Black Cherry", "Bitter Almond", "Griotte Syrup", "Tonka", "Peru Balsam"],
    solo: {
      name: "Maison Alhambra Lovely Cherie",
      price: "~£20",
      match: "89%",
      desc: "Very close bitter almond and cherry liqueur profile, fading to powdery tonka by hour 4."
    },
    duo: {
      base: "Lovely Cherie (2 sprays)",
      accent: "Tom Ford Noir Extreme / Zara Warm Black (1 spray)",
      match: "95%",
      desc: "Anchoring cherry over warm amber-kulfi gives it projection and mirrors the smoky drydown of Tom Ford."
    }
  },
  {
    name: "Sauvage Elixir",
    house: "Dior",
    retail: "£140+ (60ml)",
    notes: ["Cinnamon", "Nutmeg", "Cardamom", "Grapefruit", "Lavender", "Licorice"],
    solo: {
      name: "Lattafa Asad",
      price: "~£22",
      match: "91%",
      desc: "Captures 90% of the dark licorice-clove heart, slightly less natural lavender in the opening."
    },
    duo: {
      base: "Lattafa Asad (2 sprays)",
      accent: "Bleu de Chanel EdP (1 spray)",
      match: "96%",
      desc: "1 spray of Bleu de Chanel supplies the missing vibrant citrus diffusion that makes authentic Elixir radiate."
    }
  }
];

export default function ScentAlchemistApp() {
  const [activeTab, setActiveTab] = useState('shelf');
  const [myShelf, setMyShelf] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [targetQuery, setTargetQuery] = useState("Angels Share");
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanStep, setScanStep] = useState('upload');
  const [detectedBottles, setDetectedBottles] = useState([]);
  const [newManualBottle, setNewManualBottle] = useState("");
  const fileInputRef = useRef(null);

  const addBottle = (name) => {
    const trimmed = name.trim();
    if (trimmed && !myShelf.includes(trimmed)) {
      setMyShelf([...myShelf, trimmed]);
      setCustomInput("");
    }
  };

  const removeBottle = (name) => {
    setMyShelf(myShelf.filter((item) => item !== name));
  };

  const updateDetected = (idx, val) => {
    const updated = [...detectedBottles];
    updated[idx].name = val;
    setDetectedBottles(updated);
  };

  const removeDetected = (idx) => {
    setDetectedBottles(detectedBottles.filter((_, i) => i !== idx));
  };

  const addManualToDetected = () => {
    if (newManualBottle.trim()) {
      setDetectedBottles([...detectedBottles, { name: newManualBottle.trim(), confidence: 100 }]);
      setNewManualBottle("");
    }
  };

  const simulatedScan = () => {
    setScanStep('processing');
    setTimeout(() => {
      setDetectedBottles([
        { name: "Tom Ford Noir Extreme", confidence: 96 },
        { name: "Lattafa Khamrah", confidence: 94 },
        { name: "Dior Sauvage EdT", confidence: 98 },
        { name: "Versace Eros EdT", confidence: 89 }
      ]);
      setScanStep('review');
    }, 1500);
  };

  const confirmDetected = () => {
    const updated = [...myShelf];
    detectedBottles.forEach((b) => {
      const clean = b.name.trim();
      if (clean && !updated.includes(clean)) {
        updated.push(clean);
      }
    });
    setMyShelf(updated);
    setScanModalOpen(false);
    setScanStep('upload');
  };

  const targetData = useMemo(() => {
    return TARGET_PRESETS.find((p) => p.name.toLowerCase() === targetQuery.toLowerCase()) || TARGET_PRESETS[0];
  }, [targetQuery]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-black">
      <header className="border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center text-neutral-950 font-bold shadow-lg shadow-amber-500/20">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <span className="font-serif tracking-wider font-bold text-lg text-amber-100">SCENT ALCHEMIST</span>
            <p className="text-xs text-neutral-400">Fragrance Wardrobe Remixer &amp; Clone Synthesis</p>
          </div>
        </div>

        <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-1 gap-1">
          <button 
            onClick={() => setActiveTab('shelf')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'shelf' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Remix My Shelf
          </button>
          <button 
            onClick={() => setActiveTab('dupe')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dupe' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Reverse Dupe Matcher
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 md:p-8">
        {activeTab === 'shelf' ? (
          <div className="space-y-6">
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
                <div>
                  <h2 className="text-xl font-serif font-bold text-neutral-100">My Fragrance Wardrobe</h2>
                  <p className="text-xs text-neutral-400 mt-1">Add bottles or scan your shelf tray to calculate recipes.</p>
                </div>

                <div className="flex items-center gap-2">
                  {myShelf.length > 0 && (
                    <button 
                      onClick={() => setMyShelf([])}
                      className="inline-flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 hover:text-red-400 text-neutral-400 px-3 py-2 rounded-xl text-xs transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Clear Tray
                    </button>
                  )}

                  <button 
                    onClick={() => setScanModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-xs"
                  >
                    <Camera className="w-4 h-4" />
                    Scan Shelf with Photo
                  </button>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <input 
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBottle(customInput)}
                  placeholder="Type a fragrance name (e.g. Dior Sauvage, Tom Ford Noir)..."
                  className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                />
                <button 
                  onClick={() => addBottle(customInput)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-5 py-2.5 rounded-xl text-xs font-semibold"
                >
                  Add Bottle
                </button>
              </div>

              {myShelf.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {myShelf.map((b) => (
                    <span key={b} className="inline-flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs px-3 py-1.5 rounded-lg">
                      <span>{b}</span>
                      <button onClick={() => removeBottle(b)} className="text-neutral-500 hover:text-red-400">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-4 p-4 rounded-xl border border-dashed border-neutral-800 bg-neutral-950/30 text-center">
                  <p className="text-xs text-neutral-500">Your tray is empty. Add bottles or scan above to unlock recipes.</p>
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-neutral-800">
                <span className="text-[11px] font-semibold text-neutral-500 mr-2 uppercase">Quick Add:</span>
                <div className="inline-flex flex-wrap gap-1.5 mt-2">
                  {POPULAR_PRESETS.filter((p) => !myShelf.includes(p)).slice(0, 6).map((preset) => (
                    <button 
                      key={preset}
                      onClick={() => addBottle(preset)}
                      className="text-[11px] bg-neutral-800/60 hover:bg-neutral-700 text-neutral-400 hover:text-neutral-200 px-2.5 py-1 rounded-md"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {myShelf.length >= 2 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-serif font-bold text-neutral-100 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" />
                    Top Profiles You Can Recreate
                  </h3>
                  <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                    {myShelf.length} Bottles Analyzed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
                    <span className="text-[10px] bg-amber-500 text-neutral-950 font-bold px-2 py-0.5 rounded">94% Silhouette Match</span>
                    <h4 className="text-lg font-serif font-bold text-neutral-100 mt-2">Dior Sauvage Elixir</h4>
                    <p className="text-xs text-neutral-400 mt-1">Spicy lavender with dark licorice and grapefruit.</p>
                    <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-neutral-950">
                        <span className="text-[10px] text-neutral-500 font-bold block">Base (2 Sprays)</span>
                        <span className="text-neutral-200 font-medium">Lattafa Asad (Warm Spices &amp; Licorice)</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-neutral-950">
                        <span className="text-[10px] text-neutral-500 font-bold block">Top Accent (1 Spray)</span>
                        <span className="text-neutral-200 font-medium">Bleu de Chanel EdP (Grapefruit &amp; Mint)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl">
                    <span className="text-[10px] bg-neutral-800 text-neutral-300 font-bold px-2 py-0.5 rounded">91% Silhouette Match</span>
                    <h4 className="text-lg font-serif font-bold text-neutral-100 mt-2">Tom Ford Tobacco Vanille</h4>
                    <p className="text-xs text-neutral-400 mt-1">Cured pipe tobacco, smoky woods, and warm vanilla.</p>
                    <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-neutral-950">
                        <span className="text-[10px] text-neutral-500 font-bold block">Base (1 Spray)</span>
                        <span className="text-neutral-200 font-medium">By the Fireplace (Cade &amp; Guaiac Wood)</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-neutral-950">
                        <span className="text-[10px] text-neutral-500 font-bold block">Accent (2 Sprays)</span>
                        <span className="text-neutral-200 font-medium">Zara Warm Black (Gourmand Sweet Vanilla)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-neutral-800 rounded-2xl p-12 text-center bg-neutral-900/30">
                <FlaskConical className="w-12 h-12 text-amber-500/40 mx-auto mb-4 stroke-1" />
                <h3 className="text-lg font-serif font-bold text-neutral-200">Your Tray is Waiting</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto mt-2">
                  Add at least 2 fragrances above (or scan your collection) to calculate custom molecular layering recipes.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
                <div>
                  <h2 className="text-xl font-serif font-bold text-neutral-100">Reverse Dupe Matcher</h2>
                  <p className="text-xs text-neutral-400 mt-1">Discover 1-bottle clones and 2-bottle synergy layers.</p>
                </div>

                <div className="flex gap-2">
                  {TARGET_PRESETS.map((t) => (
                    <button
                      key={t.name}
                      onClick={() => setTargetQuery(t.name)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        targetData.name === t.name
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 bg-neutral-950 border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold">{targetData.house}</span>
                  <h3 className="text-2xl font-serif font-bold text-neutral-100">{targetData.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {targetData.notes.map((n) => (
                      <span key={n} className="text-[11px] bg-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded-full">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 px-5 py-3 rounded-xl text-right">
                  <span className="text-[10px] uppercase text-neutral-500 block font-semibold">Retail Price</span>
                  <span className="text-lg font-bold text-amber-400">{targetData.retail}</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-neutral-500">Route 1 • Solo Clone</span>
                      <h4 className="text-lg font-bold text-neutral-100 mt-1">{targetData.solo.name}</h4>
                      <span className="text-xs text-neutral-400">{targetData.solo.price}</span>
                    </div>
                    <span className="bg-neutral-800 text-neutral-300 text-xs px-2.5 py-1 rounded-md font-bold">
                      {targetData.solo.match}
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-neutral-300 leading-relaxed bg-neutral-900/50 p-4 rounded-xl">
                    {targetData.solo.desc}
                  </p>
                </div>

                <div className="bg-neutral-950 border border-amber-500/40 rounded-2xl p-6">
                  <span className="text-[10px] uppercase font-bold text-amber-400">Route 2 • 2-Bottle Alchemy</span>
                  <h4 className="text-lg font-bold text-neutral-100 mt-1">The Layered Silhouette</h4>
                  <div className="mt-4 space-y-2 text-xs">
                    <div className="bg-neutral-900 p-3 rounded-xl flex justify-between">
                      <span>{targetData.duo.base}</span>
                      <span className="text-amber-400 font-bold">Base</span>
                    </div>
                    <div className="bg-neutral-900 p-3 rounded-xl flex justify-between">
                      <span>{targetData.duo.accent}</span>
                      <span className="text-amber-400 font-bold">Accent</span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-neutral-300 leading-relaxed bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl">
                    {targetData.duo.desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {scanModalOpen && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => { setScanModalOpen(false); setScanStep('upload'); }}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-serif font-bold text-neutral-100 flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              Scan Fragrance Shelf
            </h3>

            {scanStep === 'upload' && (
              <div className="mt-6 space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-700 hover:border-amber-500 rounded-2xl p-8 text-center cursor-pointer bg-neutral-950/50"
                >
                  <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-neutral-200">Take a photo or upload an image</p>
                  <p className="text-xs text-neutral-500 mt-1">Supports phone camera photos, JPG, PNG</p>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    onChange={simulatedScan} 
                    className="hidden" 
                  />
                </div>

                <button 
                  onClick={simulatedScan}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold py-2.5 rounded-xl text-xs"
                >
                  Test with Sample Shelf Photo (Instant Demo)
                </button>
              </div>
            )}

            {scanStep === 'processing' && (
              <div className="mt-8 text-center py-8 space-y-4">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-neutral-200">Scanning bottles &amp; reading glass labels...</p>
              </div>
            )}

            {scanStep === 'review' && (
              <div className="mt-6 space-y-4">
                <p className="text-xs text-neutral-400">
                  Detected {detectedBottles.length} bottles. Edit names or delete false readings:
                </p>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {detectedBottles.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                      <input 
                        type="text"
                        value={b.name}
                        onChange={(e) => updateDetected(idx, e.target.value)}
                        className="flex-1 bg-transparent text-xs text-neutral-100 font-medium focus:outline-none focus:border-b focus:border-amber-500 px-1 py-0.5"
                      />
                      <span className="text-neutral-500 text-[10px] bg-neutral-900 px-2 py-1 rounded">
                        {b.confidence}%
                      </span>
                      <button 
                        onClick={() => removeDetected(idx)}
                        className="text-neutral-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex gap-2">
                  <input 
                    type="text"
                    value={newManualBottle}
                    onChange={(e) => setNewManualBottle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addManualToDetected()}
                    placeholder="Add a bottle the camera missed..."
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                  <button 
                    onClick={addManualToDetected}
                    className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>

                <button 
                  onClick={confirmDetected}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-2.5 rounded-xl text-xs mt-3 shadow-lg"
                >
                  Confirm &amp; Import to Shelf ({detectedBottles.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
