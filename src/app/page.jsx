'use client';

import React, { useState, useMemo, useRef } from 'react';
import { 
  Sparkles, Layers, FlaskConical, Search,
  Flame, Camera, Upload, X, Loader2, 
  Trash2, Plus, RotateCcw, ArrowRight, ShoppingBag, CheckCircle, ShieldAlert
} from 'lucide-react';

const POPULAR_SHELF_PRESETS = [
  "Dior Sauvage EdT", "Bleu de Chanel EdP", "Creed Aventus", 
  "Lattafa Asad", "Armaf Club de Nuit Intense Man", "Zara Warm Black",
  "Maison Margiela By the Fireplace", "Tom Ford Noir Extreme",
  "Kilian Angels Share", "Versace Eros EdT", "Afnan 9PM", "Lattafa Khamrah",
  "Montblanc Explorer", "Versace Dylan Blue", "Club de Nuit Untold"
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
        missingPieceName: "Lattafa Bade'e Al Oud (Honor & Glory) or Sandalwood Oil",
        missingPrice: "~£18",
        missingRole: "Creamy resinous sandalwood & dense woody base",
        targetMatch: "96%",
        recipe: "Apply 2 sprays of your Bleu de Chanel EdP, wait 45s, then overlay 1 spray of the sandalwood base to anchor the citrus into a rich pure Parfum drydown."
      },
      {
        matchingShelfBottle: "Versace Dylan Blue",
        ownedCoverage: "60%",
        ownedRole: "Aquatic ambroxan & bergamot freshness",
        missingPieceName: "Zara Sand Desert At Sunset or Iso E Super",
        missingPrice: "~£22",
        missingRole: "Dry cedarwood, tonka & warm resinous anchor",
        targetMatch: "91%",
        recipe: "Layer 2 sprays of your Dylan Blue over 1 spray of warm dry cedar to dial back the sweet aquatic notes into refined Chanel woods."
      },
      {
        matchingShelfBottle: "Dior Sauvage EdT",
        ownedCoverage: "55%",
        ownedRole: "Radiant ambroxan and sharp bergamot pepper",
        missingPieceName: "Lattafa Khamrah or Zara Warm Black",
        missingPrice: "~£20",
        missingRole: "Warm resin, tonka & creamy sandalwood depth",
        targetMatch: "89%",
        recipe: "Spray 1 base layer of warm tonka/wood, then spray 2 light layers of your Sauvage to inject that crisp designer opening."
      }
    ],
    defaultSoloClone: {
      name: "Armaf Club de Nuit Blue Iconic",
      price: "~£38",
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
        missingPrice: "~£22",
        missingRole: "Dry boozy cognac oak & powdery iris",
        targetMatch: "95%",
        recipe: "Spray 2 sprays of your Khamrah, wait 45s, then overlay 1 spray of Zara Sand Desert to cut the syrupy sweetness into charred boozy oak barrels."
      },
      {
        matchingShelfBottle: "Zara Warm Black",
        ownedCoverage: "45%",
        ownedRole: "Spiced vanilla and warm sweet amber",
        missingPieceName: "Lattafa Khamrah or French Boozy Amber Oil",
        missingPrice: "~£24",
        missingRole: "Praline, heavy cinnamon, and rich boozy notes",
        targetMatch: "90%",
        recipe: "Layer 2 sprays of a heavy praline/cinnamon clone over 1 spray of your Zara Warm Black for a dense holiday gourmand sillage."
      },
      {
        matchingShelfBottle: "Tom Ford Noir Extreme",
        ownedCoverage: "50%",
        ownedRole: "Kulfi, cardamom, and warm gourmand spices",
        missingPieceName: "Lattafa Khamrah",
        missingPrice: "~£24",
        missingRole: "Sharp boozy cognac and praline glaze",
        targetMatch: "92%",
        recipe: "Layer 1 spray of your Noir Extreme as the spicy base, topped with 2 sprays of Khamrah to create a decadent boozy drydown."
      }
    ],
    defaultSoloClone: {
      name: "Lattafa Khamrah",
      price: "~£25",
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
        missingPieceName: "Lattafa Asad (or Dior Sauvage)",
        missingPrice: "~£22",
        missingRole: "Dark cardamom, cinnamon spice & warm amber warmth",
        targetMatch: "94%",
        recipe: "Apply 2 sprays of your CDNIM, then add 1 spray of Lattafa Asad directly over it to turn classic smoky Aventus into the limited spiced Absolu edition."
      },
      {
        matchingShelfBottle: "Montblanc Explorer",
        ownedCoverage: "60%",
        ownedRole: "Clean bergamot, vetiver & smooth ambroxan core",
        missingPieceName: "Lattafa Asad",
        missingPrice: "~£22",
        missingRole: "Rich cinnamon, nutmeg and dark licorice-wood base",
        targetMatch: "91%",
        recipe: "Layer 1 spray of Asad as the spicy resin anchor, followed by 2 sprays of your Montblanc Explorer for the sparkling citrus top."
      }
    ],
    defaultSoloClone: {
      name: "Montagne Parfums Pineapple Absolu / CDNIM",
      price: "~£35",
      desc: "Captures the iconic birch leather and blackcurrant silhouette with masculine authority."
    }
  },
  {
    name: "Tobacco Vanille",
    aliases: ["tobacco vanille", "tom ford tobacco vanille", "tf tobacco"],
    house: "Tom Ford",
    retail: "£290 (50ml)",
    notes: ["Tobacco Leaf", "Spices", "Tonka Bean", "Vanilla", "Cacao", "Dry Fruits"],
    potentialBridges: [
      {
        matchingShelfBottle: "Maison Margiela By the Fireplace",
        ownedCoverage: "50%",
        ownedRole: "Smoky roasted chestnut & authentic guaiac wood hearth",
        missingPieceName: "Zara Warm Black or Lattafa Khamrah",
        missingPrice: "~£18",
        missingRole: "Gourmand spiced vanilla & tonka bean sweetness",
        targetMatch: "92%",
        recipe: "Spray 1 spray of your By the Fireplace, wait 60s, then overlay 2 sprays of Zara Warm Black to transform fireplace smoke into rich aromatic pipe tobacco."
      },
      {
        matchingShelfBottle: "Zara Warm Black",
        ownedCoverage: "55%",
        ownedRole: "Warm ginger, clove, and sweet vanilla amber",
        missingPieceName: "Lattafa Ameer Al Oudh or Fireplace Oil",
        missingPrice: "~£19",
        missingRole: "Dry smoky woods and cured leaf texture",
        targetMatch: "91%",
        recipe: "Apply 1 spray of smoky woods, then finish with 2 sprays of your Zara Warm Black to balance sweet tonka with authentic cured tobacco."
      }
    ],
    defaultSoloClone: {
      name: "Al Haramain Amber Oud Tobacco Edition",
      price: "~£45",
      desc: "Rich, pungent cured pipe tobacco drenched in clover honey and vanilla."
    }
  },
  {
    name: "Baccarat Rouge 540",
    aliases: ["baccarat rouge 540", "br540", "baccarat rouge", "mfk br540"],
    house: "Maison Francis Kurkdjian",
    retail: "£245 (70ml)",
    notes: ["Saffron", "Jasmine", "Amberwood", "Ambergris", "Fir Resin", "Cedar"],
    potentialBridges: [
      {
        matchingShelfBottle: "Club de Nuit Untold",
        ownedCoverage: "85%",
        ownedRole: "Spun-sugar amberwood & airy saffron core",
        missingPieceName: "Molecule 01 (Iso E Super)",
        missingPrice: "~£22",
        missingRole: "Cedarwood radiance & anti-anosmia projection lift",
        targetMatch: "97%",
        recipe: "Apply 1 spray of Iso E Super, then 2 sprays of your Untold. Prevents olfactory fatigue and boosts sillage to Extrait levels."
      }
    ],
    defaultSoloClone: {
      name: "Club de Nuit Untold",
      price: "~£35",
      desc: "Outstanding aerial saffron and spun-sugar cedarwood that rivals the original."
    }
  }
];

