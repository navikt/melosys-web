import classNames from "classnames";

import "./tekstblokkForhandsvisning.less";

interface Props {
  html: string;
  className?: string;
}

function TekstblokkForhandsvisning({ html, className }: Props) {
  return (
    <div className={classNames("tekstblokk-forhandsvisning", className)} dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export default TekstblokkForhandsvisning;
