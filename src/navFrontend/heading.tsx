import { Heading as NavHeading } from "@navikt/ds-react";

type HeadingLevel = "1" | "2" | "3";
type HeadingSize = "medium" | "small" | "xsmall";

type HeadingProps = React.ComponentProps<typeof NavHeading> & {
  level: HeadingLevel;
  size?: HeadingSize;
  children: React.ReactNode;
};

export const Heading = ({ level, size, children, ...props }: HeadingProps) => {
  const sizeMapping: Record<HeadingLevel, HeadingSize> = {
    "1": "medium",
    "2": "small",
    "3": "xsmall",
  };

  return (
    <NavHeading level={level} size={size || sizeMapping[level]} {...props}>
      {children}
    </NavHeading>
  );
};
