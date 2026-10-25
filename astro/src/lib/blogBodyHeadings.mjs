// The post template already renders the title as the page's only <h1>. Some
// bodies (imported HTML) repeat it as an <h1>: drop that copy, and demote any
// other body <h1> to <h2>.
const text = (html) => html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

export function normalizeBodyHeadings(html, title) {
  if (!html) return '';
  const wanted = text(title || '');
  return html.replace(/<h1(\s[^>]*)?>([\s\S]*?)<\/h1>/gi, (_, attrs = '', inner) =>
    wanted && text(inner) === wanted ? '' : `<h2${attrs}>${inner}</h2>`,
  );
}
