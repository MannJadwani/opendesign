// Script string injected into artifact HTML so the iframe can expose
// inline-edit hooks. Runs in the iframe's context, talks to the parent
// workspace via postMessage. Keep deps to zero — this is stringified
// verbatim and <script>-appended right before </body>.

export const EDITOR_INJECT_SCRIPT = /* js */ `
<script id="__cd_editor_script">
(() => {
  if (window.__cdEditorInstalled) return;
  window.__cdEditorInstalled = true;

  // Navigation guard: clicks inside the preview must never replace the host
  // app. Same-origin / relative anchors are blocked outright; external links
  // are forced to open in a new tab.
  document.addEventListener(
    "click",
    (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      const a = t.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("javascript:")) {
        e.preventDefault();
        return;
      }
      let url;
      try {
        url = new URL(href, document.baseURI);
      } catch {
        e.preventDefault();
        return;
      }
      const isExternal =
        url.protocol === "http:" || url.protocol === "https:";
      if (!isExternal) {
        e.preventDefault();
        return;
      }
      try {
        if (url.origin === window.location.origin) {
          e.preventDefault();
          return;
        }
      } catch {}
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    },
    true,
  );

  // Also catch form submits so inline forms don't navigate the iframe away.
  document.addEventListener(
    "submit",
    (e) => {
      e.preventDefault();
    },
    true,
  );

  const state = {
    mode: false,
    commentMode: false,
    dirty: new Map(),
    hoverEl: null,
    selectedEl: null,
    leafIdSeq: 0,
  };
  const HOVER_CLASS = "__cd_hover";
  const EDIT_CLASS = "__cd_edit";
  const LEAF_HOVER_CLASS = "__cd_leaf_hover";
  const LEAF_SELECTED_CLASS = "__cd_leaf_selected";
  const LEAF_ATTR = "data-cd-leaf";
  const STYLE_PROPS = ["width", "height", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "marginTop", "marginRight", "marginBottom", "marginLeft"];
  const LEAF_SELECTORS =
    "h1, h2, h3, h4, h5, h6, p, a, button, li, blockquote, figcaption, label, img, svg, span, strong, em, div[class]";

  const style = document.createElement("style");
  style.id = "__cd_editor_style";
  style.textContent = \`
    [data-cd-id].\${HOVER_CLASS} {
      box-shadow: inset 0 0 0 2px rgba(217,98,58,0.55) !important;
      cursor: text !important;
      transition: box-shadow 120ms ease;
    }
    [data-cd-id].\${EDIT_CLASS} {
      box-shadow: inset 0 0 0 2px #D9623A, 0 0 0 6px rgba(217,98,58,0.12) !important;
      outline: none !important;
    }
    .\${LEAF_HOVER_CLASS} {
      box-shadow: 0 0 0 2px #D9623A, 0 0 0 6px rgba(217,98,58,0.18) !important;
      cursor: text !important;
      border-radius: 4px !important;
      transition: box-shadow 100ms ease;
    }
    .\${LEAF_SELECTED_CLASS} {
      box-shadow: 0 0 0 2px #1F1B16, 0 0 0 6px rgba(217,98,58,0.28) !important;
      border-radius: 4px !important;
    }
    [data-cd-id][contenteditable="true"] {
      caret-color: #D9623A !important;
    }
    [data-cd-id][contenteditable="true"]:focus,
    [data-cd-id][contenteditable="true"] *:focus {
      outline: none !important;
    }
    html.__cd_comment_mode, html.__cd_comment_mode * {
      cursor: crosshair !important;
      user-select: none !important;
    }
  \`;
  document.head.appendChild(style);

  function onCommentClick(e) {
    if (!state.commentMode) return;
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();
    const t = e.target instanceof Element ? e.target : null;
    // Coords relative to the iframe viewport. Pins anchor to viewport position,
    // so they stay put as the iframe scrolls (MVP tradeoff — simpler than
    // tracking document-scroll offsets in the parent overlay).
    const w = Math.max(window.innerWidth, 1);
    const h = Math.max(window.innerHeight, 1);
    const xPct = Math.max(0, Math.min(1, e.clientX / w));
    const yPct = Math.max(0, Math.min(1, e.clientY / h));
    let leafId = null;
    let anchor = null;
    if (t) {
      const leafEl = t.closest(LEAF_SELECTORS);
      if (leafEl) leafId = assignLeafId(leafEl);
      const blockEl = t.closest("[data-cd-id]");
      if (blockEl) anchor = blockEl.getAttribute("data-cd-id");
    }
    try {
      parent.postMessage(
        {
          source: "cd-editor",
          type: "comment-place",
          xPct, yPct,
          leafId, anchor,
          clientX: e.clientX, clientY: e.clientY,
        },
        "*",
      );
    } catch {}
  }
  window.addEventListener("click", onCommentClick, true);
  window.addEventListener("mousedown", (e) => {
    if (state.commentMode) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  function clearLeafHover() {
    if (state.hoverEl) {
      state.hoverEl.classList.remove(LEAF_HOVER_CLASS);
      state.hoverEl = null;
    }
  }

  function pickTarget(t, opts) {
    // Prefer the outermost data-cd-id block so containers (cards, sections,
    // hero regions) win over their innermost text descendants. If the user
    // repeat-clicks inside the same block, drill down to the leaf so fine-
    // grained padding/margin tweaks are still reachable.
    const block = t.closest("[data-cd-id]");
    const leaf = t.closest(LEAF_SELECTORS);
    const drill =
      opts && opts.drill && block && state.selectedEl === block && leaf && leaf !== block;
    if (drill && document.body.contains(leaf)) return leaf;
    if (block && document.body.contains(block)) return block;
    if (leaf && document.body.contains(leaf)) return leaf;
    return null;
  }

  function onMouseMove(e) {
    if (state.commentMode) { clearLeafHover(); return; }
    if (!state.mode) return;
    const t = e.target;
    if (!(t instanceof Element)) return;
    const leaf = pickTarget(t);
    if (!leaf) {
      clearLeafHover();
      return;
    }
    if (leaf === state.hoverEl) return;
    clearLeafHover();
    leaf.classList.add(LEAF_HOVER_CLASS);
    state.hoverEl = leaf;
    // A leaf ring is active — strip any container hover rings so rings don't stack.
    document
      .querySelectorAll("[data-cd-id]." + HOVER_CLASS)
      .forEach((el) => el.classList.remove(HOVER_CLASS));
  }
  function onMouseLeaveDoc() {
    clearLeafHover();
  }

  function assignLeafId(el) {
    let id = el.getAttribute(LEAF_ATTR);
    if (!id) {
      state.leafIdSeq += 1;
      id = "l" + state.leafIdSeq;
      el.setAttribute(LEAF_ATTR, id);
    }
    return id;
  }

  function readComputed(el) {
    const cs = getComputedStyle(el);
    const out = {};
    STYLE_PROPS.forEach((p) => {
      out[p] = cs[p];
    });
    out.tag = el.tagName.toLowerCase();
    return out;
  }

  function clearSelection() {
    if (state.selectedEl) {
      state.selectedEl.classList.remove(LEAF_SELECTED_CLASS);
      state.selectedEl = null;
    }
  }

  function selectLeaf(el) {
    if (!el) return;
    clearSelection();
    const id = assignLeafId(el);
    el.classList.add(LEAF_SELECTED_CLASS);
    state.selectedEl = el;
    const rect = el.getBoundingClientRect();
    try {
      parent.postMessage(
        {
          source: "cd-editor",
          type: "select",
          leafId: id,
          tag: el.tagName.toLowerCase(),
          computed: readComputed(el),
          rect: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
        },
        "*",
      );
    } catch {}
  }

  function onDocClick(e) {
    if (state.commentMode) return;
    if (!state.mode) return;
    const t = e.target;
    if (!(t instanceof Element)) return;
    const leaf = pickTarget(t, { drill: true });
    if (!leaf) {
      clearSelection();
      try {
        parent.postMessage({ source: "cd-editor", type: "deselect" }, "*");
      } catch {}
      return;
    }
    selectLeaf(leaf);
  }

  function applyStyle(leafId, prop, value) {
    const el = document.querySelector("[" + LEAF_ATTR + '="' + leafId + '"]');
    if (!el) return;
    if (value === "" || value == null) {
      el.style.removeProperty(camelToKebab(prop));
    } else {
      el.style[prop] = value;
    }
    const block = el.closest("[data-cd-id]");
    if (block) {
      const id = block.getAttribute("data-cd-id");
      if (id) postEdit(id, block.innerHTML, true);
    } else {
      postDirty();
    }
    if (el === state.selectedEl) {
      try {
        parent.postMessage(
          {
            source: "cd-editor",
            type: "select-update",
            leafId,
            computed: readComputed(el),
          },
          "*",
        );
      } catch {}
    }
  }

  function camelToKebab(p) {
    return p.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
  }

  function findAnchor(anchor) {
    if (!anchor) return null;
    // CSS.escape keeps the selector safe against dashes/colons in slugs.
    const sel = "[data-cd-id=\\"" + (window.CSS && CSS.escape ? CSS.escape(anchor) : anchor) + "\\"]";
    try {
      return document.querySelector(sel);
    } catch (_) { return null; }
  }

  function applyStyleAnchor(anchor, prop, value) {
    const el = findAnchor(anchor);
    if (!el) return;
    if (value === "" || value == null) {
      el.style.removeProperty(camelToKebab(prop));
    } else {
      el.style[prop] = value;
    }
    postDirty();
  }

  function applyVar(anchor, varName, value) {
    const el = findAnchor(anchor) || document.documentElement;
    if (!varName) return;
    const name = varName.startsWith("--") ? varName : "--" + varName;
    if (value === "" || value == null) {
      el.style.removeProperty(name);
    } else {
      el.style.setProperty(name, String(value));
    }
    postDirty();
  }

  function blocks() {
    const all = Array.from(document.querySelectorAll("[data-cd-id]"));
    // Only the outermost data-cd-id nodes become editable targets. Nested ones
    // are still reachable via closestBlock() when the user clicks inside them.
    return all.filter((el) => {
      const parent = el.parentElement;
      return !parent || !parent.closest("[data-cd-id]");
    });
  }

  function enable() {
    state.mode = true;
    blocks().forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      el.addEventListener("focus", onFocus, true);
      el.addEventListener("blur", onBlur, true);
      el.addEventListener("input", onInput, true);
      el.setAttribute("contenteditable", "true");
      el.setAttribute("spellcheck", "false");
    });
    document.addEventListener("mousemove", onMouseMove, true);
    document.addEventListener("mouseleave", onMouseLeaveDoc, true);
    document.addEventListener("click", onDocClick, true);
  }

  function disable() {
    state.mode = false;
    blocks().forEach((el) => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("focus", onFocus, true);
      el.removeEventListener("blur", onBlur, true);
      el.removeEventListener("input", onInput, true);
      el.classList.remove(HOVER_CLASS, EDIT_CLASS);
      el.removeAttribute("contenteditable");
      el.removeAttribute("spellcheck");
    });
    document.removeEventListener("mousemove", onMouseMove, true);
    document.removeEventListener("mouseleave", onMouseLeaveDoc, true);
    document.removeEventListener("click", onDocClick, true);
    clearLeafHover();
    clearSelection();
  }

  function onEnter(e) {
    const el = e.currentTarget;
    // Only show container hover when the pointer isn't already over a leaf.
    if (!state.hoverEl) el.classList.add(HOVER_CLASS);
  }
  function onLeave(e) {
    e.currentTarget.classList.remove(HOVER_CLASS);
  }
  function onFocus(e) {
    const el = closestBlock(e.target);
    if (!el) return;
    // Drop container rings entirely once something inside gets focus — the
    // leaf-level highlight + native caret are the only cues we want.
    el.classList.remove(HOVER_CLASS);
  }
  function onBlur(e) {
    const el = closestBlock(e.target);
    if (!el) return;
    flushBlock(el);
  }
  function onInput(e) {
    const el = closestBlock(e.target);
    if (!el) return;
    const id = el.getAttribute("data-cd-id");
    if (!id) return;
    state.dirty.set(id, el.innerHTML);
    postEdit(id, el.innerHTML, false);
  }
  function flushBlock(el) {
    const id = el.getAttribute("data-cd-id");
    if (!id) return;
    postEdit(id, el.innerHTML, true);
  }

  function closestBlock(node) {
    let cur = node;
    let found = null;
    while (cur && cur !== document.body) {
      if (
        cur.nodeType === 1 &&
        cur.hasAttribute &&
        cur.hasAttribute("data-cd-id") &&
        cur.getAttribute("contenteditable") === "true"
      ) {
        found = cur;
      }
      cur = cur.parentNode;
    }
    return found;
  }

  function postEdit(id, innerHTML, committed) {
    try {
      parent.postMessage(
        { source: "cd-editor", type: "edit", id, innerHTML, committed },
        "*",
      );
    } catch {}
  }

  function postDirty() {
    try {
      parent.postMessage({ source: "cd-editor", type: "dirty" }, "*");
    } catch {}
  }

  function serialize() {
    // Clone, strip editor artifacts, return full outerHTML.
    const clone = document.documentElement.cloneNode(true);
    const rm = (sel) => clone.querySelectorAll(sel).forEach((n) => n.remove());
    rm("#__cd_editor_style");
    rm("#__cd_editor_script");
    // Best-effort strip of moveable overlay nodes / injected styles.
    rm('[class*="moveable-"]');
    clone.querySelectorAll("style").forEach((n) => {
      if ((n.textContent || "").includes(".moveable-")) n.remove();
    });
    clone.querySelectorAll("[contenteditable]").forEach((n) => {
      n.removeAttribute("contenteditable");
      n.removeAttribute("spellcheck");
    });
    clone.querySelectorAll("[" + LEAF_ATTR + "]").forEach((n) => {
      n.removeAttribute(LEAF_ATTR);
    });
    clone.querySelectorAll("." + HOVER_CLASS + ", ." + EDIT_CLASS + ", ." + LEAF_HOVER_CLASS + ", ." + LEAF_SELECTED_CLASS).forEach((n) => {
      n.classList.remove(HOVER_CLASS, EDIT_CLASS, LEAF_HOVER_CLASS, LEAF_SELECTED_CLASS);
      if (n.getAttribute("class") === "") n.removeAttribute("class");
    });
    const doctype = "<!DOCTYPE html>";
    return doctype + "\\n" + clone.outerHTML;
  }

  window.addEventListener("message", (e) => {
    const data = e.data;
    if (!data || data.source !== "cd-editor-host") return;
    if (data.type === "set-mode") {
      if (data.on && !state.mode) enable();
      else if (!data.on && state.mode) disable();
    } else if (data.type === "set-style") {
      applyStyle(data.leafId, data.prop, data.value);
    } else if (data.type === "set-style-anchor") {
      applyStyleAnchor(data.anchor, data.prop, data.value);
    } else if (data.type === "set-var") {
      applyVar(data.anchor, data.varName, data.value);
    } else if (data.type === "deselect") {
      clearSelection();
    } else if (data.type === "set-comment-mode") {
      state.commentMode = !!data.on;
      document.documentElement.classList.toggle("__cd_comment_mode", state.commentMode);
    } else if (data.type === "serialize") {
      try {
        parent.postMessage(
          { source: "cd-editor", type: "serialized", requestId: data.requestId, html: serialize() },
          "*",
        );
      } catch {}
    }
  });

  // Signal readiness so the host can push initial mode.
  try {
    parent.postMessage({ source: "cd-editor", type: "ready" }, "*");
  } catch {}
})();
</script>
`;

export function injectEditorScript(html: string): string {
  if (html.includes("__cdEditorInstalled")) return html;
  const idx = html.lastIndexOf("</body>");
  if (idx === -1) return html + EDITOR_INJECT_SCRIPT;
  return html.slice(0, idx) + EDITOR_INJECT_SCRIPT + html.slice(idx);
}
