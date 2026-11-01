'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, Camera, Upload, X, Loader2, 
  Trash2, Plus, ShoppingBag, Check, ArrowDown, Layers 
} from 'lucide-react';

const POPULAR_SHELF_PRESETS = [
  "Dior Sauvage EdT", "Bleu de Chanel EdP", "Creed Aventus", 
  "Lattafa Asad", "Armaf Club de Nuit Intense Man", "Zara Warm Black",
  "Maison Margiela By the Fireplace", "Tom Ford Noir Extreme",
  "Kilian Angels Share", "Versace Eros EdT", "Afnan 9PM", "Lattafa Khamrah"
];

// Target definitions with intelligent bridge logic
const BRIDGE_TARGET_DATABASE = [
  {
    name: "Bleu de Chanel Parfum",
    aliases: ["bleu de chanel", "bdc parfum", "bleu de chanel parfum", "chanel blue"],
    house: "Chanel",
    retail: "£145 (100ml)",
    notes: ["Lemon Zest", "Bergamot", "Mint", "Sandalwood", "Cedar", "Iso E Super", "Amber"],
    potentialBridges: [
      {
        matchingShelfBottle: "Bleu de Chanel EdP",
        ownedCoverage: "75%",
        ownedRole: "Vibrant grapefruit, mint & ambroxan opening",
        missingPieceName: "Lattafa Bade'e Al Oud",
        missingPrice: "£18",
        missingRole: "Creamy resinous sandalwood & dense woody base",
        targetMatch: "96%",
        recipe: "Apply 2 sprays of Bleu de Chanel EdP, wait 45s, then overlay 1 spray of the sandalwood base to anchor the citrus into a rich pure Parfum drydown."
      },
      {
        matchingShelfBottle: "Versace Dylan Blue",
        ownedCoverage: "60%",
        ownedRole: "Aquatic ambroxan & bergamot freshness",
        missingPieceName: "Zara Sand Desert At Sunset",
        missingPrice: "£22",
        missingRole: "Dry cedarwood, tonka & warm resinous anchor",
        targetMatch: "91%",
        recipe: "Layer 2 sprays of Dylan Blue over 1 spray of warm dry cedar to dial back the sweet aquatic notes into refined Chanel woods."
      }
    ],
    defaultSoloClone: {
      name: "Armaf Club de Nuit Blue Iconic",
      price: "£38",
      desc: "Direct clone of the Bleu de Chanel DNA with heavy longevity and zesty grapefruit-cedar projection."
    }
  },
  {
    name: "Angels Share",
    aliases: ["angels share", "kilian angels share", "angel share"],
    house: "Kilian Paris",
    retail: "£200+ (50ml)",
    notes: ["Cognac", "Cinnamon", "Tonka Bean", "Oak Wood", "Praline", "Vanilla"],
    potentialBridges: [
      {
        matchingShelfBottle: "Lattafa Khamrah",
        ownedCoverage: "70%",
        ownedRole: "Sweet date, praline, cinnamon & vanilla core",
        missingPieceName: "Zara Sand Desert At Sunset",
        missingPrice: "£22",
        missingRole: "Dry boozy cognac oak & powdery iris",
        targetMatch: "95%",
        recipe: "Spray 2 sprays of Khamrah, wait 45s, then overlay 1 spray of Zara Sand Desert to cut the syrupy sweetness into charred boozy oak barrels."
      },
      {
        matchingShelfBottle: "Zara Warm Black",
        ownedCoverage: "45%",
        ownedRole: "Spiced vanilla and warm sweet amber",
        missingPieceName: "Lattafa Khamrah",
        missingPrice: "£24",
        missingRole: "Praline, heavy cinnamon, and rich boozy notes",
        targetMatch: "90%",
        recipe: "Layer 2 sprays of a heavy praline clone over 1 spray of Zara Warm Black for a dense holiday gourmand sillage."
      }
    ],
    defaultSoloClone: {
      name: "Lattafa Khamrah",
      price: "£25",
      desc: "The reigning champion for rich boozy cinnamon and praline gourmand sillage."
    }
  },
  {
    name: "Aventus Absolu",
    aliases: ["aventus", "creed aventus", "aventus absolu", "creed"],
    house: "Creed",
    retail: "£330 (75ml)",
    notes: ["Blackcurrant", "Grapefruit", "Ginger", "Cinnamon", "Cardamom", "Birch Tar", "Patchouli"],
    potentialBridges: [
      {
        matchingShelfBottle: "Armaf Club de Nuit Intense Man",
        ownedCoverage: "65%",
        ownedRole: "Smoky birch tar, pineapple blackcurrant & oakmoss base",
        missingPieceName: "Lattafa Asad",
        missingPrice: "£22",
        missingRole: "Dark cardamom, cinnamon spice & warm amber warmth",
        targetMatch: "94%",
        recipe: "Apply 2 sprays of CDNIM, then add 1 spray of Lattafa Asad directly over it to turn classic smoky Aventus into the limited spiced Absolu edition."
      }
    ],
    defaultSoloClone: {
      name: "Montagne Parfums Pineapple Absolu",
      price: "£35",
      desc: "Captures the iconic birch leather and blackcurrant silhouette with masculine authority."
    }
  }
];

