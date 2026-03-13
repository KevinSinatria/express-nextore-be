export default function slug(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-+|-+$/g, "");
}
//# sourceMappingURL=slug.js.map