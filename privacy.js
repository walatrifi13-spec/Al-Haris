"use strict";
// Strip personal identifiers BEFORE any text leaves the server for the LLM.
function redact(text) {
  return text
    .replace(/\b784-?\d{4}-?\d{7}-?\d\b/g, "[EMIRATES_ID]")
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[EMAIL]")
    .replace(/\+?\d[\d\s-]{7,}\d/g, "[NUMBER]");
}
module.exports = { redact };