export default function ScentAlchemistApp() {
  const [myShelf, setMyShelf] = useState([]);
  const [customInput, setCustomInput] = useState("");
  
  // Bridge Target Search State
  const [targetQuery, setTargetQuery] = useState("");
  const [targetSearchInput, setTargetSearchInput] = useState("");

  // Scanner States
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
        { name: "Bleu de Chanel EdP", confidence: 96 },
        { name: "Lattafa Khamrah", confidence: 94 },
        { name: "Armaf Club de Nuit Intense Man", confidence: 92 }
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

  const handleTargetSearch = (e) => {
    e.preventDefault();
    if (targetSearchInput.trim()) {
      setTargetQuery(targetSearchInput.trim());
      setTimeout(() => {
        document.getElementById('bridge-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // The Bridge Calculation Algorithm
  const calculatedBridgeData = useMemo(() => {
    if (!targetQuery) return null;

    const cleanTarget = targetQuery.toLowerCase().trim();
    const targetObj = BRIDGE_TARGET_DATABASE.find(
      (item) => item.name.toLowerCase() === cleanTarget || 
                item.aliases.some((alias) => cleanTarget.includes(alias) || alias.includes(cleanTarget))
    ) || BRIDGE_TARGET_DATABASE[0];

    let bestOwnedBridge = null;
    for (const bridge of targetObj.potentialBridges) {
      if (myShelf.some(owned => owned.toLowerCase().includes(bridge.matchingShelfBottle.toLowerCase()) || 
                                bridge.matchingShelfBottle.toLowerCase().includes(owned.toLowerCase()))) {
        bestOwnedBridge = bridge;
        break;
      }
    }

    return {
      target: targetObj,
      bridge: bestOwnedBridge
    };
  }, [targetQuery, myShelf]);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-stone-200 selection:text-black">
      
      {/* Editorial Header - Enlarged Logo */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 px-6 py-6 md:px-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="font-serif text-3xl md:text-4xl tracking-[0.25em] font-light uppercase text-stone-900">
              Scentmix
            </h1>
            <p className="text-[10px] tracking-widest uppercase text-stone-400 mt-2 font-semibold">
              Bespoke Silhouette Synthesis
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold text-stone-400">
            <Layers className="w-4 h-4" strokeWidth={1.5} />
            Inventory ({myShelf.length})
          </div>
        </div>
      </header>

      <main>
        {/* HERO: THE SCENTMIX PROTOCOL */}
        <section className="bg-white border-b border-stone-200">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-200">
              <div className="p-8 md:p-12">
                <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-2">01. Foundation</span>
                <h3 className="font-serif text-xl text-stone-900 mb-3">Curate Inventory</h3>
                <p className="text-xs text-stone-500 leading-relaxed">Add the fragrances currently sitting on your tray to establish your foundational olfactory baseline.</p>
              </div>
              <div className="p-8 md:p-12">
                <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-2">02. Ambition</span>
                <h3 className="font-serif text-xl text-stone-900 mb-3">Select Silhouette</h3>
                <p className="text-xs text-stone-500 leading-relaxed">Search for the £200+ luxury designer profile you desire. We cross-reference it against your current collection.</p>
              </div>
              <div className="p-8 md:p-12">
                <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-2">03. Synthesis</span>
                <h3 className="font-serif text-xl text-stone-900 mb-3">Acquire Missing Link</h3>
                <p className="text-xs text-stone-500 leading-relaxed">We calculate the single accessible acquisition needed to bridge the gap. It serves beautifully on its own, and as your missing bridge.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: INVENTORY CURATION */}
        <section className="max-w-5xl mx-auto p-6 md:p-12 pt-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-serif text-3xl font-light text-stone-900 mb-3">What do you own?</h2>
            <p className="text-sm text-stone-500 font-light leading-relaxed">
              Begin by cataloging your current collection below.
            </p>
          </div>

          <div className="bg-white border border-stone-200 p-8 md:p-12 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-stone-100 pb-8 mb-8">
              <div className="flex-1 w-full flex gap-4">
                <input 
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBottle(customInput)}
                  placeholder="Enter a fragrance name..."
                  className="flex-1 bg-transparent border-b border-stone-300 px-0 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
                />
                <button 
                  onClick={() => addBottle(customInput)}
                  className="bg-stone-900 hover:bg-stone-800 text-white px-6 py-2 text-[10px] uppercase tracking-widest font-semibold transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto">
                <span className="text-stone-300 hidden md:block">|</span>
                <button 
                  onClick={() => setScanModalOpen(true)}
                  className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold text-stone-600 hover:text-stone-900 transition-colors"
                >
                  <Camera className="w-4 h-4" strokeWidth={1.5} />
                  Scan Shelf
                </button>
              </div>
            </div>

            {/* Active Wardrobe */}
            <div>
              <h3 className="text-[10px] uppercase tracking-widest font-semibold text-stone-400 mb-4">Current Inventory</h3>
              {myShelf.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {myShelf.map((b) => (
                    <div key={b} className="group flex items-center justify-between gap-3 bg-stone-50 border border-stone-200 px-4 py-2 hover:border-stone-300 transition-colors">
                      <span className="text-xs font-medium text-stone-800">{b}</span>
                      <button onClick={() => removeBottle(b)} className="text-stone-400 hover:text-stone-900 transition-colors">
                        <X className="w-3 h-3" strokeWidth={2} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center border border-dashed border-stone-200 bg-stone-50/50">
                  <p className="text-xs text-stone-400 uppercase tracking-widest">Inventory is empty</p>
                </div>
              )}
            </div>

            {/* Quick Add Suggestions */}
            <div className="mt-12 pt-8 border-t border-stone-100">
              <h3 className="text-[10px] uppercase tracking-widest font-semibold text-stone-400 mb-4">Common Elements</h3>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SHELF_PRESETS.filter((p) => !myShelf.includes(p)).map((preset) => (
                  <button 
                    key={preset}
                    onClick={() => addBottle(preset)}
                    className="text-[10px] uppercase tracking-wider bg-white border border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900 px-3 py-1.5 transition-all"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: INSTANT ALCHEMY (What they can make now) */}
        {myShelf.length >= 2 && (
          <section className="max-w-5xl mx-auto px-6 pb-16">
            <div className="mb-6">
              <h3 className="font-serif text-2xl text-stone-900">Current Capabilities</h3>
              <p className="text-xs text-stone-500 mt-1">What you can synthesize using 100% owned bottles.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-stone-200 p-8 shadow-sm">
                <span className="text-[10px] bg-stone-900 text-white font-bold px-2 py-1 uppercase tracking-widest">94% Silhouette Match</span>
                <h4 className="text-lg font-serif font-bold text-stone-900 mt-4">Dior Sauvage Elixir</h4>
                <p className="text-xs text-stone-500 mt-1 mb-6">Spicy lavender with dark licorice and grapefruit core.</p>
                <div className="space-y-3">
                  <div className="bg-stone-50 border border-stone-200 p-3">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">Base Layer (2 Sprays)</span>
                    <span className="text-xs font-medium text-stone-800">Lattafa Asad (Warm Spices & Resins)</span>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 p-3">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">Top Accent (1 Spray)</span>
                    <span className="text-xs font-medium text-stone-800">Bleu de Chanel EdP (Grapefruit & Mint)</span>
                  </div>
                </div>
              </div>
              <div className="bg-white border border-stone-200 p-8 shadow-sm">
                <span className="text-[10px] bg-stone-900 text-white font-bold px-2 py-1 uppercase tracking-widest">91% Silhouette Match</span>
                <h4 className="text-lg font-serif font-bold text-stone-900 mt-4">Tom Ford Tobacco Vanille</h4>
                <p className="text-xs text-stone-500 mt-1 mb-6">Cured pipe tobacco, smoky wood hearth, and sweet tonka.</p>
                <div className="space-y-3">
                  <div className="bg-stone-50 border border-stone-200 p-3">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">Base Layer (1 Spray)</span>
                    <span className="text-xs font-medium text-stone-800">By the Fireplace (Cade & Guaiac Wood)</span>
                  </div>
                  <div className="bg-stone-50 border border-stone-200 p-3">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest block">Accent Layer (2 Sprays)</span>
                    <span className="text-xs font-medium text-stone-800">Zara Warm Black (Gourmand Vanilla & Tonka)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: THE BRIDGE (Monetization Engine) */}
        <section className="bg-stone-100 border-t border-stone-200 py-16 md:py-24">
          <div className="max-w-5xl mx-auto px-6 md:px-12">
            
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-stone-400 mb-4 inline-block"><ArrowDown className="w-6 h-6 animate-bounce" strokeWidth={1.5}/></span>
              <h2 className="font-serif text-4xl font-light text-stone-900 mb-4">What do you want to smell like?</h2>
              <p className="text-sm text-stone-500 font-light leading-relaxed">
                Enter your desired luxury target. We will calculate the missing piece required to bridge your current collection to the final silhouette.
              </p>
            </div>

            {/* Editorial Search Bar */}
            <form onSubmit={handleTargetSearch} className="max-w-2xl mx-auto relative mb-12">
              <input 
                type="text"
                value={targetSearchInput}
                onChange={(e) => setTargetSearchInput(e.target.value)}
                placeholder="Search target (e.g. Bleu de Chanel Parfum, Angels Share)..."
                className="w-full bg-transparent border-b-2 border-stone-300 py-4 pl-0 pr-12 text-lg font-serif text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900 transition-colors"
              />
              <button type="submit" className="absolute right-0 top-4 text-stone-500 hover:text-stone-900 transition-colors">
                <Search className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </form>

            {/* Quick Presets for Target */}
            <div className="flex flex-wrap justify-center gap-2 mb-16">
              {BRIDGE_TARGET_DATABASE.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => {
                    setTargetQuery(t.name);
                    setTargetSearchInput(t.name);
                    setTimeout(() => {
                      document.getElementById('bridge-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                  }}
                  className="text-[10px] uppercase tracking-wider border border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900 bg-white px-4 py-2 transition-all shadow-sm"
                >
                  {t.name}
                </button>
              ))}
            </div>

            {/* BRIDGE RESULTS AREA */}
            <div id="bridge-results">
              {calculatedBridgeData && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                  
                  {/* Target Overview */}
                  <div className="bg-white border border-stone-200 shadow-sm p-8 md:p-12 mb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-stone-100 pb-8 mb-8">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-2">{calculatedBridgeData.target.house}</span>
                        <h3 className="font-serif text-4xl font-normal text-stone-900">{calculatedBridgeData.target.name}</h3>
                      </div>
                      <div className="text-left md:text-right">
                        <span className="text-[10px] uppercase tracking-widest font-semibold text-stone-400 block mb-1">Retail Valuation</span>
                        <span className="text-lg font-light text-stone-900">{calculatedBridgeData.target.retail}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-semibold text-stone-400 block mb-3">Key Accords</span>
                      <div className="flex flex-wrap gap-2">
                        {calculatedBridgeData.target.notes.map((n) => (
                          <span key={n} className="text-[10px] uppercase tracking-wider border border-stone-200 text-stone-600 px-3 py-1">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Missing Link / Acquisition Calculation */}
                  {calculatedBridgeData.bridge ? (
                    /* User owns a bridge base */
                    <div className="bg-white text-stone-900 border border-stone-200 p-8 md:p-12 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 bg-stone-900 text-white text-[10px] uppercase tracking-widest font-bold px-4 py-2">
                        {calculatedBridgeData.bridge.targetMatch} Match Found
                      </div>
                      
                      <div className="mb-10 pr-32">
                        <h4 className="font-serif text-2xl text-stone-900 mb-2">Synthesis Blueprint Complete</h4>
                        <p className="text-sm text-stone-500">You already possess {calculatedBridgeData.bridge.ownedCoverage} of this profile in your collection.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-8 border-t-2 border-dashed border-stone-300 z-0"></div>

                        {/* Owned Box */}
                        <div className="bg-stone-50 border border-stone-200 p-6 relative z-10">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-3">01. Foundation (Owned)</span>
                          <h5 className="font-serif text-xl text-stone-900 mb-2">{calculatedBridgeData.bridge.matchingShelfBottle}</h5>
                          <p className="text-xs text-stone-500">{calculatedBridgeData.bridge.ownedRole}</p>
                        </div>

                        {/* Missing Link Box (Kept light, but with a stark black CTA button) */}
                        <div className="bg-white border border-stone-200 p-6 relative z-10 shadow-md">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-stone-900 block mb-3">02. Missing Element (Required)</span>
                          <h5 className="font-serif text-xl text-stone-900 mb-2">{calculatedBridgeData.bridge.missingPieceName}</h5>
                          <p className="text-xs text-stone-500 mb-6">{calculatedBridgeData.bridge.missingRole}</p>
                          
                          {/* CRITICAL MONETIZATION CTA - STARK BLACK */}
                          <button className="w-full bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center gap-2 px-6 py-4 text-[11px] uppercase tracking-widest font-bold transition-all shadow-lg">
                            <ShoppingBag className="w-4 h-4" strokeWidth={2} />
                            Acquire Element • {calculatedBridgeData.bridge.missingPrice}
                          </button>
                        </div>
                      </div>

                      {/* Application Protocol */}
                      <div className="mt-10 pt-8 border-t border-stone-200 text-center max-w-2xl mx-auto">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-4">Application Protocol</span>
                        <p className="text-sm md:text-base text-stone-800 leading-relaxed font-serif italic">
                          &quot;{calculatedBridgeData.bridge.recipe}&quot;
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* User owns nothing relevant - Show Solo Clone CTA */
                    <div className="bg-white text-stone-900 border border-stone-200 shadow-sm p-8 md:p-12 text-center">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-3">Standard Alternative</span>
                      <h4 className="font-serif text-3xl text-stone-900 mb-3">{calculatedBridgeData.target.defaultSoloClone.name}</h4>
                      <p className="text-sm text-stone-500 max-w-md mx-auto leading-relaxed mb-8">
                        {calculatedBridgeData.target.defaultSoloClone.desc}
                      </p>
                      
                      {/* CRITICAL MONETIZATION CTA */}
                      <div className="flex flex-col items-center gap-4">
                        <button className="bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center gap-2 px-8 py-4 w-full md:w-auto text-[11px] uppercase tracking-widest font-bold transition-all shadow-xl">
                          <ShoppingBag className="w-4 h-4" />
                          Acquire 1-Bottle Clone • {calculatedBridgeData.target.defaultSoloClone.price}
                        </button>
                        <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-4">
                          Want to unlock 95% fidelity? Ensure your entire collection is logged above to check for synergistic bridges.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Luxury Minimalist Scanner Modal */}
      {scanModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-stone-200 shadow-2xl max-w-lg w-full p-8 md:p-12 relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setScanModalOpen(false); setScanStep('upload'); }}
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-900 transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>

            <h3 className="font-serif text-2xl font-light text-stone-900 mb-2">Scan Inventory</h3>
            
            {scanStep === 'upload' && (
              <div className="mt-8 space-y-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-stone-300 hover:border-stone-900 p-12 text-center cursor-pointer bg-stone-50 transition-colors group"
                >
                  <Camera className="w-6 h-6 text-stone-300 group-hover:text-stone-900 mx-auto mb-4 transition-colors" strokeWidth={1.5} />
                  <p className="text-xs uppercase tracking-widest font-semibold text-stone-900">Capture Collection</p>
                  <p className="text-[11px] text-stone-500 mt-2">Upload a photograph of your bottles</p>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    onChange={simulatedScan} 
                    className="hidden" 
                  />
                </div>

                <div className="flex items-center justify-center gap-4">
                  <div className="h-px bg-stone-200 flex-1"></div>
                  <span className="text-[10px] uppercase tracking-widest text-stone-400 font-semibold">or</span>
                  <div className="h-px bg-stone-200 flex-1"></div>
                </div>

                <button 
                  onClick={simulatedScan}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-900 px-6 py-4 text-[10px] uppercase tracking-widest font-semibold transition-colors"
                >
                  Run Demo Calibration
                </button>
              </div>
            )}

            {scanStep === 'processing' && (
              <div className="my-16 text-center">
                <Loader2 className="w-8 h-8 text-stone-900 animate-spin mx-auto mb-6" strokeWidth={1.5} />
                <p className="text-[10px] uppercase tracking-widest font-semibold text-stone-900">Analyzing Labels &amp; Silhouettes</p>
              </div>
            )}

            {scanStep === 'review' && (
              <div className="mt-8 space-y-6">
                <p className="text-xs text-stone-500 font-light">
                  Please verify the algorithmic detection below. Adjust nomenclature if necessary.
                </p>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                  {detectedBottles.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-3 border-b border-stone-200 pb-2">
                      <input 
                        type="text"
                        value={b.name}
                        onChange={(e) => updateDetected(idx, e.target.value)}
                        className="flex-1 bg-transparent text-sm font-serif text-stone-900 focus:outline-none focus:border-stone-900"
                      />
                      <span className="text-[10px] text-stone-400 uppercase tracking-widest">
                        {b.confidence}%
                      </span>
                      <button 
                        onClick={() => removeDetected(idx)}
                        className="text-stone-300 hover:text-stone-900 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex gap-3">
                  <input 
                    type="text"
                    value={newManualBottle}
                    onChange={(e) => setNewManualBottle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addManualToDetected()}
                    placeholder="Add missing item..."
                    className="flex-1 bg-transparent border-b border-stone-300 px-0 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-900"
                  />
                  <button 
                    onClick={addManualToDetected}
                    className="text-stone-900 hover:text-stone-600 p-2"
                  >
                    <Plus className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                <button 
                  onClick={confirmDetected}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white px-6 py-4 text-[10px] uppercase tracking-widest font-semibold transition-colors mt-4"
                >
                  Import Inventory ({detectedBottles.length})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
