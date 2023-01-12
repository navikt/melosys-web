export const finnFokuserbareElementer = (htmlElement?: HTMLElement | null) => {
  if (!htmlElement) return null;

  const fokuserbarSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return htmlElement.querySelectorAll(fokuserbarSelectors);
};

export const flyttFokusTilHtmlElement = (htmlElement?: HTMLElement | null) => {
  if (!htmlElement) return;

  const fokuserbareElement = finnFokuserbareElementer(htmlElement);

  if (!fokuserbareElement || fokuserbareElement.length === 0) return;

  (fokuserbareElement[0] as HTMLElement).focus();
};

export const flyttFokusTilHtmlElementFraId = (id?: string | null) => {
  if (!id) return;
  flyttFokusTilHtmlElement(document.getElementById(id));
};
