import { useEffect } from "react";

export function PageHead({
  title,
  description,
  privatePage = false,
}: {
  title: string;
  description: string;
  privatePage?: boolean;
}) {
  useEffect(() => {
    document.title = `${title} — Tanvishas Candles`;
    for (const [name, content] of [
      ["description", description],
      ["robots", privatePage ? "noindex, nofollow" : "index, follow"],
    ]) {
      let tag = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.name = name;
        document.head.appendChild(tag);
      }
      tag.content = content;
    }
  }, [title, description, privatePage]);
  return null;
}
