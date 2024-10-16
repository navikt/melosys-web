import { List } from "@navikt/ds-react";
import { ReactNode } from "react";

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
    <List title={title} size={size} className="melosys-list">
      {children}
    </List>
  );
};

const MelListItem = ({ text, spacing = 0, children }: MelListItemProps) => {
  const margin = {
    marginBlockEnd: `var(--a-spacing-${spacing})`,
  };

  return (
    <List.Item style={margin}>
      {text}
      {children}
    </List.Item>
  );
};
MelList.MelItem = MelListItem;

export default MelList;
