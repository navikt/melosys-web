import { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { getFormValues } from "redux-form";
import { RootState } from "AppTypes";

import MKV from "../../../../melosyskodeverk";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as Nav from "../../../../navFrontend";
import * as KV from "../../../../kodeverk";

import { AvsenderUtenlandskTrygdemyndighet, AvsenderAnnenPersonEllerVirksomhet } from "./index";

import "./avsender.css";

const mapStateToProps = (state: RootState) => ({
  formValues: getFormValues(KV.Form.JOURNALFORING)(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type FormValuesProps = {
  avsenderID?: string;
  avsenderType?: string;
  utenlandskTrygdemyndighetLandkode?: string;
};

type AvsenderVelgerForBrukerProps = PropsFromRedux & {
  kopierBrukerTilAvsender: () => void;
  tomAvsender: () => void;
  formValues: FormValuesProps;
  settFeltInnhold: (felt: string, innhold: any) => void;
  hentOgVisAvsender: (ident: string) => void;
};

const AvsenderVelgerForBruker = ({
  kopierBrukerTilAvsender,
  tomAvsender,
  formValues,
  settFeltInnhold,
  hentOgVisAvsender,
}: AvsenderVelgerForBrukerProps) => {
  const avsenderTypeEndret = (avsenderType: string) => {
    if (avsenderType !== MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET) {
      settFeltInnhold("sakstype", null);
      settFeltInnhold("utenlandskTrygdemyndighetLandkode", null);
    }
    switch (avsenderType) {
      case MKV.Koder.avsendertyper.PERSON: {
        kopierBrukerTilAvsender();
        break;
      }
      case KV.AvsenderTyper.ANNEN_PERSON_ELLER_VIRKSOMHET:
      case MKV.Koder.avsendertyper.ORGANISASJON:
      case KV.AvsenderTyper.FRITEKST:
      case MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET: {
        tomAvsender();
        break;
      }
      default:
        throw new Error("Ukjent avsenderType");
    }
  };

  useEffect(() => {
    if (formValues.avsenderType) avsenderTypeEndret(formValues.avsenderType);
  }, [formValues.avsenderType]);

  const fullmektigLandEndret = (landkode: string) => {
    const avsenderNavn = landkode
      ? `Trygdemyndighet i ${KV.kodeTilTerm(landkode, MKV.Kodekombinasjoner.unikeAvtaleland)}`
      : null;

    settFeltInnhold("avsenderID", landkode);
    settFeltInnhold("avsenderNavn", avsenderNavn);
    if (
      KV.erKodeIListe(landkode, MKV.KTObjects.trygdeavtale_myndighetsland) &&
      !KV.erKodeIListe(landkode, MKV.Kodekombinasjoner.landSomErTrygdeavtaleMyndighetslandOgEuEøsLand)
    ) {
      settFeltInnhold("sakstype", MKV.Koder.sakstyper.TRYGDEAVTALE);
    }
    if (
      KV.erKodeIListe(landkode, MKV.KTObjects.landkoder) &&
      !KV.erKodeIListe(landkode, MKV.Kodekombinasjoner.landSomErTrygdeavtaleMyndighetslandOgEuEøsLand)
    ) {
      settFeltInnhold("sakstype", MKV.Koder.sakstyper.EU_EOS);
    }
  };

  return (
    <div>
      <Skjema.RadioGroup legend="Hvem er avsender?" name="avsenderType" size="medium">
        <Nav.Radio value={MKV.Koder.avsendertyper.PERSON}>Bruker</Nav.Radio>
        <Nav.Radio value={KV.AvsenderTyper.ANNEN_PERSON_ELLER_VIRKSOMHET}>Annen person eller virksomhet</Nav.Radio>
        {formValues.avsenderType === KV.AvsenderTyper.ANNEN_PERSON_ELLER_VIRKSOMHET && (
          <AvsenderAnnenPersonEllerVirksomhet hentOgVisAvsender={hentOgVisAvsender} />
        )}
        <Nav.Radio value={MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET}>Utenlandsk trygdemyndighet</Nav.Radio>
        {formValues.avsenderType === MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET && (
          <AvsenderUtenlandskTrygdemyndighet
            utenlandskTrygdemyndighetLandkode={formValues.utenlandskTrygdemyndighetLandkode}
            fullmektigLandEndret={fullmektigLandEndret}
          />
        )}
        <Nav.Radio value={KV.AvsenderTyper.FRITEKST}>Fritekst</Nav.Radio>
        {formValues.avsenderType === KV.AvsenderTyper.FRITEKST && <Skjema.Input label="" feltNavn="avsenderNavn" />}
      </Skjema.RadioGroup>
    </div>
  );
};

export default connect(mapStateToProps)(AvsenderVelgerForBruker);
