import { ConfirmationPanel as NavConfirmationPanel, ConfirmationPanelProps } from "@navikt/ds-react";

const ConfirmationPanel = ({ size = "small", children, ...rest }: ConfirmationPanelProps) => {
  return (
    <NavConfirmationPanel {...rest} size={size}>
      {children}
    </NavConfirmationPanel>
  );
};

export default ConfirmationPanel;
