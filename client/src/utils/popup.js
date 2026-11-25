import Swal from "sweetalert2";

const BRAND = "#b5651d";

// Match the popup to the active theme
const themed = () =>
  document.documentElement.dataset.theme === "dark"
    ? { background: "#1f1812", color: "#f4ebe1" }
    : {};

export const popupSuccess = (title, text) =>
  Swal.fire({ icon: "success", title, text, confirmButtonColor: BRAND, ...themed() });

// Small popup that closes itself
export const popupQuick = (title) =>
  Swal.fire({
    icon: "success",
    title,
    timer: 1200,
    showConfirmButton: false,
    ...themed(),
  });

export const popupError = (title, text) =>
  Swal.fire({ icon: "error", title, text, confirmButtonColor: BRAND, ...themed() });

export const popupConfirm = async (title, text, confirmText = "Yes") => {
  const result = await Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    confirmButtonColor: BRAND,
    cancelButtonColor: "#7a6756",
    ...themed(),
  });
  return result.isConfirmed;
};
