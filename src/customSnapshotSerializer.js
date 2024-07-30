import toDiffableHtml from "diffable-html";

const removeDynamicallyGeneratedFields = (html) => {
  return html.replace(/\s*(id|for|aria-labelledby|list|name|aria-describedby)="[^"]*"/g, ' $1="333"');
};

module.exports = {
  test(val) {
    return typeof val === "string" || (val && typeof val.outerHTML === "string");
  },
  print(val) {
    const html = typeof val === "string" ? val : val.outerHTML;
    const cleanedHtml = removeDynamicallyGeneratedFields(html);
    return toDiffableHtml(cleanedHtml);
  },
};
