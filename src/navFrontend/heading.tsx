import { Heading as NavHeading } from "@navikt/ds-react";

type HeadingLevel = "1" | "2" | "3";

type HeadingProps = Omit<React.ComponentProps<typeof NavHeading>, "as"> & {
  as?: React.ElementType;
  level?: HeadingLevel;
};

export const Heading = ({ level = "1", size, children, ...props }: HeadingProps) => {
  const sizeMapping: Record<HeadingLevel, React.ComponentProps<typeof NavHeading>["size"]> = {
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
