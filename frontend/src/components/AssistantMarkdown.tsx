import { createElement, Fragment } from "react";

interface AssistantMarkdownProps {
  content: string;
}

type MarkdownBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] };

function parseBlocks(content: string): MarkdownBlock[] {
  const blocks: MarkdownBlock[] = [];
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({ type: "list", ...list });
      list = null;
    }
  };

  for (const line of lines) {
    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/);
    const item = line.match(/^\s*(?:([-*+])|(\d+)\.)\s+(.+)$/);

    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: "heading", level: heading[1].length, text: heading[2] });
    } else if (item) {
      flushParagraph();
      const ordered = Boolean(item[2]);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push(item[3]);
    } else if (!line.trim()) {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }

  flushParagraph();
  flushList();
  return blocks;
}

function renderInline(text: string) {
  const tokenPattern = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g;
  const pieces = text.split(tokenPattern);

  return pieces.map((piece, index) => {
    if ((piece.startsWith("**") && piece.endsWith("**")) || (piece.startsWith("__") && piece.endsWith("__"))) {
      return <strong key={index}>{piece.slice(2, -2)}</strong>;
    }
    if (piece.startsWith("`") && piece.endsWith("`")) {
      return <code key={index}>{piece.slice(1, -1)}</code>;
    }
    if ((piece.startsWith("*") && piece.endsWith("*")) || (piece.startsWith("_") && piece.endsWith("_"))) {
      return <em key={index}>{piece.slice(1, -1)}</em>;
    }
    return <Fragment key={index}>{piece}</Fragment>;
  });
}

export default function AssistantMarkdown({ content }: AssistantMarkdownProps) {
  return (
    <div className="assistant-markdown">
      {parseBlocks(content).map((block, index) => {
        if (block.type === "heading") {
          const tag = block.level <= 2 ? "h3" : "h4";
          return createElement(tag, { key: index }, renderInline(block.text));
        }
        if (block.type === "list") {
          const tag = block.ordered ? "ol" : "ul";
          return createElement(
            tag,
            { key: index },
            block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item)}</li>),
          );
        }
        return <p key={index}>{renderInline(block.text)}</p>;
      })}
    </div>
  );
}
