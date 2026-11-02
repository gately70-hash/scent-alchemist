'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, Camera, X, Loader2, 
  Trash2, Plus, ShoppingBag, ArrowDown, Sparkles, Layers, ArrowRight, Check, FlaskConical 
} from 'lucide-react';

const POPULAR_SHELF_PRESETS = [
  "Dior Sauvage EdT", "Bleu de Chanel EdP", "Creed Aventus", 
  "Lattafa Asad", "Armaf Club de Nuit Intense Man", "Zara Warm Black",
  "Maison Margiela By the Fireplace", "Tom Ford Noir Extreme",
  "Kilian Angels Share", "Versace Eros EdT", "Afnan 9PM", "Lattafa Khamrah"
];

// Dynamic Database for Instant Alchemy
const INSTANT_ALCHEMY_DATABASE = [
  {
    target: "Dior Sauvage Elixir",
    match: "94%",
    desc: "Spicy lavender with dark licorice and grapefruit core.",
    bottleA: "Lattafa Asad",
    roleA: "Base (2 Sprays)",
    noteA: "Warm Spices & Resins",
    bottleB: "Bleu de Chanel EdP",
    roleB: "Top Accent (1 Spray)",
    noteB: "Grapefruit & Mint"
  },
  {
    target: "Tom Ford Tobacco Vanille",
    match: "91%",
    desc: "Cured pipe tobacco, smoky wood hearth, and sweet tonka.",
    bottleA: "Maison Margiela By the Fireplace",
    roleA: "Base (1 Spray)",
    noteA: "Cade & Guaiac Wood",
    bottleB: "Zara Warm Black",
    roleB: "Accent Layer (2 Sprays)",
    noteB: "Gourmand Vanilla & Tonka"
  },
  {
    target: "Creed Aventus Absolu",
    match: "94%",
    desc: "Smoky birch tar modernized with dark cardamom and warm spices.",
    bottleA: "Armaf Club de Nuit Intense Man",
    roleA: "Base Layer (2 Sprays)",
    noteA: "Smoky Birch & Pineapple",
    bottleB: "Lattafa Asad",
    roleB: "Spice Accent (1 Spray)",
    noteB: "Cinnamon & Dark Licorice"
  },
  {
    target: "Kilian Angels Share",
    match: "95%",
    desc: "Boozy cognac oak barrels with a syrupy praline and date core.",
    bottleA: "Lattafa Khamrah",
    roleA: "Sweet Core (2 Sprays)",
    noteA: "Dates, Praline & Vanilla",
    bottleB: "Zara Sand Desert At Sunset",
    roleB: "Woody Accent (1 Spray)",
    noteB: "Dry Oak & Iris"
  }
];

// Target definitions with naturalized text and removed purchase prices
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
        missingRole: "Creamy resinous sandalwood & dense woody base",
        targetMatch: "96%",
        recipe: "Apply 2 sprays of your Bleu de Chanel EdP, wait 45s, then overlay 1 spray of your new sandalwood base to anchor the citrus into a rich pure Parfum drydown."
      },
      {
        matchingShelfBottle: "Versace Dylan Blue",
        ownedCoverage: "60%",
        ownedRole: "Aquatic ambroxan & bergamot freshness",
        missingPieceName: "Zara Sand Desert At Sunset",
        missingRole: "Dry cedarwood, tonka & warm resinous anchor",
        targetMatch: "91%",
        recipe: "Layer 2 sprays of your Dylan Blue over 1 spray of your new warm dry cedar to dial back the sweet aquatic notes into refined Chanel woods."
      }
    ],
    defaultSoloClone: {
      name: "Armaf Club de Nuit Blue Iconic",
      desc: "A highly rated alternative that beautifully captures the fresh, woody citrus vibe of Bleu de Chanel without breaking the bank."
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
        missingRole: "Dry boozy cognac oak & powdery iris",
        targetMatch: "95%",
        recipe: "Spray 2 sprays of your Khamrah, wait 45s, then overlay 1 spray of your new Zara Sand Desert to cut the syrupy sweetness into charred boozy oak barrels."
      },
      {
        matchingShelfBottle: "Zara Warm Black",
        ownedCoverage: "45%",
        ownedRole: "Spiced vanilla and warm sweet amber",
        missingPieceName: "Lattafa Khamrah",
        missingRole: "Praline, heavy cinnamon, and rich boozy notes",
        targetMatch: "90%",
        recipe: "Layer 2 sprays of your new heavy praline clone over 1 spray of your Zara Warm Black for a dense holiday gourmand sillage."
      }
    ],
    defaultSoloClone: {
      name: "Lattafa Khamrah",
      desc: "A fantastic, rich alternative that perfectly captures the warm cinnamon and praline feel of Angels Share."
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
        missingRole: "Dark cardamom, cinnamon spice & warm amber warmth",
        targetMatch: "94%",
        recipe: "Apply 2 sprays of your CDNIM, then add 1 spray of your new Lattafa Asad directly over it to turn classic smoky Aventus into the limited spiced Absolu edition."
      }
    ],
    defaultSoloClone: {
      name: "Montagne Parfums Pineapple Absolu",
      desc: "A spot-on alternative that delivers the signature smoky, fruity profile of Aventus."
    }
  }
];

