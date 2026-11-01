'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  Sparkles, Layers, FlaskConical, RefreshCw, 
  Flame, Info, Camera, Upload, X, Loader2, 
  Trash2, Plus, RotateCcw 
} from 'lucide-react';

const POPULAR_SHELF_PRESETS = [
  "Dior Sauvage EdT", "Bleu de Chanel EdP", "Creed Aventus", 
  "Lattafa Asad", "Armaf Club de Nuit Intense Man", "Zara Warm Black",
  "Maison Margiela By the Fireplace", "Tom Ford Noir Extreme",
  "Kilian Angels Share", "Versace Eros EdT", "Afnan 9PM",
  "Montblanc Explorer", "Lattafa Khamrah", "Baccarat Rouge 540"
];

const TARGET_PRESETS = [
  {
    name: "Angels Share",
    house: "Kilian Paris",
    family: "Warm Gourmand Boozy",
    retail: "£200+ (50ml)",
    keyNotes: ["Cognac", "Cinnamon", "Tonka Bean", "Oak Wood", "Praline", "Vanilla"],
    soloClone: {
      name: "Lattafa Khamrah",
      house: "Lattafa",
      price: "~£25",
      similarity: "88%",
      verdict: "Sweeter and more date-heavy than Angels Share, missing some dry cognac oak, but identical in rich sillage and projection."
    },
    alchemyPair: {
      base: { name: "Lattafa Khamrah", sprays: 2, role: "Gourmand Praline & Cinnamon Core" },
      accent: { name: "Zara Sand Desert At Sunset", sprays: 1, role: "Dry Cognac, Iris & Warm Cedarwood" },
      ratio: "2:1",
      similarity: "94%",
      synergyNote: "The dry iris, woody cedar, and booze in Zara cuts the syrupy date sweetness of Khamrah, creating the unmistakable dry-down of charred French cognac barrels."
    }
  },
  {
    name: "Lost Cherry",
    house: "Tom Ford",
    family: "Amber Floral Fruity",
    retail: "£280+ (50ml)",
    keyNotes: ["Black Cherry", "Bitter Almond", "Griotte Syrup", "Turkish Rose", "Roasted Tonka", "Peru Balsam"],
    soloClone: {
      name: "Maison Alhambra Lovely Cherie",
      house: "Maison Alhambra",
      price: "~£20",
      similarity: "89%",
      verdict: "Very close bitter almond and cherry liquor profile, though fades slightly faster into soft powdery tonka by hour 4."
    },
    alchemyPair: {
      base: { name: "Lovely Cherie (or Zara Cherry Smoothie)", sprays: 2, role: "Liqueur Cherry & Almond Top" },
      accent: { name: "Tom Ford Noir Extreme (or Zara Warm Black)", sprays: 1, role: "Deep Amber, Kulfi & Smoky Vanilla Anchor" },
      ratio: "2:1",
      similarity: "95%",
      synergyNote: "Anchoring the fleeting cherry accord over a rich cardamom-amber base fixes the sillage and mirrors Tom Fords luxurious smoky drydown."
    }
  },
  {
    name: "Sauvage Elixir",
    house: "Dior",
    family: "Aromatic Woody Spicy",
    retail: "£140+ (60ml)",
    keyNotes: ["Cinnamon", "Nutmeg", "Cardamom", "Grapefruit", "Lavender", "Licorice", "Sandalwood", "Amber"],
    soloClone: {
      name: "Lattafa Asad",
      house: "Lattafa",
      price: "~£22",
      similarity: "91%",
      verdict: "Legendary clone. Captures 90% of the dark licorice-clove heart, slightly less natural lavender and citrus zing in the first 10 minutes."
    },
    alchemyPair: {
      base: { name: "Lattafa Asad", sprays: 2, role: "Dark Spices, Licorice & Patchouli Core" },
      accent: { name: "Bleu de Chanel EdP (or Dylan Blue)", sprays: 1, role: "Grapefruit, Mint & Crisp Iso E Super Lift" },
      ratio: "2:1",
      similarity: "96%",
      synergyNote: "Applying 1 spray of Bleu de Chanel over Asad supplies the missing vibrant citrus diffusion that makes authentic Elixir project across entire rooms."
    }
  }
];

