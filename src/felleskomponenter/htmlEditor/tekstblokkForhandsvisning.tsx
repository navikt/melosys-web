import "./tekstblokkForhandsvisning.less";

interface Props {
  html: string;
  className?: string;
}

function TekstblokkForhandsvisning({ html, className }: Props) {
  const klasser = ["tekstblokk-forhandsvisning", className].filter(Boolean).join(" ");
  return <div className={klasser} dangerouslySetInnerHTML={{ __html: html }} />;
}

export default TekstblokkForhandsvisning;
