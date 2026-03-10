"use client";

import * as React from "react";
import {
  Bold,
  Columns3,
  Italic,
  List,
  ListOrdered,
  Rows3,
  Redo2,
  Sigma,
  Table2,
  Trash2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import {
  EditorContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
  useEditor,
} from "@tiptap/react";
import { Mark, Node, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import katex from "katex";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FormField } from "@/modules/shared/components/FormField";
import {
  DEFAULT_MARATHI_ENCODED_FONT,
  getLikelyLegacyMarathiFontKey,
  getMarathiFontKeyFromElement,
  getMarathiFontKeyFromHint,
  MARATHI_FONT_CLASSES,
  MARATHI_FONT_LABELS,
  type MarathiEncodedFontKey,
} from "../marathi-fonts";
import {
  extractTextFromHtml,
  hasMeaningfulHtml,
} from "../utils";

type RichTextEditorProps = {
  label: string;
  description?: string;
  error?: string;
  value: string;
  onChange: (html: string, text: string) => void;
  placeholder?: string;
  compact?: boolean;
  language?: "en" | "mr";
};

type EquationMode = "inline" | "block";
type MarathiTypingMode = "unicode" | MarathiEncodedFontKey;
type TableDraft = {
  rows: number;
  cols: number;
  withHeaderRow: boolean;
};

type MathfieldHandle = HTMLElement & {
  value: string;
  insert?: (value: string) => boolean;
  executeCommand?: (command: string | [string, ...unknown[]]) => boolean;
};

const EQUATION_TEMPLATES = [
  { label: "Fraction", value: "\\frac{a}{b}" },
  { label: "Power", value: "x^{2}" },
  { label: "Square Root", value: "\\sqrt{x}" },
  {
    label: "Nested Root",
    value: "\\sqrt{10+\\sqrt{25+\\sqrt{108+\\sqrt{154+\\sqrt{225}}}}}",
  },
  { label: "Sum", value: "\\sum_{i=1}^{n} i" },
  { label: "Integral", value: "\\int_{0}^{1} x^2\\,dx" },
  { label: "Matrix", value: "\\begin{bmatrix}a & b\\\\ c & d\\end{bmatrix}" },
  { label: "Repeating Bar", value: "0.\\overline{36}" },
  { label: "Mixed Fraction", value: "2\\frac{1}{3}" },
] as const;

const DEFAULT_EQUATION = "\\frac{a}{b}";
const DEFAULT_TABLE_DRAFT: TableDraft = {
  rows: 2,
  cols: 2,
  withHeaderRow: true,
};
const MARATHI_TYPING_MODE_STORAGE_KEY = "dhurandhar.marathiTypingMode";

function clampTableDimension(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(10, Math.max(1, Math.floor(value)));
}

function readStoredMarathiTypingMode(): MarathiTypingMode | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(MARATHI_TYPING_MODE_STORAGE_KEY);
  if (stored === "unicode" || stored === "shree-dev" || stored === "surekh") {
    return stored;
  }

  return null;
}

function persistMarathiTypingMode(mode: MarathiTypingMode) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(MARATHI_TYPING_MODE_STORAGE_KEY, mode);
}

function wrapTextNodesWithFontHint(
  element: HTMLElement,
  fontKey: MarathiEncodedFontKey
) {
  const document = element.ownerDocument;

  Array.from(element.childNodes).forEach((child) => {
    if (child.nodeType === 3) {
      const text = child.textContent ?? "";
      if (!text.trim()) {
        return;
      }

      const span = document.createElement("span");
      span.textContent = text;
      span.setAttribute("data-question-font", fontKey);
      span.className = MARATHI_FONT_CLASSES[fontKey];
      child.replaceWith(span);
      return;
    }

    if (!(child instanceof HTMLElement)) {
      return;
    }

    if (getMarathiFontKeyFromElement(child)) {
      return;
    }

    wrapTextNodesWithFontHint(child, fontKey);
  });
}

