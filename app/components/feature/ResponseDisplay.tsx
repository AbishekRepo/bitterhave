"use client";

import { useMemo } from "react";

interface ResponseDisplayProps {
  content: string;
}

type TextPart = { type: "text"; content: string };
type CodePart = { type: "code"; content: string; language: string };
type TablePart = { type: "table"; rows: string[][] };
type ContentPart = TextPart | CodePart | TablePart;

export default function ResponseDisplay({ content }: ResponseDisplayProps) {
  // Helper function to parse markdown table
  const parseTable = (tableText: string): string[][] | null => {
    const lines = tableText.trim().split("\n");
    if (lines.length < 3) return null;

    const rows: string[][] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip separator line (contains dashes and pipes)
      if (line.match(/^\|?\s*[-\s|:]+\s*\|?\s*$/)) {
        continue;
      }

      // Parse table row
      if (line.startsWith("|") || line.includes("|")) {
        const cells = line
          .split("|")
          .map((cell) => cell.trim())
          .filter((cell) => cell.length > 0);

        if (cells.length > 0) {
          rows.push(cells);
        }
      }
    }

    return rows.length >= 2 ? rows : null;
  };

  // Parse content to identify code blocks, tables, and text
  const parsedContent = useMemo(() => {
    const parts: ContentPart[] = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const tableRegex = /(\|[^\n|]+\|(?:\n\|[-:\s|]+\|)?(?:\n\|[^\n|]+\|)*)/g;

    let lastIndex = 0;
    let codeMatch;
    let tableMatch;
    const events: Array<
      | {
          type: "code";
          index: number;
          endIndex: number;
          language: string;
          content: string;
        }
      | {
          type: "table";
          index: number;
          endIndex: number;
          rows: string[][];
        }
    > = [];

    // Collect all code block matches
    while ((codeMatch = codeBlockRegex.exec(content)) !== null) {
      events.push({
        type: "code",
        index: codeMatch.index,
        endIndex: codeBlockRegex.lastIndex,
        language: codeMatch[1] || "text",
        content: codeMatch[2].trim(),
      });
    }

    // Collect all table matches
    tableRegex.lastIndex = 0;
    while ((tableMatch = tableRegex.exec(content)) !== null) {
      const tableData = parseTable(tableMatch[0]);
      if (tableData) {
        events.push({
          type: "table",
          index: tableMatch.index,
          endIndex: tableRegex.lastIndex,
          rows: tableData,
        });
      }
    }

    // Sort events by index
    events.sort((a, b) => a.index - b.index);

    // Process events and build parts
    for (const event of events) {
      // Add text before this event
      if (event.index > lastIndex) {
        const textContent = content.slice(lastIndex, event.index);
        if (textContent.trim()) {
          parts.push({
            type: "text",
            content: textContent,
          });
        }
      }

      // Add the event
      if (event.type === "code") {
        parts.push({
          type: "code",
          language: event.language,
          content: event.content,
        });
      } else if (event.type === "table") {
        parts.push({
          type: "table",
          rows: event.rows,
        });
      }

      lastIndex = event.endIndex;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      const remainingText = content.slice(lastIndex);
      if (remainingText.trim()) {
        parts.push({
          type: "text",
          content: remainingText,
        });
      }
    }

    return parts.length > 0 ? parts : [{ type: "text", content }];
  }, [content]);

  return (
    <div className="response-display">
      {parsedContent.map((part, index) => {
        if (part.type === "code") {
          const codePart = part as CodePart;
          return (
            <div key={index} className="code-block-wrapper">
              <div className="code-block-header">
                <span className="code-language">{codePart.language}</span>
              </div>
              <pre className="code-block">
                <code>{codePart.content}</code>
              </pre>
            </div>
          );
        }
        if (part.type === "table") {
          const tablePart = part as TablePart;
          return (
            <div key={index} className="table-wrapper">
              <table className="markdown-table">
                <tbody>
                  {tablePart.rows.map((row: string[], rowIndex: number) => (
                    <tr
                      key={rowIndex}
                      className={rowIndex === 0 ? "table-header-row" : ""}
                    >
                      {row.map((cell: string, cellIndex: number) => (
                        <td key={cellIndex} className="table-cell">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        const textPart = part as TextPart;
        return (
          <div key={index} className="text-content">
            {textPart.content}
          </div>
        );
      })}
    </div>
  );
}
