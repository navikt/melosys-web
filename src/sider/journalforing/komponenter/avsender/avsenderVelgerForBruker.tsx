import React, { useEffect } from "react";
import { connect, ConnectedProps } from "react-redux";
import { getFormValues } from "redux-form";
import { RootState } from "AppTypes";

import MKV from "../../../../melosyskodeverk";
import * as Skjema from "../../../../felleskomponenter/skjema";
import * as KV from "../../../../kodeverk";

import { useFeatureToggle } from "../../../../featuretoggle";
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

type AvsenderVelgerForBrukerProps = PropsFromRedux & {
  className: string;
  kopierBrukerTilAvsender: () => void;
  tomAvsender: () => void;
  formValues: FormValuesProps;
  settFeltInnhold: (felt: string, innhold: string | null) => void;
  hentOgVisRepresentant: (ident: string) => void;
  journalforingAvsenderID: string;
  journalforingAvsenderNavn: string;
};

const AvsenderVelgerForBruker = ({
  className,
  kopierBrukerTilAvsender,
  tomAvsender,
  formValues,
  settFeltInnhold,
  hentOgVisRepresentant,
}: AvsenderVelgerForBrukerProps) => {
  const behandleAlleSakerToggle = useFeatureToggle("melosys.behandle_alle_saker");
  const avsenderTypeEndret = (avsenderType: string) => {
    if (behandleAlleSakerToggle === "enabled" && avsenderType !== MKV.Koder.avsendertyper.UTENLANDSK_TRYGDEMYNDIGHET) {
      settFeltInnhold("sakstype", null);
      settFeltInnhold("utenlandskTrygdemyndighetLandkode", null);
    }

    switch (avsenderType) {
      case MKV.Koder.avsendertyper.PERSON: {
        kopierBrukerTilAvsender();
        break;
      }
      case KV.AvsenderTyper.FULLMEKTIG:
      case KV.AvsenderTyper.ARBEIDSGIVER:
      case MKV.Koder.avsendertyper.ORGANISASJON:
      case KV.AvsenderTyper.ANNEN:
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
      behandleAlleSakerToggle === "enabled" &&
      KV.erKodeIListe(landkode, MKV.KTObjects.trygdeavtale_myndighetsland) &&
      !KV.erKodeIListe(landkode, MKV.Kodekombinasjoner.landSomErTrygdeavtaleMyndighetslandOgEuEøsLand)
    ) {
      settFeltInnhold("sakstype", MKV.Koder.sakstyper.TRYGDEAVTALE);
    }
    if (
      behandleAlleSakerToggle === "enabled" &&
      KV.erKodeIListe(landkode, MKV.KTObjects.landkoder) &&
      !KV.erKodeIListe(landkode, MKV.Kodekombinasjoner.landSomErTrygdeavtaleMyndighetslandOgEuEøsLand)
    ) {
      settFeltInnhold("sakstype", MKV.Koder.sakstyper.EU_EOS);
    }
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
          <AvsenderArbeidsgiver settFeltInnhold={settFeltInnhold} hentOgVisRepresentant={hentOgVisRepresentant} />
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
        {behandleAlleSakerToggle === "enabled" && (
          <>
            <Skjema.Radio
              feltNavn="avsenderType"
              label="Annen"
              value={KV.AvsenderTyper.ANNEN}
              className="avsendervelger__radio"
            />
            {formValues.avsenderType === KV.AvsenderTyper.ANNEN && (
              <Skjema.Input label="" feltNavn="avsenderNavn" bredde="fullbredde" />
            )}
          </>
        )}
      </Skjema.RadioGruppe>
    </div>
  );
};

export default connect(mapStateToProps)(AvsenderVelgerForBruker);
