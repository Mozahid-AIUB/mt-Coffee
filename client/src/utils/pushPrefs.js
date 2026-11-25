// admin নিজে notification বন্ধ করলে সেটা মনে রাখি, নাহলে প্রতিবার আবার চালু হবে
export const PUSH_OPT_OUT = "mt_push_opt_out";

export const isPushOptedOut = () => localStorage.getItem(PUSH_OPT_OUT) === "1";
export const setPushOptOut = (value) =>
  value ? localStorage.setItem(PUSH_OPT_OUT, "1") : localStorage.removeItem(PUSH_OPT_OUT);
