import { object, string } from "yup";

const TYPE_MANGLER = { melding: "Velg type brev" };
const VALGT_MAL_MANGLER = { melding: "Finner ikke mal tilhørende type brev" };
const MOTTAKER_MANGLER = { melding: "Velg mottaker" };
const ARBEIDSGIVER_MANGLER = { melding: "Velg arbeidsgiver" };
const FELT_MANGLER = { melding: "Fyll ut alle felter" };
const ORGNUMMER_FELT_MANGLER = { melding: "Fyll ut organisasjonsnummer" };
const ORGNUMMER_UGYLDIG = { melding: "Ugyldig organisasjonsnummer" };
const TITTEL_MANGLER = { melding: "Fyll inn tittel" };

const manglerFeltVerdi = (felt) => {
  if (felt && !felt.valg) {
    // htmlEditor har defaultverdi <p></p> når feltet er tomt.
    return felt.feltVerdi?.replace("<p></p>", "").trim();
  }
  return felt;
};

const manglerNoenFeltValgt = (felt, valgtMal) => {
  if (!valgtMal) return true;
  if (!valgtMal?.felter) return false;
  if (!felt) return true;
  for (let i = 0; i < valgtMal.felter.length; i += 1) {
    if (valgtMal.felter[i]?.paakrevd && !manglerFeltVerdi(felt[valgtMal.felter[i]?.kode])) return true;
  }
  return false;
};

const manglerFeltMedValg = (feltNavn) => (felt, valgtMal) => {
  const feltFraValgtMal = valgtMal?.felter?.find((valgtMalFelt) => valgtMalFelt.kode === feltNavn);
  if (!feltFraValgtMal) {
    return false;
  }
  const valgtAlternativ = feltFraValgtMal?.valg?.valgAlternativer.find(
    (alternativ) => alternativ.beskrivelse === felt?.[feltNavn]?.valg
  );
  return valgtAlternativ && !valgtAlternativ.visFelt ? false : !felt?.[feltNavn]?.feltVerdi;
};

const stemmerMottakerMedParameterne = (valgtMal, mottakerUuid, rolle, orgNrSettesAvSaksbehandler) => {
  if (!valgtMal || !mottakerUuid) return false;
  const mottaker = valgtMal.muligeMottakere.find((muligMottaker) => muligMottaker.uuid === mottakerUuid);
  return mottaker && mottaker.rolle === rolle && mottaker.orgnrSettesAvSaksbehandler === orgNrSettesAvSaksbehandler;
};

const send_brev = object().shape({
  type: string().required(TYPE_MANGLER),
  valgtMal: object().required(VALGT_MAL_MANGLER),
  mottaker: string().required(MOTTAKER_MANGLER),
  organisasjonsnummer: string().when(["valgtMal", "mottaker"], {
    is: (valgtMal, mottaker) => stemmerMottakerMedParameterne(valgtMal, mottaker, "ARBEIDSGIVER", true),
    then: string().erOrgnr(ORGNUMMER_UGYLDIG).required(ORGNUMMER_FELT_MANGLER),
  }),
  kontaktperson: string().nullable(),
  arbeidsgiver: string().when(["valgtMal", "mottaker"], {
    is: (valgtMal, mottaker) => stemmerMottakerMedParameterne(valgtMal, mottaker, "ARBEIDSGIVER", false),
    then: string().required(ARBEIDSGIVER_MANGLER),
  }),
  felt: object(),
  fritekstTittel: string().when(["felt", "valgtMal"], {
    is: manglerFeltMedValg("BREV_TITTEL"),
    then: string().required(TITTEL_MANGLER),
  }),
  erFeltGyldig: string().when(["felt", "valgtMal"], {
    is: manglerNoenFeltValgt,
    then: string().required(FELT_MANGLER),
  }),
});

export default send_brev;
