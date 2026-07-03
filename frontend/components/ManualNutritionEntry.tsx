import React, { useState } from "react";

interface ManualNutritionEntryProps {
  onAdd: (entry: { meal_name: string; calories: number; protein_g: number }) => Promise<void>;
  loading: boolean;
}

export default function ManualNutritionEntry({ onAdd, loading }: ManualNutritionEntryProps) {
  const [mealName, setMealName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim() || !calories || !protein) return;

    try {
      await onAdd({
        meal_name: mealName,
        calories: parseFloat(calories),
        protein_g: parseFloat(protein),
      });
      // Clear inputs
      setMealName("");
      setCalories("");
      setProtein("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
      <span className="text-xs text-slate-500 font-bold uppercase tracking-wider text-[10px]">📝 Add Manual Entry</span>
      
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Meal Name</label>
        <input
          type="text"
          value={mealName}
          onChange={(e) => setMealName(e.target.value)}
          placeholder="e.g. Boiled eggs or Fruit salad"
          required
          disabled={loading}
          className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Calories (kcal)</label>
          <input
            type="number"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="e.g. 240"
            required
            min="0"
            disabled={loading}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Protein (g)</label>
          <input
            type="number"
            value={protein}
            onChange={(e) => setProtein(e.target.value)}
            placeholder="e.g. 18"
            required
            min="0"
            disabled={loading}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || !mealName.trim() || !calories || !protein}
        className="mt-1 w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-600 text-slate-200 font-bold py-2 rounded-lg text-xs transition uppercase tracking-wider"
      >
        {loading ? "Adding Entry..." : "Save Entry"}
      </button>
    </form>
  );
}
