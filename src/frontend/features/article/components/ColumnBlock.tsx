import type { ArticleBlock } from "./types";

export function ColumnBlock({
  columns,
  renderBlock,
}: {
  columns: ArticleBlock[][];
  renderBlock: (block: ArticleBlock, key: number) => React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-6 md:flex-row">
      {columns.map((colBlocks, i) => (
        <div key={i} className="min-w-0 md:flex-1">
          {colBlocks.map((block, j) => renderBlock(block, j))}
        </div>
      ))}
    </div>
  );
}