export default function ScentAlchemistApp() {
  const [activeTab, setActiveTab] = useState('shelf');
  const [myShelf, setMyShelf] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [targetQuery, setTargetQuery] = useState("Angels Share");
  const [isScanning, setIsScanning] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [detectedBottles, setDetectedBottles] = useState([]);
  const [scanStep, setScanStep] = useState('upload');
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
    setMyShelf(myShelf.filter(item => item !== name));
  };

  const clearEntireShelf = () => {
    setMyShelf([]);
  };

  const updateDetectedBottleName = (index, newName) => {
    const updated = [...detectedBottles];
    updated[index].name = newName;
    setDetectedBottles(updated);
  };

  const removeDetectedBottle = (index) => {
    setDetectedBottles(detectedBottles.filter((_, i) => i !== index));
  };

  const addManualToDetected = () => {
    if (newManualBottle.trim()) {
      setDetectedBottles([...detectedBottles, { name: newManualBottle.trim(), confidence: 100 }]);
      setNewManualBottle("");
    }
  };

  const currentTargetData = useMemo(() => {
    const found = TARGET_PRESETS.find(p => 
      p.name.toLowerCase().includes(targetQuery.toLowerCase()) || 
      targetQuery.toLowerCase().includes(p.name.toLowerCase())
    );
    return found || TARGET_PRESETS[0];
  }, [targetQuery]);

  const simulatedScan = () => {
    setIsScanning(true);
    setScanStep('processing');
    setTimeout(() => {
      setIsScanning(false);
      setDetectedBottles([
        { name: "Tom Ford Noir Extreme", confidence: 96 },
        { name: "Lattafa Khamrah", confidence: 94 },
        { name: "Dior Sauvage EdT", confidence: 98 },
        { name: "Versace Eros EdT", confidence: 89 }
      ]);
      setScanStep('review');
    }, 1800);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      simulatedScan();
    }
  };

  const confirmDetectedBottles = () => {
    const updated = [...myShelf];
    detectedBottles.forEach(b => {
      const cleanName = b.name.trim();
      if (cleanName && !updated.includes(cleanName)) {
        updated.push(cleanName);
      }
    });
    setMyShelf(updated);
    setScanModalOpen(false);
    setScanStep('upload');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-black">
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center text-neutral-950 font-bold shadow-lg shadow-amber-500/20">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif tracking-wider font-bold text-lg text-amber-100">SCENT ALCHEMIST</span>
              <span className="text-[10px] uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">AI Layering</span>
            </div>
            <p className="text-xs text-neutral-400">Fragrance Wardrobe Remixer &amp; Reverse-Dupe Matcher</p>
          </div>
        </div>

        <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-1 gap-1">
          <button 
            onClick={() => setActiveTab('shelf')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'shelf' 
                ? 'bg-amber-500 text-neutral-950 shadow-md' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            Remix My Shelf
          </button>
          <button 
            onClick={() => setActiveTab('dupe')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dupe' 
                ? 'bg-amber-500 text-neutral-950 shadow-md' 
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Reverse Dupe Matcher
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-8">
        {activeTab === 'shelf' ? (
          <div className="space-y-8">
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
                <div>
                  <h2 className="text-xl font-serif font-bold text-neutral-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    My Fragrance Wardrobe
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Add bottles or snap a photo of your tray to calculate your top recipes.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {myShelf.length > 0 && (
                    <button 
                      onClick={clearEntireShelf}
                      className="inline-flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 hover:text-red-400 text-neutral-400 px-3 py-2 rounded-xl text-xs transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Clear Tray
                    </button>
                  )}

                  <button 
                    onClick={() => setScanModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2.5 rounded-xl shadow-lg transition-all text-xs"
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
                  placeholder="Type a fragrance name (e.g. Dior Sauvage, Tom Ford Tobacco Vanille)..."
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
                  {myShelf.map((bottle) => (
                    <span 
                      key={bottle}
                      className="inline-flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs px-3 py-1.5 rounded-lg"
                    >
                      <span>{bottle}</span>
                      <button 
                        onClick={() => removeBottle(bottle)}
                        className="text-neutral-500 hover:text-red-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mt-4 p-4 rounded-xl border border-dashed border-neutral-800 bg-neutral-950/30 text-center">
                  <p className="text-xs text-neutral-500">
                    No bottles on your tray yet. Scan your shelf or click quick-add below to start brewing recipes.
                  </p>
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-neutral-800">
                <span className="text-[11px] font-
