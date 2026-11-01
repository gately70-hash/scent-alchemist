'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  Sparkles, Layers, Search, FlaskConical, AlertCircle, 
  HelpCircle, CheckCircle2, ChevronRight, Zap, RefreshCw, 
  ArrowRight, ShieldCheck, Flame, Info, ExternalLink,
  Camera, Upload, X, Loader2, Sparkle
} from 'lucide-react';

const POPULAR_SHELF_PRESETS = [
  "Dior Sauvage EdT", "Bleu de Chanel EdP", "Creed Aventus", 
  "Lattafa Asad", "Armaf Club de Nuit Intense Man", "Zara Warm Black",
  "Maison Margiela By the Fireplace", "Tom Ford Noir Extreme",
  "Kilian Angels' Share", "Versace Eros EdT", "Afnan 9PM",
  "Montblanc Explorer", "Lattafa Khamrah", "Baccarat Rouge 540"
];

const TARGET_PRESETS = [
  {
    name: "Angels' Share",
    house: "Kilian Paris",
    family: "Warm Gourmand Boozy",
    retail: "£200+ (50ml)",
    keyNotes: ["Cognac", "Cinnamon", "Tonka Bean", "Oak Wood", "Praline", "Vanilla"],
    soloClone: {
      name: "Lattafa Khamrah",
      house: "Lattafa",
      price: "~£25",
      similarity: "88%",
      verdict: "Sweeter and more date-heavy than Angels' Share, missing some dry cognac oak, but identical in rich sillage and projection."
    },
    alchemyPair: {
      base: { name: "Lattafa Khamrah", sprays: 2, role: "Gourmand Praline & Cinnamon Core" },
      accent: { name: "Zara Sand Desert At Sunset", sprays: 1, role: "Dry Cognac, Iris & Warm Cedarwood" },
      ratio: "2:1",
      similarity: "94%",
      synergyNote: "The dry iris, woody cedar, and booze in Zara cuts the syrupy date sweetness of Khamrah, creating the unmistakable dry-down of charred French cognac barrels."
    },
    scentJourney: "Starts with sharp boozy spice, melts into warm praline and cinnamon within 15 minutes, drying down to an intoxicating vanilla-tonka resin that lasts 10+ hours."
  },
  {
    name: "Lost Cherry",
    house: "Tom Ford",
    family: "Amber Floral Fruity",
    retail: "£280+ (50ml)",
    keyNotes: ["Black Cherry", "Bitter Almond", "Griotte Syrup", "Turkish Rose", "Roasted Tonka", "Peru Balsam"],
    soloClone: {
      name: "Maison Alhambra Lovely Chèrie",
      house: "Maison Alhambra",
      price: "~£20",
      similarity: "89%",
      verdict: "Very close bitter almond and cherry liquor profile, though fades slightly faster into soft powdery tonka by hour 4."
    },
    alchemyPair: {
      base: { name: "Lovely Chèrie (or Zara Cherry Smoothie)", sprays: 2, role: "Liqueur Cherry & Almond Top" },
      accent: { name: "Tom Ford Noir Extreme (or Zara Warm Black)", sprays: 1, role: "Deep Amber, Kulfi & Smoky Vanilla Anchor" },
      ratio: "2:1",
      similarity: "95%",
      synergyNote: "Single cherry clones often suffer from poor longevity. Anchoring the fleeting cherry accord over a rich cardamom-amber base fixes the sillage and mirrors Tom Ford's luxurious smoky drydown."
    },
    scentJourney: "A burst of rich boozy dark cherry candy that settles into creamy almond and roasted woods with zero medicinal cough-syrup bite."
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
    },
    scentJourney: "An intense, sophisticated blast of dark holiday spices balanced by crisp aromatics that commands attention for 12+ hours."
  },
  {
    name: "Aventus Absolu",
    house: "Creed",
    family: "Chypre Fruity Spicy",
    retail: "£330+ (75ml)",
    keyNotes: ["Blackcurrant", "Grapefruit", "Bergamot", "Ginger", "Cinnamon", "Cardamom", "Patchouli", "Pink Pepper", "Vetiver"],
    soloClone: {
      name: "Montagne Parfums Pineapple Absolu",
      house: "Montagne / Armaf CDNIM",
      price: "~£35",
      similarity: "86%",
      verdict: "Good projection of the darker smoky pineapple silhouette, lacking the sharp grapefruit-cardamom warmth of the limited release."
    },
    alchemyPair: {
      base: { name: "Armaf Club de Nuit Intense Man", sprays: 2, role: "Smoky Birch, Blackcurrant & Oakmoss Base" },
      accent: { name: "Dior Sauvage EdT (or Lattafa Asad)", sprays: 1, role: "Radiant Ambroxan, Pepper & Warm Spices" },
      ratio: "2:1",
      similarity: "93%",
      synergyNote: "CDNIM provides the dark smoky birch backbone; the spiced ambroxan accent modernizes it into the warm, rich holiday edition of Aventus Absolu."
    },
    scentJourney: "Effervescent spicy citrus giving way to smoky birch tar and pineapple leather, exuding masculine executive authority."
  }
];

