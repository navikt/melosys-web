import { List } from "@navikt/ds-react";
import { ReactNode } from "react";
import "./melList.css";

interface MelListProps {
  title: string;
  size?: "small" | "medium";
  children: ReactNode;
}

interface MelListItemProps {
  text: string;
  spacing?: number;
  children?: ReactNode;
}

const MelList = ({ title, size = "small", children }: MelListProps) => {
  return (
    <List title={title} size={size}>
      {children}
    </List>
  );
};

const MelListItem = ({ text, spacing = 2, children }: MelListItemProps) => {
  return (
    <List.Item className={`mb-${spacing}`}>
      {text}
      {children}
    </List.Item>
  );
};
MelList.MelItem = MelListItem;

export default MelList;
