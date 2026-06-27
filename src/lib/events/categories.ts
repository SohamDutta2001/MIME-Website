import type { TemplateType } from "../../types/event";

// Maps whatever the café owner writes in the sheet (e.g. "Drama", "Music",
// "Standup Comedy") to one of the three layout templates.
const TEMPLATE_MAP: Record<string, TemplateType> = {
  performance: "Performance",
  music: "Performance",
  drama: "Performance",
  "stand-up": "Performance",
  standup: "Performance",
  "standup comedy": "Performance",
  poetry: "Performance",
  storytelling: "Performance",
  theatre: "Performance",
  theater: "Performance",
  workshop: "Workshop",
  "acting workshop": "Workshop",
  "music workshop": "Workshop",
  "art workshop": "Workshop",
  "educational session": "Workshop",
  training: "Workshop",
  exhibition: "Exhibition",
  "art exhibition": "Exhibition",
  photography: "Exhibition",
  installation: "Exhibition",
  installations: "Exhibition",
  "book exhibition": "Exhibition",
};

export function getTemplateType(category: string): TemplateType {
  return TEMPLATE_MAP[category.toLowerCase().trim()] ?? "Performance";
}