export default function ScentAlchemistApp() {
  const [activeTab, setActiveTab] = useState('shelf');
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
        { name: "Lattafa Asad", confidence: 94 },
        { name: "Zara Warm Black", confidence: 92 },
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

    // Check if the user owns ANY bottle that can act as a bridge
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
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navigation */}
      <header className="border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-300 flex items-center justify-center text-neutral-950 font-bold shadow-lg shadow-amber-500/20">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <span className="font-serif tracking-wider font-bold text-lg text-amber-100">SCENT ALCHEMIST</span>
            <p className="text-xs text-neutral-400">Wardrobe Remixer &amp; Target Bridge Calculator</p>
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
            My Wardrobe ({myShelf.length})
          </button>
          <button 
            onClick={() => setActiveTab('bridge')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'bridge' ? 'bg-amber-500 text-neutral-950 shadow-md' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Smell Like... (Bridge Engine)
          </button>
        </div>
      </header>

      {/* Main App Container */}
      <main className="max-w-5xl mx-auto p-6 md:p-8">
        {activeTab === 'shelf' ? (
          /* TAB 1: Wardrobe Remixer */
          <div className="space-y-6">
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
                <div>
                  <h2 className="text-xl font-serif font-bold text-neutral-100">My Fragrance Tray</h2>
                  <p className="text-xs text-neutral-400 mt-1">Add what you own. We remix your collection and calculate what you can clone.</p>
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
                  placeholder="Type a fragrance you own (e.g. Bleu de Chanel, Dior Sauvage, Lattafa Asad)..."
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
                  <p className="text-xs text-neutral-500">Your tray is empty. Add bottles above to calculate instant layering blends!</p>
                </div>
              )}

              <div className="mt-5 pt-4 border-t border-neutral-800">
                <span className="text-[11px] font-semibold text-neutral-500 mr-2 uppercase">Quick Add:</span>
                <div className="inline-flex flex-wrap gap-1.5 mt-2">
                  {POPULAR_SHELF_PRESETS.filter((p) => !myShelf.includes(p)).slice(0, 6).map((preset) => (
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

            {/* In-House Combos */}
            {myShelf.length >= 2 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-serif font-bold text-neutral-100 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" />
                    Profiles You Can Recreate Right Now (100% Owned)
                  </h3>
                  <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                    {myShelf.length} Bottles Analyzed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-neutral-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
                    <span className="text-[10px] bg-amber-500 text-neutral-950 font-bold px-2 py-0.5 rounded">94% Silhouette Match</span>
                    <h4 className="text-lg font-serif font-bold text-neutral-100 mt-2">Dior Sauvage Elixir</h4>
                    <p className="text-xs text-neutral-400 mt-1">Spicy lavender with dark licorice, clove, and grapefruit core.</p>
                    <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-neutral-950">
                        <span className="text-[10px] text-neutral-500 font-bold block">Base Layer (2 Sprays)</span>
                        <span className="text-neutral-200 font-medium">Lattafa Asad (Warm Spices &amp; Resins)</span>
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
                    <p className="text-xs text-neutral-400 mt-1">Cured pipe tobacco, smoky wood hearth, and sweet tonka.</p>
                    <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2 text-xs">
                      <div className="p-2.5 rounded-lg bg-neutral-950">
                        <span className="text-[10px] text-neutral-500 font-bold block">Base Layer (1 Spray)</span>
                        <span className="text-neutral-200 font-medium">By the Fireplace (Cade &amp; Guaiac Wood)</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-neutral-950">
                        <span className="text-[10px] text-neutral-500 font-bold block">Accent Layer (2 Sprays)</span>
                        <span className="text-neutral-200 font-medium">Zara Warm Black (Gourmand Vanilla &amp; Tonka)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-neutral-800 rounded-2xl p-12 text-center bg-neutral-900/30">
                <FlaskConical className="w-12 h-12 text-amber-500/40 mx-auto mb-4 stroke-1" />
                <h3 className="text-lg font-serif font-bold text-neutral-200">Your Wardrobe is Waiting</h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto mt-2">
                  Add at least 2 fragrances you own above to discover what luxury designer scents you can already brew.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* TAB 2: The "Bridge & Fill The Gap" Engine */
          <div className="space-y-6">
            <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 shadow-xl">
              <div>
                <h2 className="text-xl font-serif font-bold text-neutral-100 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Target Scent: Bridge Your Collection
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Type what you want to smell like. We calculate which bottle on your tray gets you halfway there, plus the 1 budget purchase to complete it.
                </p>
              </div>

              {/* Free Text Input */}
              <form onSubmit={handleTargetSearch} className="mt-5 flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                  <input 
                    type="text"
                    value={targetSearchInput}
                    onChange={(e) => setTargetSearchInput(e.target.value)}
                    placeholder="Enter what you want to smell like (e.g. Bleu de Chanel Parfum, Angels Share, Aventus Absolu)..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
                >
                  Bridge My Wardrobe
                </button>
              </form>

              {/* Trending Preset Pills */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-semibold text-neutral-500 uppercase mr-1">Popular Targets:</span>
                {BRIDGE_TARGET_DATABASE.map((t) => (
                  <button
                    key={t.name}
                    type="button"
                    onClick={() => {
                      setTargetQuery(t.name);
                      setTargetSearchInput(t.name);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      calculatedBridgeData.target.name === t.name
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>

              {/* Target Banner */}
              <div className="mt-6 bg-neutral-950 border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold">{calculatedBridgeData.target.house}</span>
                  <h3 className="text-2xl font-serif font-bold text-neutral-100">{calculatedBridgeData.target.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {calculatedBridgeData.target.notes.map((n) => (
                      <span key={n} className="text-[11px] bg-neutral-800 text-neutral-300 px-2.5 py-0.5 rounded-full">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 px-5 py-3 rounded-xl text-right">
                  <span className="text-[10px] uppercase text-neutral-500 block font-semibold">Luxury Retail Price</span>
                  <span className="text-lg font-bold text-amber-400">{calculatedBridgeData.target.retail}</span>
                </div>
              </div>

              {/* THE BRIDGE COMPARISON */}
              <div className="mt-8">
                {calculatedBridgeData.bridge ? (
                  /* Route A: The User Already Owns a Foundation Piece! */
                  <div className="bg-gradient-to-b from-neutral-900/90 to-neutral-950 border border-amber-500/50 rounded-2xl p-6 shadow-2xl relative">
                    <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                          Synergy Bridge Unlocked From Your Shelf
                        </span>
                        <h4 className="text-lg font-bold text-neutral-100 mt-1">
                          You already own {calculatedBridgeData.bridge.ownedCoverage} of this profile!
                        </h4>
                      </div>
                      <span className="bg-amber-500 text-neutral-950 font-black text-xs px-3 py-1.5 rounded-lg uppercase">
                        {calculatedBridgeData.bridge.targetMatch} Match
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                      {/* Left: What they have */}
                      <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400 block">
                          Step 1 • From Your Shelf (Owned)
                        </span>
                        <h5 className="text-sm font-bold text-neutral-100 mt-1">
                          {calculatedBridgeData.bridge.matchingShelfBottle}
                        </h5>
                        <p className="text-xs text-neutral-400 mt-1">
                          {calculatedBridgeData.bridge.ownedRole}
                        </p>
                      </div>

                      {/* Right: The missing purchase */}
                      <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/30">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-400 block">
                          Step 2 • The Missing Link (To Buy)
                        </span>
                        <div className="flex items-center justify-between mt-1">
                          <h5 className="text-sm font-bold text-neutral-100">
                            {calculatedBridgeData.bridge.missingPieceName}
                          </h5>
                          <span className="text-xs font-bold text-amber-300">{calculatedBridgeData.bridge.missingPrice}</span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          {calculatedBridgeData.bridge.missingRole}
                        </p>
                      </div>
                    </div>

                    {/* How to layer them */}
                    <div className="mt-5 p-4 rounded-xl bg-neutral-950 border border-neutral-800/80">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 block">Layering Blueprint:</span>
                      <p className="text-xs text-neutral-200 mt-1 leading-relaxed">
                        {calculatedBridgeData.bridge.recipe}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between pt-4 border-t border-neutral-800">
                      <span className="text-xs text-neutral-400">Total cost to smell like {calculatedBridgeData.target.retail}: <strong className="text-neutral-200">{calculatedBridgeData.bridge.missingPrice}</strong></span>
                      <button className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold px-4 py-2 rounded-xl text-xs transition-colors">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Find {calculatedBridgeData.bridge.missingPieceName.split(' ')[0]}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Route B: No matching bridge found on their shelf */
                  <div className="border border-neutral-800 rounded-2xl p-6 bg-neutral-950">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-neutral-500">Standard 1-Bottle Clone</span>
                        <h4 className="text-lg font-bold text-neutral-100 mt-1">{calculatedBridgeData.target.defaultSoloClone.name}</h4>
                        <span className="text-xs text-neutral-400">{calculatedBridgeData.target.defaultSoloClone.price}</span>
                      </div>
                      <span className="text-xs bg-neutral-800 text-neutral-300 px-3 py-1 rounded font-bold">~88% Match</span>
                    </div>

                    <p className="mt-3 text-xs text-neutral-300 leading-relaxed bg-neutral-900/50 p-4 rounded-xl">
                      {calculatedBridgeData.target.defaultSoloClone.desc}
                    </p>

                    <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-amber-400 block">Want to unlock 95%+ with what you own?</span>
                        <span className="text-[11px] text-neutral-400">Add fragrances to "My Wardrobe" tab to see if you own an anchor piece for {calculatedBridgeData.target.name}.</span>
                      </div>
                      <button 
                        onClick={() => setActiveTab('shelf')}
                        className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs px-3.5 py-2 rounded-xl whitespace-nowrap font-semibold"
                      >
                        Go to My Wardrobe
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Scanner Modal */}
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
