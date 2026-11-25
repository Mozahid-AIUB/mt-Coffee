// Remember when an admin turns notifications off, so login does not turn them back on
export const PUSH_OPT_OUT = "mt_push_opt_out";

export const isPushOptedOut = () => localStorage.getItem(PUSH_OPT_OUT) === "1";
export const setPushOptOut = (value) =>
  value ? localStorage.setItem(PUSH_OPT_OUT, "1") : localStorage.removeItem(PUSH_OPT_OUT);
