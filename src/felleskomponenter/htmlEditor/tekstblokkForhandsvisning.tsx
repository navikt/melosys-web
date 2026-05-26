import classNames from "classnames";
import { useMemo } from "react";

import "./tekstblokkForhandsvisning.less";

interface Props {
  html: string;
  className?: string;
}

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
