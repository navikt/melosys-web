import { ReactNode } from "react";
import "./list.css";
import { List as NavList, ListProps } from "@navikt/ds-react";

interface ItemProps {
  spacing?: number;
  children: ReactNode;
}

const List = ({ size = "small", children, ...rest }: ListProps) => {
  return (
    <NavList {...rest} size={size}>
      {children}
    </NavList>
  );
};

const ListItem = ({ spacing = 2, children }: ItemProps) => {
  return <NavList.Item className={`mb-${spacing}`}>{children}</NavList.Item>;
};

List.Item = ListItem;

export default List;
