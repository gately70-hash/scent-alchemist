'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, Camera, Upload, X, Loader2, 
  Trash2, Plus, ArrowRight, ShoppingBag, Check
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
        missingPieceName: "Lattafa Bade'e Al Oud or Sandalwood Oil",
        missingPrice: "£18",
        missingRole: "Creamy resinous sandalwood & dense woody base",
        targetMatch: "96%",
        recipe: "Apply 2 sprays of Bleu de Chanel EdP, wait 45s, then overlay 1 spray of the sandalwood base to anchor the citrus into a rich pure Parfum drydown."
      },
      {
        matchingShelfBottle: "Versace Dylan Blue",
        ownedCoverage: "60%",
        ownedRole: "Aquatic ambroxan & bergamot freshness",
        missingPieceName: "Zara Sand Desert At Sunset or Iso E Super",
        missingPrice: "£22",
        missingRole: "Dry cedarwood, tonka & warm resinous anchor",
        targetMatch: "91%",
        recipe: "Layer 2 sprays of Dylan Blue over 1 spray of warm dry cedar to dial back the sweet aquatic notes into refined Chanel woods."
      },
      {
        matchingShelfBottle: "Dior Sauvage EdT",
        ownedCoverage: "55%",
        ownedRole: "Radiant ambroxan and sharp bergamot pepper",
        missingPieceName: "Lattafa Khamrah or Zara Warm Black",
        missingPrice: "£20",
        missingRole: "Warm resin, tonka & creamy sandalwood depth",
        targetMatch: "89%",
        recipe: "Spray 1 base layer of warm tonka/wood, then spray 2 light layers of Sauvage to inject that crisp designer opening."
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
  const [activeTab, setActiveTab] = useState('bridge');
  const [myShelf, setMyShelf] = useState([]);
  const [customInput, setCustomInput] = useState("");
  
  // Bridge Target Search State
  const [targetQuery, setTargetQuery] = useState("Bleu de Chanel Parfum");
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
    }
  };

  // The Bridge Calculation Algorithm
  const calculatedBridgeData = useMemo(() => {
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
      
      {/* Editorial Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 px-8 py-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="font-serif text-2xl tracking-[0.2em] font-light uppercase text-stone-900">
              Scent Alchemist
            </h1>
            <p className="text-[10px] tracking-widest uppercase text-stone-400 mt-1 font-semibold">
              Bespoke Silhouette Synthesis
            </p>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('shelf')}
              className={`text-[11px] tracking-widest uppercase font-semibold transition-all pb-1 border-b-2 ${
                activeTab === 'shelf' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              My Collection ({myShelf.length})
            </button>
            <button 
              onClick={() => setActiveTab('bridge')}
              className={`text-[11px] tracking-widest uppercase font-semibold transition-all pb-1 border-b-2 ${
                activeTab === 'bridge' ? 'border-stone-900 text-stone-900' : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              Silhouette Bridge
            </button>
          </div>
        </div>
      </header>

      {/* Main Editorial Container */}
      <main className="max-w-5xl mx-auto p-6 md:p-12">
        
        {activeTab === 'shelf' ? (
          /* TAB 1: Collection / Wardrobe */
          <div className="animate-in fade-in duration-500">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-serif text-3xl font-light text-stone-900 mb-3">Curate Your Collection</h2>
              <p className="text-sm text-stone-500 font-light leading-relaxed">
                Inventory your current fragrances. We analyze your olfactory profile to determine which luxury silhouettes you are already positioned to synthesize.
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
          </div>
        ) : (
          /* TAB 2: Bridge Engine */
          <div className="animate-in fade-in duration-500">
            
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-serif text-3xl font-light text-stone-900 mb-3">Silhouette Bridge</h2>
              <p className="text-sm text-stone-500 font-light leading-relaxed">
                Enter your desired luxury fragrance. We analyze your collection to find your foundation piece, calculating the exact missing element required to complete the profile.
              </p>
            </div>

            {/* Editorial Search Bar */}
            <form onSubmit={handleTargetSearch} className="max-w-2xl mx-auto relative mb-16">
              <input 
                type="text"
                value={targetSearchInput}
                onChange={(e) => setTargetSearchInput(e.target.value)}
                placeholder="Enter target fragrance (e.g. Bleu de Chanel Parfum, Angels Share)..."
                className="w-full bg-transparent border-b-2 border-stone-200 py-4 pl-0 pr-12 text-lg font-serif text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
              />
              <button type="submit" className="absolute right-0 top-4 text-stone-400 hover:text-stone-900 transition-colors">
                <Search className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </form>

            {/* Target Display Profile */}
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

              <div className="mb-10">
                <span className="text-[10px] uppercase tracking-widest font-semibold text-stone-400 block mb-3">Key Accords</span>
                <div className="flex flex-wrap gap-2">
                  {calculatedBridgeData.target.notes.map((n) => (
                    <span key={n} className="text-[10px] uppercase tracking-wider border border-stone-200 text-stone-600 px-3 py-1">
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Engine Results */}
              {calculatedBridgeData.bridge ? (
                /* Success Route: User owns a bridge */
                <div className="bg-stone-50 border border-stone-200 p-8 md:p-10">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center">
                        <Check className="w-4 h-4" strokeWidth={2} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest text-stone-900">Synthesis Available</h4>
                        <p className="text-xs text-stone-500 mt-0.5">You own {calculatedBridgeData.bridge.ownedCoverage} of this profile.</p>
                      </div>
                    </div>
                    <div className="text-center border border-stone-300 bg-white px-4 py-2">
                      <span className="block text-[10px] uppercase tracking-widest text-stone-500 font-semibold mb-0.5">Fidelity Match</span>
                      <span className="text-lg font-serif text-stone-900">{calculatedBridgeData.bridge.targetMatch}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-stone-200 pt-8">
                    {/* Element 1 (Owned) */}
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-2">Foundation • From Inventory</span>
                      <h5 className="font-serif text-xl text-stone-900 mb-2">{calculatedBridgeData.bridge.matchingShelfBottle}</h5>
                      <p className="text-xs text-stone-500 leading-relaxed">{calculatedBridgeData.bridge.ownedRole}</p>
                    </div>

                    {/* Element 2 (Missing) */}
                    <div>
                      <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-2">Accent • Required Acquisition</span>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h5 className="font-serif text-xl text-stone-900">{calculatedBridgeData.bridge.missingPieceName}</h5>
                        <span className="text-sm font-medium text-stone-900 bg-white border border-stone-200 px-2 py-1">{calculatedBridgeData.bridge.missingPrice}</span>
                      </div>
                      <p className="text-xs text-stone-500 leading-relaxed">{calculatedBridgeData.bridge.missingRole}</p>
                    </div>
                  </div>

                  {/* Application Protocol */}
                  <div className="mt-8 pt-8 border-t border-stone-200">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-3">Application Protocol</span>
                    <p className="text-sm text-stone-700 leading-relaxed font-serif italic">
                      &quot;{calculatedBridgeData.bridge.recipe}&quot;
                    </p>
                  </div>
                </div>
              ) : (
                /* Fallback Route: User owns nothing relevant */
                <div className="bg-stone-50 border border-stone-200 p-8 md:p-10 text-center">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-stone-400 block mb-2">Standard Alternative</span>
                  <h4 className="font-serif text-2xl text-stone-900 mb-2">{calculatedBridgeData.target.defaultSoloClone.name}</h4>
                  <span className="inline-block border border-stone-300 bg-white px-3 py-1 text-xs font-semibold text-stone-600 mb-6">Est. {calculatedBridgeData.target.defaultSoloClone.price}</span>
                  <p className="text-sm text-stone-500 max-w-md mx-auto leading-relaxed">
                    {calculatedBridgeData.target.defaultSoloClone.desc}
                  </p>
                  
                  <div className="mt-8 pt-8 border-t border-stone-200">
                    <p className="text-xs text-stone-400 uppercase tracking-widest mb-4">Add your collection in the Wardrobe tab to calculate bespoke layering bridges.</p>
                    <button 
                      onClick={() => setActiveTab('shelf')}
                      className="bg-stone-900 hover:bg-stone-800 text-white px-8 py-3 text-[10px] uppercase tracking-widest font-semibold transition-colors"
                    >
                      Update Inventory
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
