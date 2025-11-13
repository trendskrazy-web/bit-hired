"use server";

import {
  getProfitProjection,
  ProfitProjectionInput,
} from "@/ai/flows/profit-projection";
import { getMachines, getBitcoinData } from "./data";

type FormState = {
  projectedProfit: number | null;
  analysis: string | null;
  error: string | null;
};

export async function projectProfit(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const machineId = formData.get("machineId") as string;
    const durationLabel = formData.get("duration") as string;

    const machines = await getMachines();
    const machine = machines.find((m) => m.id === machineId);

    if (!machine) {
      return {
        ...initialState,
        error: "Selected machine not found.",
      };
    }

    const duration = machine.durations.find((d) => d.label === durationLabel);
    if (!duration) {
      return {
        ...initialState,
        error: "Selected duration not found.",
      };
    }

    const { pastBitcoinData, currentBitcoinPrice } = await getBitcoinData();

    const input: ProfitProjectionInput = {
      machineType: machine.name,
      duration: duration.label,
      miningRate: machine.miningRate,
      cost: duration.cost,
      pastBitcoinData: JSON.stringify(pastBitcoinData),
      currentBitcoinPrice: currentBitcoinPrice,
    };

    const result = await getProfitProjection(input);

    return {
      projectedProfit: result.projectedProfit,
      analysis: result.analysis,
      error: null,
    };
  } catch (e: any) {
    console.error(e);
    return {
      projectedProfit: null,
      analysis: null,
      error: e.message || "An unexpected error occurred.",
    };
  }
}

const initialState: FormState = {
  projectedProfit: null,
  analysis: null,
  error: null,
};
