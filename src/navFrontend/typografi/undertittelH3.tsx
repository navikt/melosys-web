import React from "react";
import classNames from "classnames";

interface UndertittelH3Props {
  className?: string;
  children: React.ReactNode;
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