export default function ScentAlchemistApp() {
  const [activeTab, setActiveTab] = useState('shelf');
  const [myShelf, setMyShelf] = useState([
    "Bleu de Chanel EdP",
    "Lattafa Asad",
    "Armaf Club de Nuit Intense Man",
    "Maison Margiela By the Fireplace",
    "Zara Warm Black"
  ]);
  const [customInput, setCustomInput] = useState("");
  const [targetQuery, setTargetQuery] = useState("Angels' Share");
  const [isScanning, setIsScanning] = useState(false);
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [detectedBottles, setDetectedBottles] = useState([]);
  const [scanStep, setScanStep] = useState('upload');
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
        { name: "Tom Ford Noir Extreme", confidence: 96, label: "TF Noir Ext" },
        { name: "Lattafa Khamrah", confidence: 94, label: "Khamrah Gold" },
        { name: "Dior Sauvage EdT", confidence: 98, label: "Sauvage Dior" },
        { name: "Versace Eros EdT", confidence: 89, label: "Eros Pour Homme" }
      ]);
      setScanStep('review');
    }, 2400);
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      simulatedScan();
    }
  };

  const confirmDetectedBottles = () => {
    const updated = [...myShelf];
    detectedBottles.forEach(b => {
      if (!updated.includes(b.name)) updated.push(b.name);
    });
    setMyShelf(updated);
    setScanModalOpen(false);
    setScanStep('upload');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-900/50 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-neutral-950">
            <FlaskConical className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif tracking-wider font-bold text-lg text-amber-100">SCENT ALCHEMIST</span>
              <span className="text-[10px] uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">Zero-DB AI</span>
            </div>
            <p className="text-xs text-neutral-400">Fragrance Layering & Reverse-Dupe Synthesis</p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-1 gap-1">
          <button 
            onClick={() => setActiveTab('shelf')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'shelf' 
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20' 
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Layers className="w-4 h-4" />
            Remix My Shelf
          </button>
          <button 
            onClick={() => setActiveTab('dupe')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'dupe' 
                ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20' 
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Reverse Dupe Matcher
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto p-6 md:p-8">
        {activeTab === 'shelf' ? (
          <div className="space-y-8">
            {/* Shelf Manager Card */}
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
                <div>
                  <h2 className="text-xl font-serif font-bold text-neutral-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    My Fragrance Wardrobe
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Add bottles or snap a photo of your tray. Our engine calculates your Top 3 luxury matches.
                  </p>
                </div>

                <button 
                  onClick={() => setScanModalOpen(true)}
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all text-xs tracking-wide"
                >
                  <Camera className="w-4 h-4" />
                  Scan Shelf with Photo / Camera
                </button>
              </div>

              {/* Input Bar */}
              <div className="mt-5 flex gap-2">
                <input 
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBottle(customInput)}
                  placeholder="Type a fragrance name (e.g. Dior Sauvage, Tom Ford Tobacco Vanille)..."
                  className="flex-1 bg-neutral-950/70 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/40"
                />
                <button 
                  onClick={() => addBottle(customInput)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                >
                  Add Bottle
                </button>
              </div>

              {/* Current Active Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {myShelf.map((bottle) => (
                  <span 
                    key={bottle}
                    className="inline-flex items-center gap-1.5 bg-neutral-950/90 border border-neutral-800 text-neutral-300 text-xs px-3 py-1.5 rounded-lg group"
                  >
                    <span>{bottle}</span>
                    <button 
                      onClick={() => removeBottle(bottle)}
                      className="text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick Add Presets */}
              <div className="mt-5 pt-4 border-t border-neutral-800/60">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-500 mr-2">Quick Add:</span>
                <div className="inline-flex flex-wrap gap-1.5 mt-2">
                  {POPULAR_SHELF_PRESETS.filter(p => !myShelf.includes(p)).slice(0, 7).map((preset) => (
                    <button 
                      key={preset}
                      onClick={() => addBottle(preset)}
                      className="text-[11px] bg-neutral-800/60 hover:bg-neutral-700/80 text-neutral-400 hover:text-neutral-200 px-2.5 py-1 rounded-md transition-colors"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Top 3 Designer Recipes Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-neutral-100 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  Top 3 Designer Profiles You Can Recreate
                </h3>
                <p className="text-xs text-neutral-400">Ranked by molecular accord compatibility & sillage balance</p>
              </div>
              <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                {myShelf.length} Bottles Analyzed
              </span>
            </div>

            {/* The 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="bg-neutral-900/80 border border-amber-500/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/60 transition-all">
                <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-neutral-950 font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  #1 Match • 94%
                </div>
                <div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-400">Target Profile</span>
                  <h4 className="text-lg font-serif font-bold text-neutral-100 mt-1">Dior Sauvage Elixir</h4>
                  <p className="text-xs text-neutral-400 mt-1">Spicy-woody lavender with dark licorice and bitter grapefruit core.</p>

                  <div className="mt-4 pt-4 border-t border-neutral-800 space-y-3">
                    <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Step 1 • Base Anchor</span>
                      <p className="text-xs font-semibold text-neutral-200 mt-0.5">2 Sprays of Lattafa Asad</p>
                      <span className="text-[10px] text-neutral-400">Heavy cloves, nutmeg, dark licorice resin</span>
                    </div>

                    <div className="flex items-center justify-center text-[10px] text-amber-400 font-semibold gap-1.5 py-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Wait 45–60s for alcohol carrier to flash off
                    </div>

                    <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Step 2 • Top Lift</span>
                      <p className="text-xs font-semibold text-neutral-200 mt-0.5">1 Spray of Bleu de Chanel EdP</p>
                      <span className="text-[10px] text-neutral-400">Spray directly over the first layer</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-800/60 bg-neutral-950/40 -mx-5 -mb-5 p-4 rounded-b-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                    <Info className="w-3 h-3 text-amber-400" />
                    Why They Match:
                  </span>
                  <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                    The dense coumarin and spices in the base anchor the volatile citrus molecules, preventing them from evaporating quickly and creating the iconic sharp opening.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/40 transition-all">
                <div className="absolute top-0 right-0 bg-neutral-800 text-neutral-300 font-bold text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  #2 Match • 91%
                </div>
                <div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400">Target Profile</span>
                  <h4 className="text-lg font-serif font-bold text-neutral-100 mt-1">Tom Ford Tobacco Vanille</h4>
                  <p className="text-xs text-neutral-400 mt-1">Cured pipe tobacco, smoky resinous woods, and rich vanilla.</p>

                  <div className="mt-4 pt-4 border-t border-neutral-800 space-y-3">
                    <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Step 1 • Base Anchor</span>
                      <p className="text-xs font-semibold text-neutral-200 mt-0.5">1 Spray of By the Fireplace</p>
                      <span className="text-[10px] text-neutral-400">Restraint needed: heavy cade and guaiac woods</span>
                    </div>

                    <div className="flex items-center justify-center text-[10px] text-amber-400 font-semibold gap-1.5 py-1">
                      <RefreshCw className="w-3 h-3" />
                      Wait 60s for wood oils to anchor
                    </div>

                    <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Step 2 • Sweet Accent</span>
                      <p className="text-xs font-semibold text-neutral-200 mt-0.5">2 Sprays of Zara Warm Black</p>
                      <span className="text-[10px] text-neutral-400">Direct overlay or split application</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-800/60 bg-neutral-950/40 -mx-5 -mb-5 p-4 rounded-b-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                    <Info className="w-3 h-3 text-amber-400" />
                    Why They Match:
                  </span>
                  <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                    Roasted chestnut phenols cut the sweet dessert quality of the vanilla, grounding it into a photorealistic, dry luxury pipe tobacco drydown.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/40 transition-all">
                <div className="absolute top-0 right-0 bg-neutral-800 text-neutral-300 font-bold text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                  #3 Match • 89%
                </div>
                <div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400">Target Profile</span>
                  <h4 className="text-lg font-serif font-bold text-neutral-100 mt-1">Roja Elysium / Aventus Absolu</h4>
                  <p className="text-xs text-neutral-400 mt-1">Effervescent citrus-aromatic opening with smoky birch leather base.</p>

                  <div className="mt-4 pt-4 border-t border-neutral-800 space-y-3">
                    <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Step 1 • Base Anchor</span>
                      <p className="text-xs font-semibold text-neutral-200 mt-0.5">2 Sprays of Club de Nuit Intense Man</p>
                      <span className="text-[10px] text-neutral-400">Smoky birch tar, oakmoss, blackcurrant</span>
                    </div>

                    <div className="flex items-center justify-center text-[10px] text-amber-400 font-semibold gap-1.5 py-1">
                      <RefreshCw className="w-3 h-3" />
                      Wait 30–45s
                    </div>

                    <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800/80">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Step 2 • Top Lift</span>
                      <p className="text-xs font-semibold text-neutral-200 mt-0.5">2 Sprays of Bleu de Chanel EdP</p>
                      <span className="text-[10px] text-neutral-400">Direct overlay to mask harsh opening</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-neutral-800/60 bg-neutral-950/40 -mx-5 -mb-5 p-4 rounded-b-2xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
                    <Info className="w-3 h-3 text-amber-400" />
                    Why They Match:
                  </span>
                  <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                    The smooth natural citrus and mint of the top layer masks the harsh chemical opening of the birch tar, turning it into an ultra-smooth niche profile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Reverse Dupe Matcher Tab */
          <div className="space-y-8">
            <div className="bg-neutral-900/60 border border-neutral-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
                <div>
                  <h2 className="text-xl font-serif font-bold text-neutral-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    Reverse Dupe & Alchemy Matcher
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Pick an expensive luxury target to discover its best solo clone and 2-bottle alchemy layer.
                  </p>
                </div>

                <div className="flex gap-2">
                  {TARGET_PRESETS.map((target) => (
                    <button
                      key={target.name}
                      onClick={() => setTargetQuery(target.name)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                        currentTargetData.name === target.name
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {target.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Banner */}
              <div className="mt-6 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-amber-400">{currentTargetData.house}</span>
                  <h3 className="text-2xl font-serif font-bold text-neutral-100">{currentTargetData.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {currentTargetData.keyNotes.map(n => (
                      <span key={n} className="text-[11px] bg-neutral-800/60 text-neutral-300 px-2.5 py-0.5 rounded-full border border-neutral-700/50">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-950/80 border border-neutral-800 px-5 py-3 rounded-xl text-right">
                  <span className="text-[10px] uppercase text-neutral-500 block font-semibold">Retail Price</span>
                  <span className="text-lg font-bold text-amber-400">{currentTargetData.retail}</span>
                </div>
              </div>

              {/* Solo vs Alchemy Comparison */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Option A: Solo Clone */}
                <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-neutral-500">Route 1 • 1-Bottle Budget Clone</span>
                        <h4 className="text-lg font-bold text-neutral-100 mt-1">{currentTargetData.soloClone.name}</h4>
                        <span className="text-xs text-neutral-400">{currentTargetData.soloClone.house} • {currentTargetData.soloClone.price}</span>
                      </div>
                      <span className="bg-neutral-800 text-neutral-300 text-xs px-2.5 py-1 rounded-md font-bold">
                        {currentTargetData.soloClone.similarity} Match
                      </span>
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/70 text-xs text-neutral-300 leading-relaxed">
                      {currentTargetData.soloClone.verdict}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                    <span className="text-xs text-neutral-500">Fastest solution</span>
                    <button className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-4 py-2 rounded-xl font-semibold transition-colors">
                      View Retailer
                    </button>
                  </div>
                </div>

                {/* Option B: Alchemy Layer */}
                <div className="bg-neutral-950/80 border border-amber-500/40 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-amber-500 text-neutral-950 text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                    Superior Drydown
                  </div>
                  <div>
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400">Route 2 • 2-Bottle Alchemy Recipe</span>
                      <h4 className="text-lg font-bold text-neutral-100 mt-1">The Layered Reconstruction</h4>
                      <span className="text-xs text-neutral-400">Combines {currentTargetData.alchemyPair.base.name} + {currentTargetData.alchemyPair.accent.name}</span>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-semibold text-neutral-200">{currentTargetData.alchemyPair.base.name}</span>
                          <span className="text-neutral-500 block text-[11px]">{currentTargetData.alchemyPair.base.role}</span>
                        </div>
                        <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold">{currentTargetData.alchemyPair.base.sprays} sprays</span>
                      </div>

                      <div className="bg-neutral-900/60 p-3 rounded-xl border border-neutral-800 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-semibold text-neutral-200">{currentTargetData.alchemyPair.accent.name}</span>
                          <span className="text-neutral-500 block text-[11px]">{currentTargetData.alchemyPair.accent.role}</span>
                        </div>
                        <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded font-bold">{currentTargetData.alchemyPair.accent.sprays} spray</span>
                      </div>
                    </div>

                    <p className="mt-4 text-xs text-neutral-300 bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl leading-relaxed">
                      {currentTargetData.alchemyPair.synergyNote}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-800/80 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400">{currentTargetData.alchemyPair.similarity} Silhouette Match</span>
                    <button className="text-xs bg-amber-500 hover:bg-amber-400 text-neutral-950 px-4 py-2 rounded-xl font-bold transition-colors">
                      Get The Missing Accent
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Camera / Photo Scanner Modal */}
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
                  className="border-2 border-dashed border-neutral-700 hover:border-amber-500/70 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-neutral-950/50"
                >
                  <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-neutral-200">Take a photo or upload an image</p>
                  <p className="text-xs text-neutral-500 mt-1">Supports phone camera photos, JPG, PNG</p>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </div>

                <div className="text-center">
                  <span className="text-xs text-neutral-500">or</span>
                </div>

                <button 
                  onClick={simulatedScan}
                  className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Test with Sample Shelf Photo (Instant Demo)
                </button>
              </div>
            )}

            {scanStep === 'processing' && (
              <div className="mt-8 text-center py-8 space-y-4">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <p className="text-sm font-semibold text-neutral-200">Scanning bottles & reading glass labels...</p>
                <p className="text-xs text-neutral-500">Detecting bottle silhouettes and typography</p>
              </div>
            )}

            {scanStep === 'review' && (
              <div className="mt-6 space-y-4">
                <p className="text-xs text-neutral-400">
                  Detected {detectedBottles.length} bottles. Confirm or deselect before importing to your wardrobe:
                </p>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {detectedBottles.map((b) => (
                    <div key={b.name} className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 text-xs">
                      <span className="font-semibold text-neutral-200">{b.name}</span>
                      <span className="text-neutral-500 text-[11px]">{b.confidence}% confidence</span>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={confirmDetectedBottles}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold py-2.5 rounded-xl text-xs transition-colors mt-2"
                >
                  Confirm & Add Bottles to Shelf
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
