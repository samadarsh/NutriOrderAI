import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { api, CoachStatusResponse, NutritionEntry, RecommendationMeal } from "../lib/api";
import NutritionProgress from "./NutritionProgress";
import DailyMealLog from "./DailyMealLog";
import ManualNutritionEntry from "./ManualNutritionEntry";
import NextMealSuggestion from "./NextMealSuggestion";

interface CoachDashboardProps {
  activeSessionId: string;
  onSelectMeal: (meal: RecommendationMeal) => void;
}

export interface CoachDashboardRef {
  refreshCoachData: () => Promise<void>;
}

const CoachDashboard = forwardRef<CoachDashboardRef, CoachDashboardProps>(
  ({ activeSessionId, onSelectMeal }, ref) => {
    const [status, setStatus] = useState<CoachStatusResponse | null>(null);
    const [history, setHistory] = useState<NutritionEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [manualLoading, setManualLoading] = useState(false);

    const refreshCoachData = async () => {
      setLoading(true);
      try {
        const [statusData, historyData] = await Promise.all([
          api.getCoachStatus(),
          api.getCoachHistory(),
        ]);
        setStatus(statusData);
        setHistory(historyData);
      } catch (err) {
        console.error("Failed to refresh coach dashboard status", err);
      } finally {
        setLoading(false);
      }
    };

    useImperativeHandle(ref, () => ({
      refreshCoachData,
    }));

    useEffect(() => {
      refreshCoachData();
    }, []);

    const handleAddManualEntry = async (entry: { meal_name: string; calories: number; protein_g: number }) => {
      setManualLoading(true);
      try {
        await api.addManualEntry(entry);
        await refreshCoachData();
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        alert(`Failed to save manual food entry: ${msg}`);
      } finally {
        setManualLoading(false);
      }
    };

    return (
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col gap-5 text-left h-full">
        <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400">🤖 AI Nutrition Coach</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Estimated macros & general wellness companion</p>
          </div>
          {loading && (
            <svg className="animate-spin h-4 w-4 text-indigo-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
        </div>

        {status && <NutritionProgress status={status} />}

        <DailyMealLog entries={history} />

        <NextMealSuggestion
          activeSessionId={activeSessionId}
          onSelectMeal={onSelectMeal}
        />

        <ManualNutritionEntry
          onAdd={handleAddManualEntry}
          loading={manualLoading}
        />
      </div>
    );
  }
);

CoachDashboard.displayName = "CoachDashboard";
export default CoachDashboard;
