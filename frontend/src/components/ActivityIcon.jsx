import { Footprints, PersonStanding, Bike, Waves, Dumbbell, Activity } from "lucide-react";

const ICON_MAP = {
  running: Footprints,
  walking: PersonStanding,
  cycling: Bike,
  swimming: Waves,
  gym: Dumbbell,
  steps: Footprints,
};

export default function ActivityIcon({ type, className = "h-5 w-5" }) {
  const Icon = ICON_MAP[type] || Activity;
  return <Icon className={className} />;
}
