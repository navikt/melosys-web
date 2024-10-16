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

export const MelList = ({ title, size = "small", children }: MelListProps) => {
  return (
    <List title={title} size={size}>
      {children}
    </List>
  );
};

export const MelListItem = ({ text, spacing = 2, children }: MelListItemProps) => {
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
