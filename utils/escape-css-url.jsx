export default function escapeCssUrl(url) {
  // Convert to string in case it's not already
  const urlString = String(url);

  // Escape any single quotes, double quotes, and parentheses
  return urlString.replace(/['"\(\)]/g, "\\$&");
}
