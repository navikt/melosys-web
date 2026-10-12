import { ReactNode } from "react";
import "./list.less";
import { Heading, List as NavList, ListProps as NavListProps } from "@navikt/ds-react";

interface ItemProps {
  spacing?: 0 | 2;
  children: ReactNode;
}

interface ListProps extends Omit<NavListProps, "title" | "size"> {
  title?: ReactNode;
  size?: "small" | "medium";
}

function List({ title, size = "small", children, ...rest }: ListProps) {
  return (
    <div className={`legacy-list legacy-list--${size}`}>
      {title && (
        <Heading level="3" size={size === "small" ? "xsmall" : "small"}>
          {title}
        </Heading>
      )}
      <NavList {...rest}>{children}</NavList>
    </div>
  );
}

function ListItem({ spacing = 0, children }: ItemProps) {
  return <NavList.Item className={`mb-${spacing}`}>{children}</NavList.Item>;
}

List.Item = ListItem;

export default List;
