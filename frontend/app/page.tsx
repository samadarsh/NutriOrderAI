import React from "react";

/**
 * NutriOrder AI Next.js Layout Page Stub.
 * Visualizes the target production user flow from Swiggy login to tracking.
 */
export default function NutriOrderHome() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <header className="max-w-4xl w-full flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold text-emerald-400">🥗 NutriOrder AI</h1>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold px-4 py-2 rounded-md transition">
          Login with Swiggy
        </button>
      </header>

      <main className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Side: Goal Input & Preferences */}
        <section className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-slate-200">1. Order Assistant</h2>
          
          <div>
            <label className="block text-sm text-slate-400 mb-1">Select Delivery Address</label>
            <select className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-300">
              <option value="">-- Choose saved address --</option>
              <option value="addr_home">Home (Bengaluru)</option>
              <option value="addr_office">Office (Tech Park)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">What is your fitness/meal goal?</label>
            <input 
              type="text" 
              placeholder="e.g. High protein chicken dinner under Rs 300"
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-300 placeholder-slate-600"
            />
          </div>

          <button className="w-full bg-slate-800 hover:bg-slate-700 font-semibold py-2 rounded transition">
            Find Recommended Meal
          </button>
        </section>

        {/* Right Side: Recommendation Results & Checkout Review */}
        <section className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col gap-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-200 mb-2">2. Recommendations</h2>
            <div className="bg-slate-950 border border-slate-800 rounded p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-slate-300">Grilled Chicken Rice Bowl</p>
                <p className="text-xs text-slate-500">Protein Bowl Co • 42g Protein</p>
              </div>
              <p className="font-bold text-emerald-400">Rs 289</p>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-slate-200">3. Checkout Review</h2>
            <div className="text-sm text-slate-400 flex flex-col gap-1">
              <div className="flex justify-between"><span>Subtotal:</span><span>Rs 289</span></div>
              <div className="flex justify-between"><span>Payment Method:</span><span>Cash On Delivery (COD)</span></div>
              <div className="flex justify-between border-t border-slate-800 pt-1 font-semibold text-slate-300">
                <span>Total:</span><span>Rs 289</span>
              </div>
            </div>
            
            <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded transition uppercase tracking-wider text-sm">
              Place COD Order on Swiggy
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
