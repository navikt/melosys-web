import { Tag as NavTag, TagProps } from "@navikt/ds-react";

const Tag = (props: TagProps) => {
  const { size, children, ...rest } = props;
  return (
    <NavTag {...rest} size={size || "small"}>
      {children}
    </NavTag>
  );
};

export default Tag;
