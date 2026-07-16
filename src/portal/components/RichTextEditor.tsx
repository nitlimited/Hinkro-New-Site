import React, { useCallback, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";

function stripFormatting(html: string): string {
  const div = document.createElement("div");
  div.innerHTML = html;

  const forbidden = [
    "script", "style", "link", "meta", "head",
    "iframe", "object", "embed", "form", "input",
    "button", "select", "textarea",
    "o:p", "v:shape", "v:group", "v:rect", "v:textbox",
    "w:sdt", "w:sdtPr", "w:sdtContent",
    "m:oMath", "m:oMathPara",
    "xml", "namespace", "st1:", "o:",
  ];
  forbidden.forEach((tag) => {
    div.querySelectorAll(tag).forEach((el) => el.remove());
  });

  div.querySelectorAll("div, span, p").forEach((el) => {
    const style = el.getAttribute("style") || "";
    if (style.match(/mso-|microsoft|word|office/i)) {
      el.replaceWith(...Array.from(el.childNodes));
    }
  });

  div.querySelectorAll("[class]").forEach((el) => {
    const cls = el.getAttribute("class") || "";
    if (cls.match(/^(Mso|ms)/) || cls === "") {
      el.removeAttribute("class");
    }
  });

  div.querySelectorAll("[lang]").forEach((el) => el.removeAttribute("lang"));
  div.querySelectorAll("[xml:lang]").forEach((el) => el.removeAttribute("xml:lang"));
  div.querySelectorAll("[xmlns]").forEach((el) => el.removeAttribute("xmlns"));

  div.querySelectorAll("div").forEach((el) => {
    if (el.childNodes.length === 1 && el.firstChild?.nodeName === "BR") {
      el.replaceWith(document.createElement("br"));
    }
  });

  div.querySelectorAll("[style]").forEach((el) => {
    const style = el.getAttribute("style") || "";
    const cleaned = style
      .replace(/mso-[^:]+:[^;]+;?\s*/gi, "")
      .replace(/microsoft[^:]+:[^;]+;?\s*/gi, "")
      .replace(/tab-stops:[^;]+;?\s*/gi, "")
      .replace(/line-height:[^;]+;?\s*/gi, "")
      .replace(/text-autospace:[^;]+;?\s*/gi, "")
      .replace(/font-family:[^;]+;?\s*/gi, "")
      .trim();
    if (!cleaned) {
      el.removeAttribute("style");
    } else {
      el.setAttribute("style", cleaned);
    }
  });

  div.querySelectorAll("*").forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (
        name.startsWith("on") ||
        name === "class" ||
        name === "style" ||
        name === "id" ||
        name === "data-reactid" ||
        name === "data-react-checksum" ||
        name.startsWith("xmlns") ||
        name.startsWith("xml:")
      ) {
        el.removeAttribute(attr.name);
      }
    });

    if (el.tagName === "A") {
      const href = el.getAttribute("href") || "";
      if (href.startsWith("javascript:") || href.startsWith("#")) {
        el.removeAttribute("href");
      }
    }
    if (el.tagName === "IMG") {
      const src = el.getAttribute("src") || "";
      if (src.startsWith("data:") && src.length > 2048) {
        el.removeAttribute("src");
      }
    }
  });

  div.querySelectorAll("span").forEach((el) => {
    if (el.attributes.length === 0 && el.childNodes.length > 0) {
      el.replaceWith(...Array.from(el.childNodes));
    }
  });

  div.querySelectorAll("b, strong, i, em, u, s, strike").forEach((el) => {
    if (el.childNodes.length === 0) {
      el.remove();
    }
  });

  div.querySelectorAll("p > br:first-child:last-child").forEach((el) => {
    el.closest("p")?.remove();
  });

  div.querySelectorAll("p:empty, div:empty, span:empty").forEach((el) => el.remove());

  return div.innerHTML;
}

