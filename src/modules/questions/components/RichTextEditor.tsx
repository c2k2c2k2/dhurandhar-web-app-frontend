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

type MathfieldHandle = HTMLElement & {
  value: string;
  insert?: (value: string) => boolean;
  executeCommand?: (command: string | [string, ...unknown[]]) => boolean;
};

const EQUATION_TEMPLATES = [
  { label: "Fraction", value: "\\frac{a}{b}" },
  { label: "Power", value: "x^{2}" },
  { label: "Square Root", value: "\\sqrt{x}" },
  { label: "Sum", value: "\\sum_{i=1}^{n} i" },
  { label: "Integral", value: "\\int_{0}^{1} x^2\\,dx" },
  { label: "Matrix", value: "\\begin{bmatrix}a & b\\\\ c & d\\end{bmatrix}" },
] as const;

const LEGACY_FONT_HINTS = [
  "shree",
  "s0708892",
  "shreelipi",
  "dev 0708",
  "kruti",
  "chanakya",
] as const;

function hasLegacyFontHint(value: string): boolean {
  const normalized = value.toLowerCase();
  return LEGACY_FONT_HINTS.some((hint) => normalized.includes(hint));
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

const LegacyMarathi = Mark.create({
  name: "legacyMarathi",
  parseHTML() {
    return [
      {
        style: "font-family",
        getAttrs: (fontFamily) =>
          hasLegacyFontHint(String(fontFamily || "")) ? {} : false,
      },
      {
        tag: "span",
        getAttrs: (element) => {
          if (!(element instanceof HTMLElement)) {
            return false;
          }

          const classes = element.className.toLowerCase();
          if (classes.split(/\s+/).includes("font-legacy-marathi")) {
            return {};
          }

          const dataLegacy = element.getAttribute("data-question-legacy");
          if (dataLegacy === "true") {
            return {};
          }

          const styleValue = `${element.getAttribute("style") || ""} ${element.style.fontFamily || ""}`;
          const hasLegacyFamily = hasLegacyFontHint(styleValue);

          return hasLegacyFamily ? {} : false;
        },
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { class: "font-legacy-marathi" }), 0];
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
  const [typingMode, setTypingMode] = React.useState<"unicode" | "legacy">("unicode");
  const [equationMode, setEquationMode] = React.useState<EquationMode>("inline");
  const [equationPanelOpen, setEquationPanelOpen] = React.useState(false);
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
      LegacyMarathi,
      InlineMath,
      BlockMath,
    ],
    content: value || "",
    editorProps: {
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
    if (!editor || !marathiEditor) return;

    const syncModeFromSelection = () => {
      setTypingMode(editor.isActive("legacyMarathi") ? "legacy" : "unicode");
    };

    syncModeFromSelection();
    editor.on("selectionUpdate", syncModeFromSelection);

    return () => {
      editor.off("selectionUpdate", syncModeFromSelection);
    };
  }, [editor, marathiEditor]);

  React.useEffect(() => {
    if (!editor || !marathiEditor) return;

    const legacyMark = editor.schema.marks.legacyMarathi;
    if (!legacyMark) return;
    const legacyMarkInstance = legacyMark.create();
    const { state } = editor;
    const marks = state.storedMarks ?? state.selection.$from.marks();
    const hasLegacy = Boolean(legacyMark.isInSet(marks));

    if (typingMode === "legacy") {
      if (!hasLegacy) {
        editor.view.dispatch(state.tr.setStoredMarks(legacyMarkInstance.addToSet(marks)));
      }
      return;
    }

    if (hasLegacy) {
      editor.view.dispatch(state.tr.setStoredMarks(legacyMarkInstance.removeFromSet(marks)));
    }
  }, [editor, marathiEditor, typingMode]);

  React.useEffect(() => {
    if (!equationPanelOpen) {
      return;
    }

    let disposed = false;
    void import("mathlive").then(() => {
      if (!disposed) {
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
      field.value = "\\frac{a}{b}";
      setEquationLatex("\\frac{a}{b}");
    }

    return () => {
      field.removeEventListener("input", onInput);
    };
  }, [mathliveReady, equationPanelOpen, equationLatex]);

  const applyTemplate = React.useCallback((latex: string) => {
    const field = mathFieldRef.current;
    if (!field) return;
    field.value = latex;
    setEquationLatex(latex);
    field.focus();
    field.executeCommand?.("showVirtualKeyboard");
  }, []);

  const insertEquation = React.useCallback(() => {
    if (!editor) return;

    const field = mathFieldRef.current;
    const latex = (field?.value || equationLatex).trim();
    if (!latex) {
      return;
    }

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
              Marathi editor supports Unicode + legacy text together. Choose typing mode below.
            </p>
            <div className="inline-flex rounded-xl border border-input bg-background p-0.5">
              <button
                type="button"
                onClick={() => {
                  setTypingMode("unicode");
                  editor?.chain().focus().run();
                }}
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
                onClick={() => {
                  setTypingMode("legacy");
                  editor?.chain().focus().run();
                }}
                className={cn(
                  "rounded-lg px-2 py-1 text-xs font-medium transition",
                  typingMode === "legacy"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Legacy
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
            active={editor?.isActive("table")}
            onClick={() =>
              editor
                ?.chain()
                .focus()
                .insertTable({ rows: 2, cols: 2, withHeaderRow: true })
                .run()
            }
          />
          <ToolbarButton
            icon={Rows3}
            label="+ Row"
            disabled={editorUnavailable || !editor?.isActive("table")}
            onClick={() => editor?.chain().focus().addRowAfter().run()}
          />
          <ToolbarButton
            icon={Columns3}
            label="+ Col"
            disabled={editorUnavailable || !editor?.isActive("table")}
            onClick={() => editor?.chain().focus().addColumnAfter().run()}
          />
          <ToolbarButton
            icon={Trash2}
            label="Del Table"
            disabled={editorUnavailable || !editor?.isActive("table")}
            onClick={() => editor?.chain().focus().deleteTable().run()}
          />
          <ToolbarButton
            icon={Sigma}
            label="Equation"
            disabled={editorUnavailable}
            active={equationPanelOpen}
            onClick={() => setEquationPanelOpen((open) => !open)}
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

        {equationPanelOpen ? (
          <div className="space-y-3 border-b border-border bg-background p-3">
            <div className="rounded-xl border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground">Equation Assistant</p>
              <p>
                No LaTeX knowledge needed. Use the math keyboard and templates below, then click
                <span className="font-semibold"> Insert Equation</span>.
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
