import React from "react";
import { CoachStatusResponse } from "../lib/api";

interface NutritionProgressProps {
  status: CoachStatusResponse;
}

export default function NutritionProgress({ status }: NutritionProgressProps) {
  const caloriePercent = Math.min(
    100,
    Math.round((status.consumed_calories / (status.target_calories || 1)) * 100)
  );
  const proteinPercent = Math.min(
    100,
    Math.round((status.consumed_protein / (status.target_protein || 1)) * 100)
  );

  return (
    <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
      {/* Calories Progress */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-end text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">🔥 Daily Calories</span>
          <span className="font-mono text-slate-200">
            {Math.round(status.consumed_calories)} / {Math.round(status.target_calories)} kcal
          </span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div
            style={{ width: `${caloriePercent}%` }}
            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>{caloriePercent}% Consumed</span>
          <span className="text-emerald-400 font-medium">
            {Math.round(status.remaining_calories)} kcal remaining
          </span>
        </div>
      </div>

      {/* Protein Progress */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-end text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">💪 Daily Protein</span>
          <span className="font-mono text-slate-200">
            {Math.round(status.consumed_protein)}g / {Math.round(status.target_protein)}g
          </span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div
            style={{ width: `${proteinPercent}%` }}
            className="bg-indigo-500 h-full rounded-full transition-all duration-500"
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>{proteinPercent}% Consumed</span>
          <span className="text-indigo-400 font-medium">
            {Math.round(status.remaining_protein)}g remaining
          </span>
        </div>
      </div>
    </div>
  );
}
