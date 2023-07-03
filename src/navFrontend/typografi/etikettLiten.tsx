import classNames from "classnames";

import "./etikettLiten.css";

interface EtikettLitenProps {
  className?: string;
  children: React.ReactNode;
}

const EtikettLiten = (props: EtikettLitenProps) => {
  const cls = classNames("etikett-liten", props.className);
  return <p className={cls}>{props.children}</p>;
};

export default EtikettLiten;
