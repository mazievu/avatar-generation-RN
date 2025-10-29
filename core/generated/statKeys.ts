
export const StatKey = {
  iq: "iq",
  happiness: "happiness",
  eq: "eq",
  health: "health",
  skill: "skill",
} as const;

export type StatKey = typeof StatKey[keyof typeof StatKey];
