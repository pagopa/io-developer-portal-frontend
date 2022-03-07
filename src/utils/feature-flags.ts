type AllowedFeatureFlag = "SUBSCRIPTION_MIGRATIONS_ENABLED";

export default (flag: AllowedFeatureFlag): boolean =>
  window.localStorage.getItem(`FF_${flag}`) === "true";
