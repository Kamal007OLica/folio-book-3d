export interface SceneThemeColors {
  background: string;
  floor: string;
  fog: string;
  fogNear: number;
  fogFar: number;
  ambientColor: string;
  ambientIntensity: number;
}

export const SCENE_THEMES: Record<"dark" | "light", SceneThemeColors> = {
  dark: {
    background: "#0b0906",
    floor: "#141210",
    fog: "#0b0906",
    fogNear: 6,
    fogFar: 16,
    ambientColor: "#ffe9d6",
    ambientIntensity: 0.55,
  },
  light: {
    background: "#ded2bd",
    floor: "#c9baa0",
    fog: "#ded2bd",
    fogNear: 7,
    fogFar: 18,
    ambientColor: "#fff6ea",
    ambientIntensity: 0.85,
  },
};
