const assert = require("node:assert/strict");

const {
  articlePageFromApiArticle,
  renderPageHtml,
} = require("./generate-prerendered-html");

const summary = {
  id: 825,
  title: "BGSNL expanded its community: What The Hague achieved",
  description: "Members enjoying a game of bowling together",
  thumbnail: "https://example.com/the-hague.jpg",
};

const detail = {
  title: summary.title,
  content: "<p>Karina Karagyoz | February 7, 2025 | 3 min read</p><h2>The Hague branch</h2><p>The new BGSNL branch brought Bulgarian students together.</p>",
  styles: ".wp-block-paragraph{font-size:16px}",
};

const template = `<!doctype html>
<html>
  <head>
    <title>Bulgarian Society Netherlands</title>
    <meta name="description" content="Generic description">
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"Organization"}</script>
  </head>
  <body><div id="root"></div></body>
</html>`;

const page = articlePageFromApiArticle(summary, detail);
const html = renderPageHtml(template, page);

assert.equal(
  page.path,
  "/articles/825/bgsnl-expanded-its-community-what-the-hague-achieved",
);
assert.equal(page.schemaType, "Article");
assert.equal(page.image, summary.thumbnail);
assert.match(page.answer, /Quick answer/);
assert.match(page.articleHtml, /The Hague branch/);
assert.match(html, /<main data-bgsnl-prerender="true"/);
assert.match(html, /The Hague branch/);
assert.match(html, /new BGSNL branch brought Bulgarian students together/);
assert.match(html, /<link rel="canonical" href="https:\/\/www\.bulgariansociety\.nl\/articles\/825\/bgsnl-expanded-its-community-what-the-hague-achieved">/);
assert.match(html, /"@type":"Article"/);
assert.doesNotMatch(html, /undefined/);

console.log("Article prerender self-test passed");
