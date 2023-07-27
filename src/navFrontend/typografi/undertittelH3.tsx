import classNames from "classnames";
import { ReactNode } from "react";

interface UndertittelH3Props {
  className?: string;
  children: ReactNode;
  id?: string;
}

const UndertittelH3 = (props: UndertittelH3Props) => {
  const cls = classNames("typo-undertittel", props.className);
  return (
    <h3 className={cls} id={props.id}>
      {props.children}
    </h3>
  );
};

export default UndertittelH3;
