export function ImageBlock({ content, alt }: { content: string; alt?: string }) {
  return (
    <figure className="mb-6">
      <img src={content} alt={alt ?? ""} className="w-full rounded object-cover" />
    </figure>
  );
}
