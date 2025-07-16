import { yupResolver } from "@hookform/resolvers/yup";
import { use, useCallback, useEffect, useState } from "react";
import { FieldValue, useFieldArray, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import * as Mui from "../../../../../felleskomponenter/ui";
import * as Nav from "../../../../../navFrontend";
import * as Api from "../../../../../services/api";
import * as Utils from "../../../../../utils";

import { behandlingerSelectors } from "../../../../../ducks/behandlinger";
import { medlemskapsperioderSelectors } from "../../../../../ducks/medlemskapsperioder";
import { helseutgiftDekkesPeriodeSelector } from "../../../../../ducks/helseutgiftdekkesperiode";

import { redigerbartSelectors } from "../../../../../ducks/redigerbart";
import { useAsyncCallbackState } from "../../../../../hooks";
import { STATUS } from "../../../../../services";

import { BOOLSK_STRING } from "../../../../../constants";
import LabelMedHjelpetekst from "../../../../../felleskomponenter/labelMedHjelpetekst";
import { Inntektskilder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/inntektskilder";
import {
  Feilmelding,
  feilMeldingBlokkerer,
  finnAktivFeilmelding,
} from "../../../../../felleskomponenter/trygdeavgift/komponenter/meldinger";
import { Skatteforholdsperioder } from "../../../../../felleskomponenter/trygdeavgift/komponenter/skatteforholdsperioder";
import TrygdeavgiftsperioderTabell from "../../../../../felleskomponenter/trygdeavgift/komponenter/trygdeavgiftsperioderTabell";
import {
  FormValuesProps,
  Inntektskilde,
  Skatteforhold,
} from "../../../../../felleskomponenter/trygdeavgift/komponenter/types";
import MKV from "../../../../../melosyskodeverk";
import { BeregnetTrygdeavgift, TrygdeavgiftsgrunnlagDto } from "../../../../../services/modules/trygdeavgift";
// import "./vurderingTrygdeavgift.css";
// import vurderingTrygdeavgiftSchema from "./vurderingTrygdeavgiftSchema";

import { erBrukerSkattepliktigIHelePerioden } from "../../../../aarsavregning/stegKomponenter/vurderingAarsavregning/utils";
import { fagsakSelectors } from "../../../../../ducks/fagsaker";

interface Props {
  bekreft: () => void;
  tilbake: () => void;
  aktivtSteg: boolean;
  oppdaterStatus: (isValid: boolean) => void;
}

export function VurderingTrygdeavgift({ bekreft, tilbake, aktivtSteg, oppdaterStatus }: Props) {
  return (
    <div className="vurderingTrygdeavgift">
      <Nav.Heading level="1" className="stegvelgertittel">
        Trygdeavgift
      </Nav.Heading>
    </div>
  );
}
