import { ReactNode } from "react";
import "./list.less";
import { List as NavList, ListProps } from "@navikt/ds-react";

interface ItemProps {
  spacing?: number;
  children: ReactNode;
}

function List({ size = "small", children, ...rest }: ListProps) {
  return (
    <NavList {...rest} size={size}>
      {children}
    </NavList>
  );
}

function ListItem({ spacing = 0, children }: ItemProps) {
  return <NavList.Item className={`mb-${spacing}`}>{children}</NavList.Item>;
}

List.Item = ListItem;

export default List;
