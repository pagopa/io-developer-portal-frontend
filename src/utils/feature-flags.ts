// union of literals
type AllowedFeatureFlag = never; // no flag is actually used;

export default (flag: AllowedFeatureFlag): boolean =>
  window.localStorage.getItem(`FF_${flag}`) === "true";
