'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, Camera, Upload, X, Loader2, 
  Trash2, Plus, ShoppingBag, Check, ArrowDown
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
  
  // Target Search State
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
        document.getElementById('synthesis-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
      
      {/* Sticky Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 px-6 py-6 md:px-12">
        <div className="max-w-5xl mx-auto flex items-center justify-center md:justify-start">
          <div className="text-center md:text-left">
            <h1 className="font-serif text-3xl md:text-4xl tracking-[0.25em] font-light uppercase text-stone-900">
              Scentmix
            </h1>
            <p className="text-[10px] tracking-widest uppercase text-stone-400 mt-2 font-semibold">
              Bespoke Silhouette Synthesis
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto md:py-12 p-4">
        
        {/* THE SINGLE UNIFIED CONTAINER */}
        <div className="bg-white border border-stone-200 shadow-xl overflow-hidden relative">
          
          {/* Subtle vertical connector line guiding the eye down */}
          <div className="hidden md:block absolute left-12 top-0 bottom-0 w-px bg-stone-100 z-0"></div>

          {/* PROTOCOL HEADER */}
          <div className="bg-stone-50/50 border-b border-stone-100 p-8 md:p-12 relative z-10">
            <p className="text-sm text-stone-500 font-light leading-relaxed text-center max-w-2xl mx-auto">
              Welcome to the Scentmix Engine. First, log the fragrances sitting on your tray. 
              Then, search for any £200+ luxury silhouette you desire. We will calculate the 
              exact missing piece needed to bridge your collection to the final profile.
            </p>
          </div>

          {/* STEP 01: INVENTORY */}
          <div className="p-8 md:p-12 relative z-10 border-b border-stone-100">
            <div className="flex items-center gap-6 mb-8">
              <span className="font-serif text-3xl md:text-4xl text-stone-300">01</span>
              <div>
                <h2 className="font-serif text-2xl font-light text-stone-900">Establish Baseline</h2>
                <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">What do you currently own?</p>
              </div>
            </div>

            <div className="pl-0 md:pl-16">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-stone-100 pb-6 mb-6">
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
                  <span className="text-stone-200 hidden md:block">|</span>
                  <button 
                    onClick={() => setScanModalOpen(true)}
                    className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-semibold text-stone-500 hover:text-stone-900 transition-colors"
                  >
                    <Camera className="w-4 h-4" strokeWidth={1.5} />
                    Scan Shelf
                  </button>
                </div>
              </div>

              {/* Active Wardrobe */}
              {myShelf.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-6">
                  {myShelf.map((b) => (
                    <span key={b} className="group flex items-center justify-between gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 hover:border-stone-300 transition-colors">
                      <span className="text-[11px] font-medium text-stone-700">{b}</span>
                      <button onClick={() => removeBottle(b)} className="text-stone-400 hover:text-stone-900">
                        <X className="w-3 h-3" strokeWidth={2} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-stone-200 bg-stone-50/50 mb-6">
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest">Inventory is empty</p>
                </div>
              )}

              {/* Quick Add */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-semibold text-stone-400 uppercase mr-2">Common:</span>
                {POPULAR_SHELF_PRESETS.filter((p) => !myShelf.includes(p)).map((preset) => (
                  <button 
                    key={preset}
                    onClick={() => addBottle(preset)}
                    className="text-[10px] uppercase tracking-wider bg-white border border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900 px-2 py-1 transition-all"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 02: AMBITION (The visually prominent core search) */}
          <div className="p-8 md:p-12 relative z-10">
            
            {/* Animate down arrow to draw the eye */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white px-2">
              <ArrowDown className="w-5 h-5 text-stone-300" strokeWidth={1.5} />
            </div>

            <div className="flex flex-col items-center text-center mt-6 mb-10">
              <span className="font-serif text-3xl md:text-4xl text-stone-300 mb-4 block">02</span>
              <h2 className="font-serif text-4xl md:text-5xl font-light text-stone-900 leading-tight">
                What do you want <br className="hidden md:block" />to smell like?
              </h2>
            </div>

            <div className="px-0 md:px-16">
              {/* Editorial Search Bar */}
              <form onSubmit={handleTargetSearch} className="relative mb-8">
                <input 
                  type="text"
                  value={targetSearchInput}
                  onChange={(e) => setTargetSearchInput(e.target.value)}
                  placeholder="Search target silhouette (e.g. Angels Share, Bleu de Chanel)..."
                  className="w-full bg-transparent border-b-2 border-stone-200 py-4 pl-0 pr-12 text-lg md:text-xl font-serif text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors text-center md:text-left"
                />
                <button type="submit" className="absolute right-0 top-4 text-stone-400 hover:text-stone-900 transition-colors">
                  <Search className="w-6 h-6" strokeWidth={1.5} />
                </button>
              </form>

              {/* Quick Presets for Target */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {BRIDGE_TARGET_DATABASE.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => {
                      setTargetQuery(t.name);
                      setTargetSearchInput(t.name);
                      setTimeout(() => {
                        document.getElementById('synthesis-results')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 100);
                    }}
                    className="text-[10px] uppercase tracking-wider border border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900 bg-white px-4 py-2 transition-all"
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 03: SYNTHESIS RESULTS (Only appears when searched) */}
          {calculatedBridgeData && (
            <div id="synthesis-results" className="p-8 md:p-12 relative z-10 border-t border-stone-100 bg-stone-50 animate-in fade-in slide-in-from-top-4 duration-500">
              
              <div className="flex items-center gap-6 mb-8">
                <span className="font-serif text-3xl md:text-4xl text-stone-300">03</span>
                <div>
                  <h2 className="font-serif text-2xl font-light text-stone-900">Synthesis Engine</h2>
                  <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">Bridging the gap</p>
                </div>
              </div>

              <div className="pl-0 md:pl-16">
                
                {/* Target Overview */}
                <div className="mb-10 pb-10 border-b border-stone-200">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-2">Target Acquired: {calculatedBridgeData.target.house}</span>
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <h3 className="font-serif text-3xl md:text-4xl text-stone-900">{calculatedBridgeData.target.name}</h3>
                    <span className="text-sm font-medium text-stone-600">Retail: {calculatedBridgeData.target.retail}</span>
                  </div>
                </div>

                {calculatedBridgeData.bridge ? (
                  /* User owns a bridge base */
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h4 className="font-serif text-2xl text-stone-900 mb-1">Blueprint Complete</h4>
                        <p className="text-sm text-stone-500">You already possess {calculatedBridgeData.bridge.ownedCoverage} of this profile.</p>
                      </div>
                      <span className="hidden md:inline-block bg-stone-900 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-1">
                        {calculatedBridgeData.bridge.targetMatch} Match
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                      {/* Connecting Line (Desktop) */}
                      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-6 border-t border-dashed border-stone-300 z-0"></div>

                      {/* Owned Box */}
                      <div className="bg-white border border-stone-200 p-6 relative z-10">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-3">Foundation (Owned)</span>
                        <h5 className="font-serif text-lg text-stone-900 mb-2">{calculatedBridgeData.bridge.matchingShelfBottle}</h5>
                        <p className="text-xs text-stone-500">{calculatedBridgeData.bridge.ownedRole}</p>
                      </div>

                      {/* Missing Link Box */}
                      <div className="bg-stone-100 border border-stone-200 p-6 relative z-10">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-stone-900 block mb-3">Missing Element (Required)</span>
                        <h5 className="font-serif text-lg text-stone-900 mb-2">{calculatedBridgeData.bridge.missingPieceName}</h5>
                        <p className="text-xs text-stone-500 mb-6">{calculatedBridgeData.bridge.missingRole}</p>
                        
                        {/* CRITICAL MONETIZATION CTA - STARK BLACK */}
                        <button className="w-full bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center gap-2 px-6 py-3 text-[10px] uppercase tracking-widest font-bold transition-all shadow-md">
                          <ShoppingBag className="w-3.5 h-3.5" strokeWidth={2} />
                          Acquire Element • {calculatedBridgeData.bridge.missingPrice}
                        </button>
                      </div>
                    </div>

                    {/* Application Protocol */}
                    <div className="mt-8 pt-6 border-t border-stone-200">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-2">Application Protocol</span>
                      <p className="text-sm text-stone-800 leading-relaxed font-serif italic">
                        &quot;{calculatedBridgeData.bridge.recipe}&quot;
                      </p>
                    </div>
                  </div>
                ) : (
                  /* User owns nothing relevant - Show Solo Clone CTA */
                  <div className="text-center">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-2">Standard Alternative</span>
                    <h4 className="font-serif text-2xl text-stone-900 mb-3">{calculatedBridgeData.target.defaultSoloClone.name}</h4>
                    <p className="text-sm text-stone-500 max-w-md mx-auto leading-relaxed mb-8">
                      {calculatedBridgeData.target.defaultSoloClone.desc}
                    </p>
                    
                    {/* CRITICAL MONETIZATION CTA */}
                    <button className="bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center gap-2 px-8 py-4 w-full md:w-auto mx-auto text-[11px] uppercase tracking-widest font-bold transition-all shadow-md">
                      <ShoppingBag className="w-4 h-4" />
                      Acquire 1-Bottle Clone • {calculatedBridgeData.target.defaultSoloClone.price}
                    </button>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest mt-6">
                      Want to unlock 95% fidelity? Ensure your entire collection is logged above to check for synergistic bridges.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
