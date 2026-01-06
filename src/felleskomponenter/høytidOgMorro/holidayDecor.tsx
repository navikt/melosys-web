import { JSX } from "react";

import * as Utils from "../../utils";
import { ChristmasDeer } from "./jul/ChristmasReindeer";
import { ChristmasSantaAndDeer } from "./jul/ChristmasSantaAndDeer";
import { MistelteinSvg } from "./jul/MistelteinSvg";

type HolidayDecorSlot = "brand" | "center" | "user";

type HolidayDefinition = {
  id: string;
  isActive: () => boolean;
  decorBySlot: Record<HolidayDecorSlot, JSX.Element>;
};

const getMondayOfWeek = (date: Date) => {
  const mondayOffset = (date.getDay() + 6) % 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - mondayOffset);
};

const isChristmasSeason = () => {
  const today = new Date();
  const year = today.getFullYear();
  const start = getMondayOfWeek(new Date(year, 11, 1));
  const end = new Date(year, 11, 31);

  const todayKey = Utils.dato.dateTilIsoString(today);
  const startKey = Utils.dato.dateTilIsoString(start);
  const endKey = Utils.dato.dateTilIsoString(end);

  if (!todayKey || !startKey || !endKey) return false;

  return todayKey >= startKey && todayKey <= endKey;
};

const holidayRegistry: HolidayDefinition[] = [
  {
    id: "christmas",
    isActive: isChristmasSeason,
    decorBySlot: {
      brand: <ChristmasDeer />,
      center: <ChristmasSantaAndDeer />,
      user: <MistelteinSvg />,
    },
  },
];

export function HolidayDecor({ slot }: { slot: HolidayDecorSlot }) {
  const activeHoliday = holidayRegistry.find((holiday) => holiday.isActive());
  return activeHoliday?.decorBySlot[slot] ?? null;
}
