'use client';

import React, { useState } from "react";

// Mock Data
const SAVED_ADDRESSES = [
  { id: "addr_home", label: "🏠 Home", text: "Flat 402, Green Glen Layout, Outer Ring Road, Bengaluru", tag: "Primary" },
  { id: "addr_office", label: "💼 Office", text: "Tower B, Prestige Tech Park, Marathahalli, Bengaluru", tag: "Work" },
  { id: "addr_gym", label: "💪 Gym", text: "Cult Fit HSR Layout, Sector 4, Bengaluru", tag: "Secondary" }
];

const MEAL_RECOMMENDATIONS = [
  {
    id: "meal_1",
    name: "High Protein Grilled Chicken & Quinoa Bowl",
    restaurant: "The Protein Station",
    price: 320,
    eta: "25 mins",
    protein: "42g",
    calories: "520 kcal",
    score: 98,
    reasons: [
      "Protein content (42g) exceeds your 35g minimum target.",
      "Calorie count (520) is within your 650 kcal target.",
      "Contains no active allergens (Gluten-Free, Dairy-Free)."
    ]
  },
  {
    id: "meal_2",
    name: "Soya Chaap Tikka Biryani (Brown Rice)",
    restaurant: "Healthy Kitchens",
    price: 245,
    eta: "30 mins",
    protein: "32g",
    calories: "580 kcal",
    score: 89,
    reasons: [
      "High protein vegetarian alternative.",
      "Prepared with brown rice to fit fiber targets.",
      "Fills 90% of your protein goal."
    ]
  },
  {
    id: "meal_3",
    name: "Paneer & Broccoli Salad with Flaxseeds",
    restaurant: "Salad Days",
    price: 289,
    eta: "20 mins",
    protein: "28g",
    calories: "450 kcal",
    score: 85,
    reasons: [
      "Low carb alternative fitting your fat loss goal.",
      "Excellent micronutrient balance with flaxseeds.",
      "Quickest delivery time (20 mins)."
    ]
  }
];

