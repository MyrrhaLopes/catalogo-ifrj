import type { ArticleBlock } from "./types";

export function ColumnBlock({
  columns,
  renderBlock,
}: {
  columns: ArticleBlock[][];
  renderBlock: (block: ArticleBlock, key: number) => React.ReactNode;
}) {
  return (
    <div className="flex gap-6 mb-6">
      {columns.map((colBlocks, i) => (
        <div key={i} className="flex-1 min-w-0">
          {colBlocks.map((block, j) => renderBlock(block, j))}
        </div>
      ))}
    </div>
  );
}
