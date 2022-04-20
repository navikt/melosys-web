import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { getFormValues } from "redux-form";
import { RootState } from "AppTypes";

import MKV from "../../../../melosyskodeverk";

import * as Skjema from "../../../../felleskomponenter/skjema";
import * as KV from "../../../../kodeverk";
import { journalforingSelectors } from "../../../../ducks/journalforing";
import { AvsenderArbeidsgiver, AvsenderUtenlandskTrygdemyndighet, AvsenderFullmektig } from "./index";

import "./avsender.css";

const mapStateToProps = (state: RootState) => ({
  formValues: getFormValues(KV.Form.JOURNALFORING)(state),
  journalforingAvsenderID: journalforingSelectors.AvsenderIDSelector(state),
  journalforingAvsenderNavn: journalforingSelectors.AvsenderNavnSelector(state),
});

const connector = connect(mapStateToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

type FormValuesProps = {
  avsenderID?: string;
  avsenderType?: string;
  utenlandskTrygdemyndighetLandkode?: string;
};

type AvsenderVelgerProps = PropsFromRedux & {
  className: string;
  kopierBrukerTilAvsender: () => void;
  tomAvsender: () => void;
  formValues: FormValuesProps;
  settFeltInnhold: (felt: string, innhold: string) => void;
  visAvsenderSpinner: boolean;
  hentOgVisRepresentant: (ident: string) => void;
  journalforingAvsenderID: string;
  journalforingAvsenderNavn: string;
};

const AvsenderVelger = ({
  className,
  kopierBrukerTilAvsender,
  tomAvsender,
  formValues,
  settFeltInnhold,
  hentOgVisRepresentant,
}: AvsenderVelgerProps) => {
  const avsenderTypeEndret = (avsenderType: string) => {
    switch (avsenderType) {
      case MKV.Koder.avsendertyper.PERSON: {
        kopierBrukerTilAvsender();
        break;
      }
      case KV.AvsenderTyper.ANNET:
      case KV.AvsenderTyper.FULLMEKTIG:
      case KV.AvsenderTyper.ARBEIDSGIVER:
      case KV.AvsenderTyper.ARBEIDSGIVER_FULLMEKTIG:
      case MKV.Koder.avsendertyper.ORGANISASJON:
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

  const fullmektigLandEndret = (landkode = "") => {
    const avsenderNavn = landkode ? `Trygdemyndighet i ${KV.kodeTilTerm(landkode, MKV.KTObjects.landkoder)}` : "";

    settFeltInnhold("avsenderID", landkode);
    settFeltInnhold("avsenderNavn", avsenderNavn);
  };

  return (
    <div className={className}>
      <Skjema.RadioGruppe feltNavn="avsenderType" label="Hvem er avsender?">
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Bruker"
          value={MKV.Koder.avsendertyper.PERSON}
          className="avsendervelger__radio"
        />
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Fullmektig"
          value={KV.AvsenderTyper.FULLMEKTIG}
          className="avsendervelger__radio"
        />
        {formValues.avsenderType === KV.AvsenderTyper.FULLMEKTIG && (
          <AvsenderFullmektig
            avsenderID={formValues.avsenderID}
            settFeltInnhold={settFeltInnhold}
            hentOgVisRepresentant={hentOgVisRepresentant}
          />
        )}
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Arbeidsgiver"
          value={KV.AvsenderTyper.ARBEIDSGIVER}
          className="avsendervelger__radio"
        />
        {formValues.avsenderType === KV.AvsenderTyper.ARBEIDSGIVER && (
          <AvsenderArbeidsgiver
            avsenderID={formValues.avsenderID}
            avsenderType={formValues.avsenderType}
            settFeltInnhold={settFeltInnhold}
            hentOgVisRepresentant={hentOgVisRepresentant}
          />
        )}
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Arbeidsgiver som er fullmektig"
          value={KV.AvsenderTyper.ARBEIDSGIVER_FULLMEKTIG}
          className="avsendervelger__radio"
        />
        {formValues.avsenderType === KV.AvsenderTyper.ARBEIDSGIVER_FULLMEKTIG && (
          <AvsenderArbeidsgiver
            avsenderID={formValues.avsenderID}
            avsenderType={formValues.avsenderType}
            settFeltInnhold={settFeltInnhold}
            hentOgVisRepresentant={hentOgVisRepresentant}
          />
        )}
        <Skjema.Radio
          feltNavn="avsenderType"
          label="Utenlandsk trygdemyndighet"
          value={MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET}
          className="avsendervelger__radio"
        />
        {formValues.avsenderType === MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET && (
          <AvsenderUtenlandskTrygdemyndighet
            utenlandskTrygdemyndighetLandkode={formValues.utenlandskTrygdemyndighetLandkode}
            fullmektigLandEndret={fullmektigLandEndret}
          />
        )}
      </Skjema.RadioGruppe>
    </div>
  );
};

export default connect(mapStateToProps)(AvsenderVelger);