function normalizePastedHtml(html: string): string {
  if (!html.trim() || typeof window === "undefined") {
    return html;
  }

  try {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");

    document.querySelectorAll("font[face]").forEach((node) => {
      if (!(node instanceof HTMLElement)) {
        return;
      }

      const face = node.getAttribute("face")?.trim();
      if (!face) {
        return;
      }

      const existingStyle = node.getAttribute("style")?.trim();
      const nextStyle = existingStyle
        ? `font-family: ${face}; ${existingStyle}`
        : `font-family: ${face};`;

      node.removeAttribute("face");
      node.setAttribute("style", nextStyle);
    });

    document.body.querySelectorAll<HTMLElement>("*").forEach((node) => {
      const fontKey = getMarathiFontKeyFromElement(node);
      if (!fontKey) {
        return;
      }

      node.setAttribute("data-question-font", fontKey);
      node.classList.add(...MARATHI_FONT_CLASSES[fontKey].split(/\s+/));
      wrapTextNodesWithFontHint(node, fontKey);
    });

    return document.body.innerHTML;
  } catch {
    return html;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function detectEncodedFontFromPlainTextLine(
  line: string
): MarathiEncodedFontKey | null {
  const trimmed = line.trim();
  if (!trimmed) {
    return null;
  }

  const devanagariChars = (trimmed.match(/[\u0900-\u097F]/g) || []).length;
  if (devanagariChars > 0) {
    return null;
  }

  const surekhGlyphs =
    trimmed.match(
      /[\u00A1-\u00FF\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u02C6\u02DC\u2013-\u2022\u2026\u2030\u2039\u203A\u20AC]/g
    ) || [];

  if (surekhGlyphs.length >= Math.max(3, Math.floor(trimmed.length * 0.12))) {
    return "surekh";
  }

  return null;
}

function buildDetectedPasteHtml(text: string): string | null {
  const normalized = text.replace(/\r/g, "");
  let detectedEncodedText = false;

  const html = normalized
    .split(/\n{2,}/)
    .map((paragraph) => {
      const paragraphHtml = paragraph
        .split("\n")
        .map((line) => {
          const fontKey = detectEncodedFontFromPlainTextLine(line);
          const escaped = escapeHtml(line);

          if (!fontKey) {
            return escaped;
          }

          detectedEncodedText = true;
          return `<span data-question-font="${fontKey}" class="${MARATHI_FONT_CLASSES[fontKey]}">${escaped}</span>`;
        })
        .join("<br />");

      return `<p>${paragraphHtml}</p>`;
    })
    .join("");

  return detectedEncodedText ? html : null;
}

function decodeHtmlEntities(value: string): string {
  if (!value) return "";
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ");
}

function normalizeStoredLatex(raw: string): string {
  const decoded = decodeHtmlEntities(String(raw || "")).trim();
  if (!decoded) return "";

  const maybeJson = decoded;
  if (maybeJson.startsWith('"') && maybeJson.endsWith('"')) {
    try {
      const parsed = JSON.parse(maybeJson);
      if (typeof parsed === "string") {
        return parsed.trim();
      }
    } catch {
      // Keep fallback normalization below.
    }
  }

  const unwrapped =
    (decoded.startsWith('"') && decoded.endsWith('"')) ||
    (decoded.startsWith("'") && decoded.endsWith("'"))
      ? decoded.slice(1, -1)
      : decoded;

  return unwrapped.trim();
}

function EquationNodeView({
  node,
  selected,
  displayMode,
}: NodeViewProps & { displayMode: boolean }) {
  const latex = String(node.attrs.latex || "");
  const rendered = React.useMemo(
    () =>
      katex.renderToString(latex || "\\square", {
        displayMode,
        throwOnError: false,
        strict: "ignore",
      }),
    [latex, displayMode]
  );

  const tag = displayMode ? "div" : "span";
  return (
    <NodeViewWrapper
      as={tag}
      className={cn(
        displayMode
          ? "question-math-rendered question-math-rendered-block"
          : "question-math-rendered question-math-rendered-inline",
        selected && "ring-2 ring-ring"
      )}
      data-question-math-block={displayMode ? latex : undefined}
      data-question-math-inline={!displayMode ? latex : undefined}
      data-latex={latex}
      title="Equation"
      contentEditable={false}
    >
      <span dangerouslySetInnerHTML={{ __html: rendered }} />
    </NodeViewWrapper>
  );
}

const InlineMath = Node.create({
  name: "inlineMath",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      latex: {
        default: "",
        parseHTML: (element) =>
          normalizeStoredLatex(
            element.getAttribute("data-question-math-inline") ||
              element.getAttribute("data-latex") ||
              ""
          ),
        renderHTML: (attributes) => ({
          "data-question-math-inline": String(attributes.latex || ""),
        }),
      },
    };
  },
  parseHTML() {
    return [
      { tag: "span[data-question-math-inline]" },
      { tag: "span[data-latex]" },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer((props) => (
      <EquationNodeView {...props} displayMode={false} />
    ));
  },
});

const BlockMath = Node.create({
  name: "blockMath",
  group: "block",
  atom: true,
  selectable: true,
  addAttributes() {
    return {
      latex: {
        default: "",
        parseHTML: (element) =>
          normalizeStoredLatex(
            element.getAttribute("data-question-math-block") ||
              element.getAttribute("data-latex") ||
              ""
          ),
        renderHTML: (attributes) => ({
          "data-question-math-block": String(attributes.latex || ""),
        }),
      },
    };
  },
  parseHTML() {
    return [
      { tag: "div[data-question-math-block]" },
      { tag: "div[data-latex]" },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer((props) => (
      <EquationNodeView {...props} displayMode={true} />
    ));
  },
});

const MarathiEncodedFont = Mark.create({
  name: "marathiEncodedFont",
  addAttributes() {
    return {
      fontKey: {
        default: DEFAULT_MARATHI_ENCODED_FONT,
        parseHTML: (element) =>
          element instanceof HTMLElement
            ? getMarathiFontKeyFromElement(element) ?? DEFAULT_MARATHI_ENCODED_FONT
            : DEFAULT_MARATHI_ENCODED_FONT,
      },
    };
  },
  parseHTML() {
    return [
      {
        style: "font-family",
        getAttrs: (fontFamily) => {
          const fontKey = getMarathiFontKeyFromHint(String(fontFamily || ""));
          return fontKey ? { fontKey } : false;
        },
      },
      {
        tag: "span",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) {
            return false;
          }

          const fontKey = getMarathiFontKeyFromElement(element);
          if (fontKey) {
            return { fontKey };
          }

          const dataLegacy = element.getAttribute("data-question-legacy");
          return dataLegacy === "true"
            ? { fontKey: DEFAULT_MARATHI_ENCODED_FONT }
            : false;
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    const fontKey =
      HTMLAttributes.fontKey === "surekh" ? "surekh" : DEFAULT_MARATHI_ENCODED_FONT;
    const rest = { ...HTMLAttributes } as Record<string, unknown>;
    delete rest.fontKey;

    return [
      "span",
      mergeAttributes(rest, {
        class: MARATHI_FONT_CLASSES[fontKey],
        "data-question-font": fontKey,
      }),
      0,
    ];
  },
});

function normalizeHtmlForCompare(html: string): string {
  return html
    .replace(/<p><\/p>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ToolbarButton({
  icon: Icon,
  label,
  active,
  disabled,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant={active ? "primary" : "outline"}
      size="sm"
      disabled={disabled}
      onClick={onClick}
      className="h-8 rounded-xl px-2"
      title={label}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </Button>
  );
}

export function RichTextEditor({
  label,
  description,
  error,
  value,
  onChange,
  placeholder,
  compact = false,
  language = "en",
}: RichTextEditorProps) {
  const marathiEditor = language === "mr";
  const [typingMode, setTypingMode] = React.useState<MarathiTypingMode>(
    () => readStoredMarathiTypingMode() ?? "unicode"
  );
  const [equationMode, setEquationMode] = React.useState<EquationMode>("inline");
  const [equationPanelOpen, setEquationPanelOpen] = React.useState(false);
  const [tablePanelOpen, setTablePanelOpen] = React.useState(false);
  const [tableDraft, setTableDraft] = React.useState<TableDraft>(DEFAULT_TABLE_DRAFT);
  const [equationLatex, setEquationLatex] = React.useState("");
  const [mathliveReady, setMathliveReady] = React.useState(false);
  const mathFieldRef = React.useRef<MathfieldHandle | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      Placeholder.configure({
        placeholder: placeholder || "Type content...",
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      MarathiEncodedFont,
      InlineMath,
      BlockMath,
    ],
    content: value || "",
    editorProps: {
      transformPastedHTML: normalizePastedHtml,
      attributes: {
        class: cn(
          "question-rich-content prose-inherit w-full rounded-b-2xl px-3 py-2 text-foreground focus:outline-none",
          marathiEditor && "font-marathi-unicode",
          compact
            ? "min-h-[130px] text-base leading-7"
            : "min-h-[210px] text-lg leading-8"
        ),
      },
    },
    onUpdate: ({ editor: instance }) => {
      const html = instance.getHTML();
      const normalizedHtml = hasMeaningfulHtml(html) ? html : "";
      onChange(normalizedHtml, extractTextFromHtml(normalizedHtml));
    },
  });

  React.useEffect(() => {
    if (!editor) return;
    const current = normalizeHtmlForCompare(editor.getHTML());
    const next = normalizeHtmlForCompare(value || "");
    if (current === next) return;
    editor.commands.setContent(value || "");
  }, [editor, value]);

  React.useEffect(() => {
    if (!editor || !marathiEditor) {
      return;
    }

    const handlePaste = (event: ClipboardEvent) => {
      const clipboard = event.clipboardData;
      if (!clipboard) {
        return;
      }

      const html = clipboard.getData("text/html");
      if (html.trim()) {
        return;
      }

      const text = clipboard.getData("text/plain");
      if (!text.trim()) {
        return;
      }

      const detectedHtml = buildDetectedPasteHtml(text);
      if (!detectedHtml) {
        return;
      }

      event.preventDefault();
      editor.chain().focus().insertContent(detectedHtml).run();
      const detectedFont = getLikelyLegacyMarathiFontKey(text);
      if (detectedFont) {
        setTypingMode(detectedFont);
      }
    };

    const dom = editor.view.dom;
    dom.addEventListener("paste", handlePaste);

    return () => {
      dom.removeEventListener("paste", handlePaste);
    };
  }, [editor, marathiEditor]);

  React.useEffect(() => {
    if (!editor || !marathiEditor) return;

    const resolveTypingMode = () => {
      const fontMark = editor.schema.marks.marathiEncodedFont;
      if (!fontMark) {
        return "unicode" as MarathiTypingMode;
      }

      const marks = editor.state.storedMarks ?? editor.state.selection.$from.marks();
      const activeMark = fontMark.isInSet(marks);
      const activeFont = activeMark?.attrs.fontKey;

      return activeFont === "sulekha" || activeFont === "surekh"
        ? "surekh"
        : activeFont === "shree-dev"
          ? "shree-dev"
          : "unicode";
    };

    const syncModeFromSelection = () => {
      const nextMode = resolveTypingMode();
      setTypingMode((currentMode) =>
        nextMode === "unicode" && editor.isEmpty ? currentMode : nextMode
      );
    };

    syncModeFromSelection();
    editor.on("selectionUpdate", syncModeFromSelection);
    editor.on("transaction", syncModeFromSelection);

    return () => {
      editor.off("selectionUpdate", syncModeFromSelection);
      editor.off("transaction", syncModeFromSelection);
    };
  }, [editor, marathiEditor]);

  React.useEffect(() => {
    if (!editor || !marathiEditor) return;

    const fontMark = editor.schema.marks.marathiEncodedFont;
    if (!fontMark) return;
    const { state } = editor;
    const marks = state.storedMarks ?? state.selection.$from.marks();
    const activeMark = fontMark.isInSet(marks);

    if (typingMode === "unicode") {
      if (activeMark) {
        editor.view.dispatch(state.tr.setStoredMarks(activeMark.removeFromSet(marks)));
      }
      return;
    }

    if (activeMark?.attrs.fontKey === typingMode) {
      return;
    }

    const nextMark = fontMark.create({ fontKey: typingMode });
    const nextMarks = activeMark
      ? nextMark.addToSet(activeMark.removeFromSet(marks))
      : nextMark.addToSet(marks);
    editor.view.dispatch(state.tr.setStoredMarks(nextMarks));
  }, [editor, marathiEditor, typingMode]);

  React.useEffect(() => {
    if (!marathiEditor) {
      return;
    }

    persistMarathiTypingMode(typingMode);
  }, [marathiEditor, typingMode]);

  React.useEffect(() => {
    if (!equationPanelOpen) {
      return;
    }

    let disposed = false;
    void import("mathlive").then(({ MathfieldElement }) => {
      if (!disposed) {
        MathfieldElement.soundsDirectory = null;
        MathfieldElement.keypressSound = null;
        MathfieldElement.plonkSound = null;
        setMathliveReady(true);
      }
    });

    return () => {
      disposed = true;
    };
  }, [equationPanelOpen]);

  React.useEffect(() => {
    if (!mathliveReady || !equationPanelOpen) {
      return;
    }

    const field = mathFieldRef.current;
    if (!field) {
      return;
    }

    field.setAttribute("math-virtual-keyboard-policy", "manual");
    field.setAttribute("smart-fence", "");
    field.setAttribute("smart-mode", "");
    field.setAttribute("placeholder", "Type equation here");

    const onInput = () => {
      setEquationLatex(field.value || "");
    };

    field.addEventListener("input", onInput);

    if (!field.value && !equationLatex) {
      field.value = DEFAULT_EQUATION;
      setEquationLatex(DEFAULT_EQUATION);
    }

    return () => {
      field.removeEventListener("input", onInput);
    };
  }, [mathliveReady, equationPanelOpen, equationLatex]);

  React.useEffect(() => {
    if (!mathliveReady || !equationPanelOpen) {
      return;
    }

    const field = mathFieldRef.current;
    if (!field) {
      return;
    }

    if ((field.value || "") !== equationLatex) {
      field.value = equationLatex || "";
    }
  }, [equationLatex, mathliveReady, equationPanelOpen]);

  const applyTemplate = React.useCallback((latex: string) => {
    const field = mathFieldRef.current;
    if (!field) return;
    field.value = latex;
    setEquationLatex(latex);
    field.focus();
    field.executeCommand?.("showVirtualKeyboard");
  }, []);

  const applyTypingMode = React.useCallback(
    (nextMode: MarathiTypingMode) => {
      if (!editor || !marathiEditor) {
        return;
      }

      const fontMark = editor.schema.marks.marathiEncodedFont;
      if (!fontMark) {
        return;
      }

      setTypingMode(nextMode);

      const chain = editor.chain().focus();

      if (editor.state.selection.empty) {
        editor.commands.focus();
        const { state } = editor;
        const marks = state.storedMarks ?? state.selection.$from.marks();
        const activeMark = fontMark.isInSet(marks);
        const nextMarks =
          nextMode === "unicode"
            ? activeMark
              ? activeMark.removeFromSet(marks)
              : marks
            : fontMark
                .create({ fontKey: nextMode })
                .addToSet(activeMark ? activeMark.removeFromSet(marks) : marks);

        editor.view.dispatch(state.tr.setStoredMarks(nextMarks));
        return;
      }

      if (nextMode === "unicode") {
        chain.unsetMark("marathiEncodedFont").run();
        return;
      }

      chain
        .unsetMark("marathiEncodedFont")
        .setMark("marathiEncodedFont", { fontKey: nextMode })
        .run();
    },
    [editor, marathiEditor]
  );

  const insertTable = React.useCallback(() => {
    if (!editor) return;

    editor
      .chain()
      .focus()
      .insertTable({
        rows: clampTableDimension(tableDraft.rows, DEFAULT_TABLE_DRAFT.rows),
        cols: clampTableDimension(tableDraft.cols, DEFAULT_TABLE_DRAFT.cols),
        withHeaderRow: tableDraft.withHeaderRow,
      })
      .run();
    setTablePanelOpen(false);
  }, [editor, tableDraft.cols, tableDraft.rows, tableDraft.withHeaderRow]);

  const insertEquation = React.useCallback(() => {
    if (!editor) return;

    const field = mathFieldRef.current;
    const latex = (field?.value || equationLatex).trim();
    if (!latex) {
      return;
    }

    const nodeType = equationMode === "block" ? "blockMath" : "inlineMath";
    const chain = editor.chain().focus().insertContent({
      type: nodeType,
      attrs: { latex },
    });
    if (equationMode === "block") {
      chain.insertContent("<p></p>");
    }
    chain.run();

    if (field) {
      field.value = "";
    }
    setEquationLatex("");
    setEquationPanelOpen(false);
  }, [editor, equationLatex, equationMode]);

  const openMathKeyboard = React.useCallback(() => {
    const field = mathFieldRef.current;
    if (!field) return;
    field.focus();
    field.executeCommand?.("showVirtualKeyboard");
  }, []);

  const editorUnavailable = !editor;
  const tableActive = Boolean(editor?.isActive("table"));
  const equationPreview = React.useMemo(
    () =>
      equationLatex.trim()
        ? katex.renderToString(equationLatex.trim(), {
            displayMode: equationMode === "block",
            throwOnError: false,
            strict: "ignore",
          })
        : "",
    [equationLatex, equationMode]
  );

  const mathFieldNode = React.useMemo(
    () =>
      React.createElement("math-field", {
        ref: (node: Element | null) => {
          mathFieldRef.current = node as MathfieldHandle | null;
        },
        className: "question-math-field",
      }),
    []
  );

  return (
    <FormField label={label} description={description} error={error}>
      <div className="overflow-hidden rounded-2xl border border-input bg-background">
        {marathiEditor ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">
              Marathi editor supports Unicode, Shree-Dev, and Surekh together. Choose the
              typing font before entering or pasting content.
            </p>
            <div className="inline-flex rounded-xl border border-input bg-background p-0.5">
              <button
                type="button"
                onClick={() => applyTypingMode("unicode")}
                className={cn(
                  "rounded-lg px-2 py-1 text-xs font-medium transition",
                  typingMode === "unicode"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Unicode
              </button>
              <button
                type="button"
                onClick={() => applyTypingMode("shree-dev")}
                className={cn(
                  "rounded-lg px-2 py-1 text-xs font-medium transition",
                  typingMode === "shree-dev"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {MARATHI_FONT_LABELS["shree-dev"]}
              </button>
              <button
                type="button"
                onClick={() => applyTypingMode("surekh")}
                className={cn(
                  "rounded-lg px-2 py-1 text-xs font-medium transition",
                  typingMode === "surekh"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {MARATHI_FONT_LABELS.surekh}
              </button>
            </div>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-1 border-b border-border bg-muted/40 p-2">
          <ToolbarButton
            icon={Bold}
            label="Bold"
            disabled={editorUnavailable}
            active={editor?.isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          />
          <ToolbarButton
            icon={Italic}
            label="Italic"
            disabled={editorUnavailable}
            active={editor?.isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          />
          <ToolbarButton
            icon={UnderlineIcon}
            label="Underline"
            disabled={editorUnavailable}
            active={editor?.isActive("underline")}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          />
          <ToolbarButton
            icon={List}
            label="Bullets"
            disabled={editorUnavailable}
            active={editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          />
          <ToolbarButton
            icon={ListOrdered}
            label="Numbered"
            disabled={editorUnavailable}
            active={editor?.isActive("orderedList")}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          />
          <ToolbarButton
            icon={Table2}
            label="Table"
            disabled={editorUnavailable}
            active={tablePanelOpen || tableActive}
            onClick={() => {
              setTablePanelOpen((open) => !open);
              setEquationPanelOpen(false);
            }}
          />
          <ToolbarButton
            icon={Rows3}
            label="+ Row"
            disabled={editorUnavailable}
            onClick={() => editor?.chain().focus().addRowAfter().run()}
          />
          <ToolbarButton
            icon={Columns3}
            label="+ Col"
            disabled={editorUnavailable}
            onClick={() => editor?.chain().focus().addColumnAfter().run()}
          />
          <ToolbarButton
            icon={Trash2}
            label="Del Table"
            disabled={editorUnavailable}
            onClick={() => editor?.chain().focus().deleteTable().run()}
          />
          <ToolbarButton
            icon={Sigma}
            label="Equation"
            disabled={editorUnavailable}
            active={equationPanelOpen}
            onClick={() => {
              setEquationPanelOpen((open) => !open);
              setTablePanelOpen(false);
            }}
          />
          <ToolbarButton
            icon={Undo2}
            label="Undo"
            disabled={editorUnavailable || !editor?.can().chain().focus().undo().run()}
            onClick={() => editor?.chain().focus().undo().run()}
          />
          <ToolbarButton
            icon={Redo2}
            label="Redo"
            disabled={editorUnavailable || !editor?.can().chain().focus().redo().run()}
            onClick={() => editor?.chain().focus().redo().run()}
          />
        </div>

        {tablePanelOpen ? (
          <div className="space-y-3 border-b border-border bg-background p-3">
            <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Table Tools</p>
              <p>
                Create the exact number of rows and columns you need, then keep adjusting the
                active table from the buttons below.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-[repeat(2,minmax(0,140px))_auto]">
              <label className="space-y-1 text-xs text-muted-foreground">
                <span>Rows</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={tableDraft.rows}
                  onChange={(event) =>
                    setTableDraft((current) => ({
                      ...current,
                      rows: clampTableDimension(Number(event.target.value), current.rows),
                    }))
                  }
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
                />
              </label>
              <label className="space-y-1 text-xs text-muted-foreground">
                <span>Columns</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={tableDraft.cols}
                  onChange={(event) =>
                    setTableDraft((current) => ({
                      ...current,
                      cols: clampTableDimension(Number(event.target.value), current.cols),
                    }))
                  }
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground"
                />
              </label>
              <label className="flex items-end gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={tableDraft.withHeaderRow}
                  onChange={(event) =>
                    setTableDraft((current) => ({
                      ...current,
                      withHeaderRow: event.target.checked,
                    }))
                  }
                />
                Header row
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="primary" onClick={insertTable}>
                Insert table
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={editorUnavailable}
                onClick={() => editor?.chain().focus().addRowBefore().run()}
              >
                Add row above
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={editorUnavailable}
                onClick={() => editor?.chain().focus().addRowAfter().run()}
              >
                Add row below
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={editorUnavailable}
                onClick={() => editor?.chain().focus().addColumnBefore().run()}
              >
                Add column left
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={editorUnavailable}
                onClick={() => editor?.chain().focus().addColumnAfter().run()}
              >
                Add column right
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={editorUnavailable}
                onClick={() => editor?.chain().focus().deleteRow().run()}
              >
                Delete row
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={editorUnavailable}
                onClick={() => editor?.chain().focus().deleteColumn().run()}
              >
                Delete column
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={editorUnavailable}
                onClick={() => editor?.chain().focus().deleteTable().run()}
              >
                Delete table
              </Button>
            </div>
          </div>
        ) : null}

        {equationPanelOpen ? (
          <div className="space-y-3 border-b border-border bg-background p-3">
            <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Equation Assistant</p>
              <p>
                Use the math keyboard, templates, or the LaTeX box below for complex expressions
                like nested roots and recurring values, then insert the rendered equation.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {EQUATION_TEMPLATES.map((template) => (
                <Button
                  key={template.label}
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => applyTemplate(template.value)}
                >
                  {template.label}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={equationMode === "inline" ? "primary" : "secondary"}
                onClick={() => setEquationMode("inline")}
              >
                Inline equation
              </Button>
              <Button
                type="button"
                size="sm"
                variant={equationMode === "block" ? "primary" : "secondary"}
                onClick={() => setEquationMode("block")}
              >
                New line equation
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={openMathKeyboard}
                disabled={!mathliveReady}
              >
                Open Math Keyboard
              </Button>
            </div>

            <div className="rounded-xl border border-border bg-background p-2">
              {mathliveReady ? (
                mathFieldNode
              ) : (
                <p className="px-2 py-3 text-xs text-muted-foreground">Loading equation editor...</p>
              )}
            </div>

            <label className="space-y-1 text-xs text-muted-foreground">
              <span>LaTeX source</span>
              <textarea
                value={equationLatex}
                onChange={(event) => setEquationLatex(event.target.value)}
                placeholder="Paste or type LaTeX for complex equations"
                className="min-h-[96px] w-full rounded-xl border border-input bg-background px-3 py-2 font-mono text-sm text-foreground"
              />
            </label>

            {equationPreview ? (
              <div className="rounded-xl border border-border bg-muted/30 p-3">
                <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  Preview
                </p>
                <div
                  className={cn(
                    "question-rich-content",
                    equationMode === "block" && "text-center"
                  )}
                  dangerouslySetInnerHTML={{ __html: equationPreview }}
                />
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="primary"
                onClick={insertEquation}
                disabled={!equationLatex.trim() || editorUnavailable}
              >
                Insert Equation
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  if (mathFieldRef.current) {
                    mathFieldRef.current.value = "";
                  }
                  setEquationLatex("");
                  setEquationPanelOpen(false);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : null}

        <EditorContent editor={editor} />
      </div>
    </FormField>
  );
}