export default function NutriOrderDashboard() {
  // Navigation & Ordering Flow States
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [fitnessGoal, setFitnessGoal] = useState<string>("muscle_gain");
  const [proteinTarget, setProteinTarget] = useState<number>(35);
  const [calorieTarget, setCalorieTarget] = useState<number>(650);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<any>(null);
  const [checkoutConfirmed, setCheckoutConfirmed] = useState<boolean>(false);
  const [orderPlacing, setOrderPlacing] = useState<boolean>(false);
  const [placedOrderId, setPlacedOrderId] = useState<string>("");
  const [trackingStep, setTrackingStep] = useState<number>(0);

  // Auth Handler Simulation
  const handleSwiggyLogin = () => {
    setAuthLoading(true);
    setTimeout(() => {
      setIsAuthenticated(true);
      setAuthLoading(false);
    }, 1200);
  };

  // Search Recommendation Pipeline Simulation
  const handleQuerySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) {
      alert("Please select a delivery address first!");
      return;
    }
    setSearchLoading(true);
    setTimeout(() => {
      setRecommendations(MEAL_RECOMMENDATIONS);
      setSelectedMeal(null);
      setSearchLoading(false);
    }, 1500);
  };

  // Order Placement state simulation
  const handlePlaceOrder = () => {
    if (!checkoutConfirmed) return;
    setOrderPlacing(true);
    setTimeout(() => {
      const orderId = `swiggy_order_${Math.floor(100000 + Math.random() * 900000)}`;
      setPlacedOrderId(orderId);
      setOrderPlacing(false);
      
      // Start tracking progress bar
      let step = 0;
      const interval = setInterval(() => {
        step += 1;
        setTrackingStep(step);
        if (step >= 3) clearInterval(interval);
      }, 4000);
    }, 2000);
  };

  // Reset helper
  const handleReset = () => {
    setSelectedAddress("");
    setRecommendations([]);
    setSelectedMeal(null);
    setCheckoutConfirmed(false);
    setPlacedOrderId("");
    setTrackingStep(0);
  };

  // Allergy checkbox helper
  const toggleAllergy = (allergen: string) => {
    setAllergies(prev => 
      prev.includes(allergen) ? prev.filter(a => a !== allergen) : [...prev, allergen]
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Background Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <span className="text-2xl">🥗</span>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text text-transparent">
              NutriOrder AI
            </span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded border border-emerald-500/20">
              Staging Client
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-slate-400 font-mono">user_samadarsh</span>
                <button 
                  onClick={() => setIsAuthenticated(false)} 
                  className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded hover:bg-rose-500/10 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={handleSwiggyLogin}
                disabled={authLoading}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                {authLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Connecting PKCE...
                  </>
                ) : (
                  <>🔑 Continue with Swiggy</>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      {!isAuthenticated ? (
        // Login Welcome Hero Screen
        <main className="flex-1 max-w-4xl mx-auto px-4 flex flex-col items-center justify-center text-center py-20">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-10 rounded-2xl shadow-2xl max-w-xl w-full flex flex-col items-center gap-6">
            <div className="h-16 w-16 bg-gradient-to-tr from-emerald-400 to-lime-300 rounded-2xl flex items-center justify-center text-3xl shadow-xl shadow-emerald-500/15">
              🥗
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Welcome to <span className="bg-gradient-to-r from-emerald-400 to-lime-300 bg-clip-text text-transparent">NutriOrder AI</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We leverage Swiggy's MCP Staging Lab to scan menus, filter target macros (protein & calories), and place secure, compliant food orders aligned with your goals.
            </p>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 w-full text-left flex flex-col gap-2 text-xs text-slate-500">
              <p className="font-semibold text-slate-400 flex items-center gap-1.5">
                🛡️ Production Standards Active:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>PKCE secure token storage inside encrypted DB engine.</li>
                <li>Safe transition checkout state machine locks.</li>
                <li>Staging-only sandbox environments.</li>
              </ul>
            </div>
            <button 
              onClick={handleSwiggyLogin}
              disabled={authLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-800 text-slate-950 font-bold py-3.5 rounded-xl transition text-base shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              {authLoading ? "Initializing OAuth consent..." : "Continue with Swiggy"}
            </button>
          </div>
        </main>
      ) : placedOrderId ? (
        // Tracking View
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col gap-8">
            <div className="flex justify-between items-start border-b border-slate-800 pb-6">
              <div>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Order Dispatched
                </span>
                <h2 className="text-2xl font-bold mt-2">Tracking {placedOrderId}</h2>
                <p className="text-xs text-slate-500 mt-1 font-mono">Staging Transaction ID: {Math.random().toString(36).substr(2, 9)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Estimated Delivery Time</p>
                <p className="text-2xl font-bold text-emerald-400">{selectedMeal?.eta || "25 mins"}</p>
              </div>
            </div>

            {/* Stepper tracking progress bar */}
            <div className="relative flex justify-between items-center max-w-2xl mx-auto w-full my-4">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-800 -translate-y-1/2 -z-10" />
              <div 
                className="absolute left-0 top-1/2 h-1 bg-emerald-500 -translate-y-1/2 -z-10 transition-all duration-1000"
                style={{ width: `${(trackingStep / 3) * 100}%` }}
              />

              {[
                { label: "Placed", desc: "Sent to Staging MCP" },
                { label: "Accepted", desc: "Restaurant Confirmed" },
                { label: "Preparing", desc: "Culinary Macro Check" },
                { label: "Out for Delivery", desc: "Staging Arrival" }
              ].map((step, idx) => {
                const active = trackingStep >= idx;
                const current = trackingStep === idx;
                return (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border transition duration-500 ${
                      active 
                        ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20" 
                        : "bg-slate-950 border-slate-800 text-slate-600"
                    }`}>
                      {idx + 1}
                    </div>
                    <p className={`text-xs font-semibold mt-2 ${active ? "text-slate-200" : "text-slate-600"}`}>{step.label}</p>
                    <p className="text-[10px] text-slate-500 max-w-[100px] mt-0.5">{step.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Meal summary details */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-5 flex flex-col gap-4 mt-4">
              <h3 className="text-sm font-bold text-slate-300">Order Summary</h3>
              <div className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-3">
                <div>
                  <p className="font-semibold text-slate-200">{selectedMeal?.name}</p>
                  <p className="text-xs text-slate-500">{selectedMeal?.restaurant}</p>
                </div>
                <p className="font-bold text-emerald-400">Rs {selectedMeal?.price}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-900 border border-slate-800/50 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Macros Met</p>
                  <p className="text-sm font-bold text-slate-300 mt-1">100% Correct</p>
                </div>
                <div className="bg-slate-900 border border-slate-800/50 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Protein Total</p>
                  <p className="text-sm font-bold text-emerald-400 mt-1">{selectedMeal?.protein}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800/50 rounded-lg p-2.5">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Calories</p>
                  <p className="text-sm font-bold text-blue-400 mt-1">{selectedMeal?.calories}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleReset} 
              className="mt-6 self-center bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-2.5 rounded-lg text-sm transition"
            >
              Order Something Else
            </button>
          </div>
        </main>
      ) : (
        // Dashboard Workflow Panel
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Columns: Address, Profile & Query */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Step 1: Address Selection */}
            <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">1. Address Selection</h3>
                {selectedAddress && <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded border border-emerald-500/20">Selected</span>}
              </div>
              <div className="flex flex-col gap-3">
                {SAVED_ADDRESSES.map((addr) => {
                  const isChosen = selectedAddress === addr.id;
                  return (
                    <div 
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr.id)}
                      className={`cursor-pointer border rounded-lg p-3 flex flex-col gap-1 transition ${
                        isChosen 
                          ? "bg-slate-950/80 border-emerald-500 shadow-md shadow-emerald-500/5" 
                          : "bg-slate-950/20 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-300">{addr.label}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          addr.tag === "Primary" 
                            ? "bg-emerald-500/10 text-emerald-400" 
                            : addr.tag === "Work" 
                              ? "bg-blue-500/10 text-blue-400" 
                              : "bg-slate-800 text-slate-400"
                        }`}>{addr.tag}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mt-1">{addr.text}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Step 2: Goal & Preferences Setup */}
            <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">2. Nutritional Profile</h3>
              
              {/* Fitness Goal Buttons */}
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-2">Fitness Goal</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "muscle_gain", label: "💪 Bulking" },
                    { id: "fat_loss", label: "🔥 Cutting" },
                    { id: "maintenance", label: "⚖️ Maintenance" }
                  ].map((goal) => {
                    const active = fitnessGoal === goal.id;
                    return (
                      <button
                        key={goal.id}
                        onClick={() => {
                          setFitnessGoal(goal.id);
                          if (goal.id === "muscle_gain") {
                            setProteinTarget(40);
                            setCalorieTarget(750);
                          } else if (goal.id === "fat_loss") {
                            setProteinTarget(30);
                            setCalorieTarget(500);
                          } else {
                            setProteinTarget(35);
                            setCalorieTarget(650);
                          }
                        }}
                        className={`text-xs font-semibold py-2 px-1 rounded-lg border transition ${
                          active 
                            ? "bg-emerald-500 border-emerald-400 text-slate-950 font-bold" 
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800"
                        }`}
                      >
                        {goal.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sliders */}
              <div className="flex flex-col gap-4">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs text-slate-400">Min Protein Target</label>
                    <span className="text-xs font-bold text-emerald-400">{proteinTarget}g</span>
                  </div>
                  <input 
                    type="range" 
                    min="15" 
                    max="60" 
                    value={proteinTarget} 
                    onChange={(e) => setProteinTarget(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs text-slate-400">Max Calorie Ceiling</label>
                    <span className="text-xs font-bold text-blue-400">{calorieTarget} kcal</span>
                  </div>
                  <input 
                    type="range" 
                    min="350" 
                    max="1000" 
                    value={calorieTarget} 
                    onChange={(e) => setCalorieTarget(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Allergies Pill Selectors */}
              <div>
                <label className="block text-xs text-slate-400 font-semibold mb-2">Exclusion / Allergies Filters</label>
                <div className="flex flex-wrap gap-2">
                  {["Gluten", "Dairy", "Nuts", "Soy", "Shellfish"].map((allergen) => {
                    const selected = allergies.includes(allergen);
                    return (
                      <button
                        key={allergen}
                        onClick={() => toggleAllergy(allergen)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition ${
                          selected 
                            ? "bg-rose-500/10 border-rose-500 text-rose-300" 
                            : "bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-850"
                        }`}
                      >
                        {selected ? `❌ ${allergen}` : allergen}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* Step 3: Order Assistant Chat Query */}
            <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">3. Order Assistant</h3>
              
              <form onSubmit={handleQuerySearch} className="flex flex-col gap-3">
                <textarea 
                  rows={2}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. High protein Paneer lunch with broccoli under Rs 300"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition resize-none font-sans"
                />

                {/* Query templates */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "high protein grilled chicken",
                    "veg lunch under 600 kcal",
                    "keto friendly dinner"
                  ].map((temp) => (
                    <button
                      key={temp}
                      type="button"
                      onClick={() => setSearchQuery(temp)}
                      className="text-[10px] bg-slate-950 border border-slate-800 text-slate-500 hover:text-slate-400 hover:border-slate-700 px-2 py-1 rounded transition"
                    >
                      💡 {temp}
                    </button>
                  ))}
                </div>

                <button 
                  type="submit"
                  disabled={searchLoading || !selectedAddress}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                >
                  {searchLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Searching Staging Menus...
                    </>
                  ) : (
                    "Find Recommended Meal"
                  )}
                </button>
              </form>
            </section>
          </div>

          {/* Right Columns: Recommendations & Checkout Cart */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            {/* Step 4: Recommendations results list */}
            <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex-1 flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">4. AI Meal Recommendations</h3>
              
              {recommendations.length === 0 ? (
                <div className="flex-1 border border-dashed border-slate-800/80 rounded-xl flex flex-col items-center justify-center p-8 text-center text-slate-500 gap-2">
                  <span className="text-3xl">🍲</span>
                  <p className="text-sm">Select address and submit query to run recommendation pipeline.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {recommendations.map((meal) => {
                    const isSelected = selectedMeal?.id === meal.id;
                    return (
                      <div 
                        key={meal.id}
                        onClick={() => setSelectedMeal(meal)}
                        className={`cursor-pointer border rounded-xl p-4 flex flex-col gap-3 transition ${
                          isSelected 
                            ? "bg-slate-950/80 border-emerald-500 shadow-md shadow-emerald-500/5" 
                            : "bg-slate-950/20 border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-bold text-slate-200 text-sm">{meal.name}</h4>
                            <p className="text-xs text-slate-500 mt-0.5">{meal.restaurant} • 🛵 {meal.eta}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-400">Rs {meal.price}</p>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-semibold px-2 py-0.5 rounded border border-emerald-500/20 mt-1 inline-block">
                              {meal.score}% match
                            </span>
                          </div>
                        </div>

                        {/* Macro details badges */}
                        <div className="flex gap-4 border-t border-b border-slate-900/60 py-2 text-xs">
                          <div className="flex gap-1">
                            <span className="text-slate-500">Protein:</span>
                            <span className="font-bold text-emerald-400">{meal.protein}</span>
                          </div>
                          <div className="flex gap-1">
                            <span className="text-slate-500">Calories:</span>
                            <span className="font-bold text-blue-400">{meal.calories}</span>
                          </div>
                        </div>

                        {/* Reasoning list */}
                        <div className="text-xs text-slate-400 flex flex-col gap-1 list-none">
                          {meal.reasons.map((reason: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <span className="text-emerald-500 mt-0.5">✓</span>
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Step 5: Checkout Cart Review */}
            <section className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">5. Staging Cart Review</h3>
              
              {!selectedMeal ? (
                <p className="text-xs text-slate-500 text-center py-4">Select a meal recommendation card above to review checkout parameters.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Cart metrics */}
                  <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 text-sm flex flex-col gap-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Item Selected:</span>
                      <span className="font-semibold text-slate-200">{selectedMeal.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Address:</span>
                      <span className="font-semibold text-slate-200">
                        {SAVED_ADDRESSES.find(a => a.id === selectedAddress)?.label || selectedAddress}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment:</span>
                      <span className="font-semibold text-slate-200">Cash On Delivery (COD)</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-800 pt-2 font-bold text-slate-200">
                      <span>Total Amount:</span>
                      <span className="text-emerald-400">Rs {selectedMeal.price}</span>
                    </div>
                  </div>

                  {/* Limits and Cap warnings */}
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 flex items-start gap-2.5 text-xs text-slate-400">
                    <span className="text-emerald-400 text-sm">🛡️</span>
                    <div>
                      <p className="font-bold text-slate-300">Safety Cap Check Passed</p>
                      <p className="text-slate-500 mt-0.5">Total is below the Rs 1000 limit. Double order prevention lock checks are clear.</p>
                    </div>
                  </div>

                  {/* Confirmation Checkbox */}
                  <label className="flex items-center gap-3 cursor-pointer select-none border border-slate-800 rounded-xl p-3 bg-slate-950/20 hover:bg-slate-950/50 transition">
                    <input 
                      type="checkbox"
                      checked={checkoutConfirmed}
                      onChange={(e) => setCheckoutConfirmed(e.target.checked)}
                      className="accent-emerald-500 h-4 w-4 rounded cursor-pointer"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-300">I confirm these details are correct</p>
                      <p className="text-slate-500 text-[10px] mt-0.5">Explicit authorization triggers the non-idempotent Swiggy place route.</p>
                    </div>
                  </label>

                  <button 
                    onClick={handlePlaceOrder}
                    disabled={orderPlacing || !checkoutConfirmed}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 text-slate-950 font-bold py-3.5 rounded-xl transition text-base flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 uppercase tracking-wider text-xs"
                  >
                    {orderPlacing ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Placing Order...
                      </>
                    ) : (
                      "Place COD Order on Swiggy"
                    )}
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      )}
    </div>
  );
}
