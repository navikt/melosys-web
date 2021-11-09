import React, { ComponentProps } from "react";

import * as Nav from "../../../../../../navFrontend";

interface InformasjonsmodalProps {
  onRequestClose: ComponentProps<typeof Nav.Modal>["onRequestClose"];
  contentLabel: ComponentProps<typeof Nav.Modal>["contentLabel"];
}

const Informasjonsmodal = ({ onRequestClose, contentLabel }: InformasjonsmodalProps) => {
  return (
    <Nav.Modal contentLabel={contentLabel} isOpen shouldCloseOnOverlayClick closeButton onRequestClose={onRequestClose}>
      Ikke implementert.
    </Nav.Modal>
  );
};

export default Informasjonsmodal;
