import React, { useState } from "react";
import { api, RecommendationMeal } from "../lib/api";

interface NextMealSuggestionProps {
  onSelectMeal: (meal: RecommendationMeal) => void;
  activeSessionId: string;
}

export default function NextMealSuggestion({ onSelectMeal }: NextMealSuggestionProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [targetMet, setTargetMet] = useState(false);
  const [suggestions, setSuggestions] = useState<RecommendationMeal[]>([]);

  const handleFetchNextMeal = async () => {
    setLoading(true);
    setMessage("");
    setSuggestions([]);
    try {
      const res = await api.getCoachNextMeal();
      if (!res.success) {
        if (res.status === "action_required") {
          setMessage(res.message);
        } else {
          setMessage("Failed to load suggestions.");
        }
        return;
      }

      setMessage(res.message);
      setTargetMet(res.target_met || false);

      const rawCandidates = res.results?.results?.recommendations || [];
      const mapped = rawCandidates.map((c) => ({
        id: c.item_id,
        name: c.name || c.item_name || "Recommended meal",
        restaurant: c.restaurant_name || "Unknown Restaurant",
        price: c.price,
        eta: `${c.delivery_time_min || 30} mins`,
        protein: `${c.protein_g || 0}g`,
        calories: c.calories ? `${c.calories} kcal` : "N/A",
        score: c.match_score || 80,
        reasons: c.explanations || ["Fits nutritional criteria."],
        why_this_meal: c.why_this_meal || [],
        tradeoffs: c.tradeoffs || [],
        confidence: c.confidence || 1.0,
        is_estimated: c.is_estimated !== false,
        restaurant_id: c.restaurant_id,
        item_id: c.item_id,
        distance_km: c.distance_km as number | undefined
      }));
      setSuggestions(mapped);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage(`Coach inquiry failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider text-[10px]">💡 Next Meal Adviser</span>
        {loading && (
          <span className="text-[10px] text-indigo-400 font-mono animate-pulse">Analyzing...</span>
        )}
      </div>

      <button
        onClick={handleFetchNextMeal}
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-900 disabled:text-slate-600 text-slate-100 font-bold py-2.5 rounded-lg text-xs transition uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
      >
        {loading ? "Generating suggestions..." : "Suggest My Next Meal"}
      </button>

      {message && (
        <div className={`p-2.5 rounded-lg text-[11px] leading-relaxed border ${
          targetMet 
            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
            : message.includes("required") || message.includes("failed")
            ? "bg-rose-500/5 border-rose-500/20 text-rose-400"
            : "bg-slate-900 border-slate-800 text-slate-300"
        }`}>
          {message}
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1 mt-1">
          {suggestions.map((meal) => (
            <div
              key={meal.id}
              onClick={() => onSelectMeal(meal)}
              className="group flex flex-col gap-2 p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 cursor-pointer transition text-left"
            >
              <div className="flex justify-between items-start gap-1">
                <div>
                  <h5 className="font-semibold text-slate-200 text-xs leading-snug group-hover:text-indigo-400 transition">
                    {meal.name}
                  </h5>
                  <p className="text-[10px] text-slate-500 mt-0.5">🏪 {meal.restaurant}</p>
                </div>
                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono">
                  {Math.round(meal.score)}% fit
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-900 pt-1.5">
                <span className="font-mono text-[9px] text-slate-500">
                  {meal.calories} | {meal.protein}
                </span>
                <span className="font-bold text-slate-300">Rs {meal.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