function cleanPastedText(text: string): string {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .replace(/^\s+|\s+$/gm, "")
    .replace(/\u00A0/g, " ")
    .replace(/\u200B|\u200C|\u200D|\uFEFF/g, "")
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/\u2026/g, "...")
    .trim();
}

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing your article...",
  minHeight = "300px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: { class: "rte-article-image" },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "rte-link" },
      }),
      Placeholder.configure({ placeholder }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value || "",
    onUpdate: ({ editor: e }) => {
      onChange(e.getHTML());
    },
    editorProps: {
      handlePaste: (view, event) => {
        const html = event.clipboardData?.getData("text/html");
        const text = event.clipboardData?.getData("text/plain");

        if (html) {
          event.preventDefault();
          const cleaned = stripFormatting(html);
          const parsed = new DOMParser().parseFromString(cleaned, "text/html");
          const cleanHtml = parsed.body.innerHTML;
          editor?.commands.insertContent(cleanHtml);
          return true;
        }

        if (text) {
          event.preventDefault();
          const cleaned = cleanPastedText(text);
          editor?.commands.insertContent(cleaned);
          return true;
        }

        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  }, [value]);

  const addImage = useCallback(() => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url, alt: "Article image" }).run();
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL:", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `rte-toolbar-btn${active ? " rte-toolbar-btn--active" : ""}`;

  return (
    <div className="rte-wrapper" style={{ minHeight }}>
      <div className="rte-toolbar">
        <div className="rte-toolbar-group">
          <button
            type="button"
            className={btnClass(editor.isActive("heading", { level: 2 }))}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2"
          >
            H2
          </button>
          <button
            type="button"
            className={btnClass(editor.isActive("heading", { level: 3 }))}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            title="Heading 3"
          >
            H3
          </button>
          <button
            type="button"
            className={btnClass(false)}
            onClick={() => editor.chain().focus().setParagraph().run()}
            title="Paragraph"
          >
            ¶
          </button>
        </div>

        <div className="rte-toolbar-divider" />

        <div className="rte-toolbar-group">
          <button
            type="button"
            className={btnClass(editor.isActive("bold"))}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            className={btnClass(editor.isActive("italic"))}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            className={btnClass(editor.isActive("underline"))}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            className={btnClass(editor.isActive("strike"))}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
          >
            <s>S</s>
          </button>
        </div>

        <div className="rte-toolbar-divider" />

        <div className="rte-toolbar-group">
          <button
            type="button"
            className={btnClass(editor.isActive({ textAlign: "left" }))}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            title="Align left"
          >
            ≡
          </button>
          <button
            type="button"
            className={btnClass(editor.isActive({ textAlign: "center" }))}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            title="Align center"
          >
            ≡
          </button>
          <button
            type="button"
            className={btnClass(editor.isActive({ textAlign: "right" }))}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            title="Align right"
          >
            ≡
          </button>
        </div>

        <div className="rte-toolbar-divider" />

        <div className="rte-toolbar-group">
          <button
            type="button"
            className={btnClass(editor.isActive("bulletList"))}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
          >
            • List
          </button>
          <button
            type="button"
            className={btnClass(editor.isActive("orderedList"))}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered list"
          >
            1. List
          </button>
          <button
            type="button"
            className={btnClass(editor.isActive("blockquote"))}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Quote"
          >
            " Quote
          </button>
          <button
            type="button"
            className={btnClass(editor.isActive("codeBlock"))}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            title="Code block"
          >
            {"</>"}
          </button>
        </div>

        <div className="rte-toolbar-divider" />

        <div className="rte-toolbar-group">
          <button
            type="button"
            className={btnClass(editor.isActive("link"))}
            onClick={setLink}
            title="Insert link"
          >
            🔗
          </button>
          <button
            type="button"
            className={btnClass(false)}
            onClick={addImage}
            title="Insert image"
          >
            🖼
          </button>
        </div>

        <div className="rte-toolbar-group rte-toolbar-right">
          <button
            type="button"
            className="rte-toolbar-btn"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            ↶
          </button>
          <button
            type="button"
            className="rte-toolbar-btn"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            ↷
          </button>
        </div>
      </div>

      <EditorContent editor={editor} className="rte-content" />
    </div>
  );
}
