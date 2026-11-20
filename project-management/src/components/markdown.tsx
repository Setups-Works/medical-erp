import { Fragment } from "react";

/** Small, safe markdown renderer for task descriptions: ### headings, - bullets, **bold**, `code`, _italic_. No HTML. */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`|_[^_]+_)/g).map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) return <strong key={i} className="font-semibold text-ink">{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`"))
      return (
        <code key={i} className="rounded-xs bg-sunken px-1 font-mono text-[0.9em] text-ink">
          {p.slice(1, -1)}
        </code>
      );
    if (p.startsWith("_") && p.endsWith("_") && p.length > 2) return <em key={i} className="text-ink-4 not-italic text-[12.5px]">{p.slice(1, -1)}</em>;
    return <Fragment key={i}>{p}</Fragment>;
  });
}

export function Markdown({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = () => {
    if (list.length)
      blocks.push(
        <ul key={`u${blocks.length}`} className="my-1.5 list-disc space-y-0.5 pl-5 marker:text-ink-4">
          {list.map((l, i) => (
            <li key={i}>{inline(l)}</li>
          ))}
        </ul>,
      );
    list = [];
  };
  let table: string[][] = [];
  const flushTable = () => {
    if (!table.length) return;
    const [head, ...rows] = table.filter((r) => !r.every((c) => /^:?-+:?$/.test(c)));
    blocks.push(
      <div key={`t${blocks.length}`} className="my-2 overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead>
            <tr>{head?.map((c, i) => <th key={i} className="border-b border-line px-2 py-1.5 font-medium text-ink-3">{inline(c)}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-line last:border-0">
                {r.map((c, j) => <td key={j} className="px-2 py-1.5 align-top">{inline(c)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    table = [];
  };
  for (const line of text.split("\n")) {
    if (line.trim().startsWith("|")) {
      flush();
      table.push(line.trim().split("|").slice(1, -1).map((c) => c.trim()));
      continue;
    }
    flushTable();
    if (/^\s*[-*] /.test(line)) {
      list.push(line.replace(/^\s*[-*] /, ""));
      continue;
    }
    flush();
    if (/^#{1,2} /.test(line))
      blocks.push(
        <h3 key={blocks.length} className="mt-4 mb-1 text-[14.5px] font-semibold text-ink">
          {line.replace(/^#+ /, "")}
        </h3>,
      );
    else if (line.startsWith("### "))
      blocks.push(
        <h4 key={blocks.length} className="mt-3.5 mb-1 text-[12.5px] font-semibold uppercase tracking-wide text-ink-3">
          {line.slice(4)}
        </h4>,
      );
    else if (line.trim())
      blocks.push(
        <p key={blocks.length} className="my-1">
          {inline(line)}
        </p>,
      );
  }
  flush();
  flushTable();
  return <div className="text-[13.5px] leading-relaxed text-ink-2">{blocks}</div>;
}
