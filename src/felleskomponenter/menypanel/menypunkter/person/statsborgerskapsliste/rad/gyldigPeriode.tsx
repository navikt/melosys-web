import React from "react";

import * as Utils from "../../../../../../utils";

interface GyldigPeriodeProps {
  periode: {
    fom: string | undefined | null;
    tom: string | undefined | null;
  };
  erHistorisk: boolean | undefined | null;
}

const GyldigPeriode = ({ periode: { fom, tom }, erHistorisk }: GyldigPeriodeProps) => {
  const fomNorsk = fom ? Utils.dato.formatterDatoTilNorsk(fom) : "";
  const tomNorsk = tom ? Utils.dato.formatterDatoTilNorsk(tom) : "";

  if (erHistorisk) {
    if (fomNorsk || tomNorsk) return <>{`${fomNorsk} - ${tomNorsk}`}</>;
    return <></>;
  }
  return <>{fomNorsk}</>;
};

export default GyldigPeriode;
