export default function slug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
}
