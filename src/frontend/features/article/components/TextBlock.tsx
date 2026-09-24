import { slugify } from "./utils";

export function TextBlock({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  const currentParagraph: string[] = [];

  function flushParagraph(key: string) {
    if (currentParagraph.length > 0) {
      elements.push(
        <p key={key} className="text-sm text-neutral-700 leading-relaxed text-justify mb-4">
          {currentParagraph.join(" ")}
        </p>,
      );
      currentParagraph.length = 0;
    }
  }

  lines.forEach((line, i) => {
    const headingMatch = line.match(/^(#{1,6}) (.+)$/);
    if (headingMatch) {
      flushParagraph(`p-${i}`);
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      const id = slugify(text);

      if (level === 1) {
        elements.push(
          <h2 key={i} id={id} className="text-xl font-semibold text-primary mt-6 mb-4">
            {text}
          </h2>,
        );
      } else if (level === 2) {
        elements.push(
          <h3 key={i} id={id} className="text-lg font-semibold text-primary mt-5 mb-3">
            {text}
          </h3>,
        );
      } else {
        elements.push(
          <h4 key={i} id={id} className="text-base font-semibold text-primary mt-4 mb-2">
            {text}
          </h4>,
        );
      }
    } else if (line.trim() === "") {
      flushParagraph(`p-${i}`);
    } else {
      currentParagraph.push(line);
    }
  });
  flushParagraph("p-end");

  return <>{elements}</>;
}
