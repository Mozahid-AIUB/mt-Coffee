import Swal from "sweetalert2";

const BRAND = "#b5651d";

export const popupSuccess = (title, text) =>
  Swal.fire({ icon: "success", title, text, confirmButtonColor: BRAND });

export const popupError = (title, text) =>
  Swal.fire({ icon: "error", title, text, confirmButtonColor: BRAND });

export const popupConfirm = async (title, text, confirmText = "Yes") => {
  const result = await Swal.fire({
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    confirmButtonColor: BRAND,
    cancelButtonColor: "#7a6756",
  });
  return result.isConfirmed;
};
