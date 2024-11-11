import { Loader as NavLoader, LoaderProps } from "@navikt/ds-react";

const Loader = ({ size = "large", ...rest }: LoaderProps) => {
  return <NavLoader {...rest} size={size} />;
};

export default Loader;
