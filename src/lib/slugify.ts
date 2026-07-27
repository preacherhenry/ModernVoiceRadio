export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
) {
  const root = slugify(base) || "item";
  let slug = root;
  let i = 2;
  while (await exists(slug)) {
    slug = `${root}-${i}`;
    i++;
  }
  return slug;
}
