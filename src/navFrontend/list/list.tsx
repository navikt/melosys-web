import { ReactNode } from "react";
import "./list.css";
import { List as NavList } from "@navikt/ds-react";
import { ListProps } from "@navikt/ds-react/src/list/types";

interface ItemProps {
  text: string;
  spacing?: number;
  children?: ReactNode;
}

const List = ({ title, size = "small", children }: ListProps) => {
  return (
    <NavList title={title} size={size}>
      {children}
    </NavList>
  );
};

const ListItem = ({ text, spacing = 2, children }: ItemProps) => {
  return (
    <NavList.Item className={`mb-${spacing}`}>
      {text}
      {children}
    </NavList.Item>
  );
};

List.Item = ListItem;

export default List;
