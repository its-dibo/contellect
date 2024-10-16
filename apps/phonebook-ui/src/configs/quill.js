import { isDevMode } from "@angular/core";

/** @type {import('ngx-quill').QuillConfig} */
export const quillConfig = {
  modules: {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ header: [false, 2, 3, 4] }, { size: ["small", false, "large"] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ direction: "rtl" }, { direction: "ltr" }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["link", "image", "video"],
      ["clean"],
    ],
    syntax: true,
  },
  // in production log errors only
  debug: isDevMode() ? "log" : "error",
  // uses angular DomSanitizer to sanitize html values
  sanitize: true,
};
