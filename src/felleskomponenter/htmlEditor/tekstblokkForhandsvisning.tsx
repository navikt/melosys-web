import classNames from "classnames";
import { useMemo } from "react";

import "./tekstblokkForhandsvisning.less";

interface Props {
  html: string;
  className?: string;
}

// Wrapper [PLACEHOLDER]-tokens i en span med samme uthevingsstil som Quill-editoren,
// slik at forhåndsvisningen markerer placeholders rødt på samme måte som ved redigering.
// Mønsteret krysser ikke tag-grenser (ingen <, > eller nøstede klammer).
const uthevPlaceholders = (html: string): string =>
  html.replace(/\[[^[\]<>]*\]/g, (token) => `<span class="bracketed-text">${token}</span>`);

function TekstblokkForhandsvisning({ html, className }: Props) {
  const uthevet = useMemo(() => uthevPlaceholders(html), [html]);
  return (
    <div
      className={classNames("tekstblokk-forhandsvisning", className)}
      dangerouslySetInnerHTML={{ __html: uthevet }}
    />
  );
}

export default TekstblokkForhandsvisning;