export default function ScentAlchemistApp() {
  const [myShelf, setMyShelf] = useState([]);
  const [customInput, setCustomInput] = useState("");
  
  const [targetQuery, setTargetQuery] = useState("");
  const [targetSearchInput, setTargetSearchInput] = useState("");

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

  const unlockedRecipes = useMemo(() => {
    return INSTANT_ALCHEMY_DATABASE.filter(recipe => {
      const ownsA = myShelf.some(b => b.toLowerCase().includes(recipe.bottleA.toLowerCase()) || recipe.bottleA.toLowerCase().includes(b.toLowerCase()));
      const ownsB = myShelf.some(b => b.toLowerCase().includes(recipe.bottleB.toLowerCase()) || recipe.bottleB.toLowerCase().includes(b.toLowerCase()));
      return ownsA && ownsB;
    });
  }, [myShelf]);

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
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans selection:bg-amber-200 selection:text-stone-900 pb-24">
      
      <header className="sticky top-0 z-40 px-4 py-4 md:px-8">
        <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-lg border border-stone-200/50 shadow-sm rounded-3xl px-6 py-4 flex items-center justify-between transition-all">
          <div className="flex items-center gap-4 hover:opacity-90 transition-opacity cursor-default">
            <div className="bg-stone-900 text-amber-400 p-2.5 rounded-xl shadow-md flex items-center justify-center">
              <Sparkles className="w-6 h-6" strokeWidth={2} />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-black tracking-[0.15em] uppercase text-transparent bg-clip-text bg-gradient-to-br from-stone-900 via-stone-700 to-stone-400">
              Scentmix
            </h1>
          </div>
          <div className="flex items-center gap-3 bg-stone-100 px-4 py-2 rounded-full text-xs font-bold text-stone-600 shadow-inner">
            <Layers className="w-4 h-4 text-stone-500" />
            <span className="hidden md:inline">Inventory</span> ({myShelf.length})
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-8 font-medium">Welcome to Scentmix.</h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="bg-white p-8 rounded-3xl shadow-lg shadow-stone-200/50 border border-stone-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-stone-900 text-white rounded-full flex items-center justify-center font-bold text-xl mb-6 shadow-md">
                01
              </div>
              <p className="text-stone-600 leading-relaxed font-medium">
                Add the fragrances you currently own. We will instantly show you which luxury designer scents you can recreate just by layering your existing bottles.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-lg shadow-stone-200/50 border border-stone-100 hover:-translate-y-1 transition-transform duration-300">
              <div className="w-12 h-12 bg-stone-900 text-white rounded-full flex items-center justify-center font-bold text-xl mb-6 shadow-md">
                02
              </div>
              <p className="text-stone-600 leading-relaxed font-medium">
                Input any designer scent you desire. We will cross-reference it against your collection and reveal the exact missing piece you need to acquire to complete the scent profile.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl shadow-stone-200/50 border border-stone-100 overflow-hidden mb-12">
          <div className="bg-stone-900 text-white px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <h3 className="font-serif text-2xl">Step 01: What do you own?</h3>
            <button 
              onClick={() => setScanModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4" />
              Scan with Camera
            </button>
          </div>
          
          <div className="p-8 md:p-10">
            <div className="relative flex items-center gap-3 mb-8">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input 
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addBottle(customInput)}
                  placeholder="Enter a fragrance name you own..."
                  className="w-full bg-stone-50 border-2 border-stone-100 hover:border-stone-200 focus:border-stone-900 focus:bg-white rounded-2xl py-4 pl-12 pr-4 text-base text-stone-900 placeholder-stone-400 focus:outline-none transition-all outline-none"
                />
              </div>
              <button 
                onClick={() => addBottle(customInput)}
                className="bg-stone-900 hover:bg-stone-800 text-white h-[56px] px-8 rounded-2xl font-bold transition-all shadow-md active:scale-95"
              >
                Add
              </button>
            </div>

            <div className="min-h-[120px] bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200 p-6 flex flex-col justify-center mb-6">
              {myShelf.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {myShelf.map((b) => (
                    <div key={b} className="bg-white border border-stone-200 shadow-sm rounded-full pl-4 pr-2 py-2 flex items-center gap-3 hover:border-stone-300 transition-colors animate-in zoom-in-95 duration-200">
                      <span className="text-sm font-medium text-stone-700">{b}</span>
                      <button onClick={() => removeBottle(b)} className="bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-full p-1 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-400 font-medium text-center">Your tray is empty. Add a bottle above to begin.</p>
              )}
            </div>

            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 pl-2">Popular additions</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SHELF_PRESETS.filter((p) => !myShelf.includes(p)).map((preset) => (
                  <button 
                    key={preset}
                    onClick={() => addBottle(preset)}
                    className="bg-white border border-stone-200 text-stone-500 hover:border-stone-400 hover:text-stone-800 rounded-lg px-3 py-1.5 text-xs font-medium transition-all shadow-sm active:scale-95 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {myShelf.length >= 2 && (
          <div className="mb-16 animate-in slide-in-from-bottom-8 fade-in duration-700">
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-amber-500" />
              <h3 className="font-serif text-2xl text-stone-900">What you can recreate right now</h3>
            </div>
            
            {unlockedRecipes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {unlockedRecipes.map(recipe => (
                  <div key={recipe.target} className="bg-white rounded-3xl p-8 shadow-lg shadow-stone-200/50 border border-stone-100 flex flex-col h-full">
                    <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full w-max mb-4 border border-emerald-200">
                      {recipe.match} Match Found
                    </div>
                    <h4 className="text-xl font-serif font-bold text-stone-900">{recipe.target}</h4>
                    <p className="text-sm text-stone-500 mt-2 mb-6 flex-1">{recipe.desc}</p>
                    <div className="bg-stone-50 rounded-2xl p-5 space-y-3 border border-stone-200">
                      <div className="flex justify-between items-center border-b border-stone-200 pb-3">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{recipe.roleA}</span>
                        <span className="text-sm font-semibold text-stone-800 text-right max-w-[60%]">{recipe.bottleA}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{recipe.roleB}</span>
                        <span className="text-sm font-semibold text-stone-800 text-right max-w-[60%]">{recipe.bottleB}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-stone-200 shadow-sm rounded-3xl p-10 text-center flex flex-col items-center">
                <FlaskConical className="w-10 h-10 text-stone-300 mb-4" />
                <h4 className="font-serif text-xl text-stone-900 mb-2">Analyzing your collection...</h4>
                <p className="text-stone-500 max-w-md mx-auto">
                  You have {myShelf.length} bottles, but you haven't unlocked a complete synergistic pairing yet. Continue adding to your inventory to discover instant layering recipes.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-stone-100 rounded-[2.5rem] p-6 md:p-12 shadow-inner border border-stone-200">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-full shadow-sm mb-6">
              <ArrowDown className="w-6 h-6 text-stone-400" />
            </span>
            <h2 className="font-serif text-3xl md:text-4xl text-stone-900 font-medium mb-4">Step 02: What do you want to smell like?</h2>
            <p className="text-stone-500 font-medium">Search for your desired scent below.</p>
          </div>

          <form onSubmit={handleTargetSearch} className="max-w-2xl mx-auto relative mb-8">
            <Search className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text"
              value={targetSearchInput}
              onChange={(e) => setTargetSearchInput(e.target.value)}
              placeholder="Input any designer scent you desire..."
              className="w-full bg-white border-2 border-stone-200 hover:border-stone-300 focus:border-stone-900 rounded-3xl py-5 pl-16 pr-16 text-lg font-serif text-stone-900 placeholder-stone-400 focus:outline-none transition-all shadow-xl shadow-stone-200/50"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-stone-900 hover:bg-stone-800 text-white p-3 rounded-full transition-transform active:scale-95">
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-2 mb-8 max-w-3xl mx-auto">
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
                className="bg-white border border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900 rounded-xl px-4 py-2 text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                {t.name}
              </button>
            ))}
          </div>

          <div id="synthesis-results">
            {calculatedBridgeData && (
              <div className="animate-in fade-in zoom-in-95 duration-500 max-w-4xl mx-auto mt-12">
                
                {calculatedBridgeData.bridge ? (
                  <div className="bg-white rounded-3xl overflow-hidden shadow-2xl shadow-stone-300/50 border border-stone-200">
                    
                    <div className="bg-stone-900 text-white p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
                      <div className="relative z-10">
                        <span className="text-stone-400 text-xs font-bold uppercase tracking-wider mb-2 block">Target Acquired</span>
                        <h3 className="font-serif text-3xl md:text-4xl">{calculatedBridgeData.target.name}</h3>
                      </div>
                      <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-4 text-right">
                        <span className="block text-[10px] uppercase tracking-widest text-stone-300 mb-1">Retail</span>
                        <span className="text-xl font-light">{calculatedBridgeData.target.retail}</span>
                      </div>
                    </div>

                    <div className="p-8 md:p-10">
                      <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-800 px-4 py-3 rounded-xl mb-8 w-max">
                        <Check className="w-5 h-5 text-emerald-600" strokeWidth={2.5}/>
                        <span className="font-bold">{calculatedBridgeData.bridge.targetMatch} Match Possible</span>
                      </div>

                      <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 relative mb-8">
                        
                        <div className="flex-1 bg-stone-50 rounded-2xl p-6 border border-stone-200 flex flex-col justify-center">
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2">01. You Already Own</span>
                          <h5 className="font-serif text-2xl text-stone-900 mb-2">{calculatedBridgeData.bridge.matchingShelfBottle}</h5>
                          <p className="text-sm text-stone-600">{calculatedBridgeData.bridge.ownedRole}</p>
                        </div>

                        <div className="flex items-center justify-center -my-3 md:my-0 md:-mx-3 relative z-20">
                          <div className="bg-stone-900 text-white p-3 rounded-full shadow-lg border-4 border-white">
                            <Plus className="w-6 h-6" />
                          </div>
                        </div>

                        <div className="flex-1 bg-white rounded-2xl p-6 border-2 border-stone-900 shadow-xl relative flex flex-col justify-center">
                          <span className="text-[10px] font-bold text-stone-900 uppercase tracking-widest block mb-2">02. Missing Element</span>
                          <h5 className="font-serif text-2xl text-stone-900 mb-2">{calculatedBridgeData.bridge.missingPieceName}</h5>
                          <p className="text-sm text-stone-600">{calculatedBridgeData.bridge.missingRole}</p>
                        </div>
                      </div>

                      <div className="bg-stone-50 rounded-2xl p-6 md:p-8 border border-stone-200 mb-8">
                        <div className="flex items-center gap-3 mb-3">
                          <FlaskConical className="w-5 h-5 text-stone-400" />
                          <h4 className="font-serif text-xl font-bold text-stone-900">The Synthesis Protocol</h4>
                        </div>
                        <p className="text-base md:text-lg text-stone-700 leading-relaxed font-serif italic">
                          "{calculatedBridgeData.bridge.recipe}"
                        </p>
                      </div>

                      <button className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-2xl py-5 flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-xl active:scale-95">
                        <ShoppingBag className="w-5 h-5" />
                        Acquire Missing Element
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl shadow-stone-300/50 border border-stone-200 text-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-2 bg-stone-900"></div>
                    <span className="text-xs font-bold text-stone-400 uppercase tracking-widest block mb-4">Closest Single Match</span>
                    <h4 className="font-serif text-4xl text-stone-900 mb-4">{calculatedBridgeData.target.defaultSoloClone.name}</h4>
                    <p className="text-base text-stone-600 max-w-xl mx-auto leading-relaxed mb-8">
                      {calculatedBridgeData.target.defaultSoloClone.desc}
                    </p>
                    
                    <button className="mx-auto bg-stone-900 hover:bg-stone-800 text-white rounded-2xl px-8 py-5 flex items-center justify-center gap-3 font-bold text-lg transition-all shadow-xl active:scale-95 hover:shadow-2xl">
                      <ShoppingBag className="w-5 h-5" />
                      Acquire Alternative
                    </button>
                    
                    <p className="text-xs text-stone-400 font-medium mt-8">
                      Have more bottles? Add your full collection above to see if you can mix your way to an even closer match.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {scanModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setScanModalOpen(false); setScanStep('upload'); }}
              className="absolute top-6 right-6 text-stone-400 hover:bg-stone-100 hover:text-stone-900 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-stone-900 mb-6">Scan Inventory</h3>
            
            {scanStep === 'upload' && (
              <div className="space-y-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-stone-200 hover:border-stone-900 rounded-2xl p-12 text-center cursor-pointer bg-stone-50 transition-colors group"
                >
                  <Camera className="w-8 h-8 text-stone-400 group-hover:text-stone-900 mx-auto mb-4 transition-colors" />
                  <p className="text-sm font-bold text-stone-900">Capture Collection</p>
                  <p className="text-xs text-stone-500 mt-2">Upload a photograph of your bottles</p>
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
                  <span className="text-xs text-stone-400 font-bold uppercase">or</span>
                  <div className="h-px bg-stone-200 flex-1"></div>
                </div>

                <button 
                  onClick={simulatedScan}
                  className="w-full bg-stone-100 hover:bg-stone-200 text-stone-900 rounded-xl px-6 py-4 text-sm font-bold transition-colors"
                >
                  Run Demo Calibration
                </button>
              </div>
            )}

            {scanStep === 'processing' && (
              <div className="py-16 text-center">
                <Loader2 className="w-10 h-10 text-stone-900 animate-spin mx-auto mb-6" />
                <p className="text-sm font-bold text-stone-900 uppercase tracking-wider">Analyzing Image...</p>
              </div>
            )}

            {scanStep === 'review' && (
              <div className="space-y-6">
                <p className="text-sm text-stone-600 font-medium">
                  Review the detected bottles below.
                </p>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                  {detectedBottles.map((b, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
                      <input 
                        type="text"
                        value={b.name}
                        onChange={(e) => updateDetected(idx, e.target.value)}
                        className="flex-1 bg-transparent text-sm font-semibold text-stone-900 focus:outline-none"
                      />
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        {b.confidence}%
                      </span>
                      <button 
                        onClick={() => removeDetected(idx)}
                        className="text-stone-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <input 
                    type="text"
                    value={newManualBottle}
                    onChange={(e) => setNewManualBottle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addManualToDetected()}
                    placeholder="Add missing item..."
                    className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                  <button 
                    onClick={addManualToDetected}
                    className="bg-stone-900 text-white rounded-xl px-4 flex items-center justify-center hover:bg-stone-800 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>

                <button 
                  onClick={confirmDetected}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white rounded-xl px-6 py-4 text-sm font-bold transition-all active:scale-95 shadow-lg mt-2"
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
