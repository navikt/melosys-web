import { ConfirmationPanel as NavConfirmationPanel, ConfirmationPanelProps } from "@navikt/ds-react";

function ConfirmationPanel({ size = "small", children, ...rest }: ConfirmationPanelProps) {
  return (
    <NavConfirmationPanel {...rest} size={size}>
      {children}
    </NavConfirmationPanel>
  );
}

export default ConfirmationPanel;
