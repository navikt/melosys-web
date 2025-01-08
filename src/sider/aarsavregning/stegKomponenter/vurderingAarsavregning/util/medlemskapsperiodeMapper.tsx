import * as Api from "../../../../../services/api";
import { MedlemskapsperiodeProp } from "../../../../ftrl/saksbehandling/stegKomponenter/vurderingPeriode/komponenter/types";
import * as Utils from "../../../../../utils";

const mapTilMedlemskapsperiodeProps = (
  medlemskapsperiode: Api.MedlemAvFolketrygden.Medlemskapsperioder.Medlemskapsperiode,
): MedlemskapsperiodeProp => ({
  ...medlemskapsperiode,
  fomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.fomDato),
  tomDato: Utils.dato.formatterDatoTilNorsk(medlemskapsperiode.tomDato),
  ny: false,
  feil: undefined,
  periodeId: medlemskapsperiode.id,
});

export { mapTilMedlemskapsperiodeProps };
