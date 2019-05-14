/* eslint import/prefer-default-export:"off" */
import PT from 'prop-types';
import { ArbeidNorge } from './arbeidNorge';
import { ArbeidUtland } from './arbeidUtland';
import { Kodeverk} from './kodeverk';
import { Periode } from './periode';

const ArbeidsgiversBekreftelse = PT.shape({
  arbeidsgiverBekrefterUtsendelse: PT.bool,
  arbeidsgiverBetalerArbeidsgiveravgift: PT.bool,
  arbeidstakerAnsattUnderUtsendelsen: PT.bool,
  arbeidstakerTidligereUtsendt24Mnd: PT.bool,
  erstatterArbeidstakerenUtsendte: PT.bool,
  trygdeavgiftTrukketGjennomSkatt: PT.bool,
  trygdeavgiftTrukketGjennomSkattDato: PT.string,
});
const ArbeidsinntektPropType = PT.shape({
  inntektErInnrapporteringspliktig: PT.bool,
  inntektNaeringIPerioden: PT.number,
  inntektNaturalytelser: PT.shape({
    friAnnet: PT.string,
    friBil: PT.bool,
    friBolig: PT.bool,
  }),
  inntektNorskIPerioden: PT.number,
  inntektTrygdeavgiftBlirTrukket: PT.bool,
  inntektUtenlandskIPerioden: PT.number,
});
const BostedPropType = PT.shape({
  adresseIUtlandet: PT.bool,
  antallMaanederINorge: PT.number,
  familiesBostedLandkode: PT.string,
  intensjonOmRetur: PT.bool,
});
const ForetakUtlandPropType = PT.arrayOf(PT.shape({
  adresse: PT.shape({
    gatenavn: PT.string,
    husnummer: PT.string,
    postnummer: PT.string,
    poststed: PT.string,
    region: PT.string,
  }),
  navn: PT.string,
  orgnr: PT.string,
}));
const JuridiskArbeidsgiverNorgePropType = PT.shape({
  andelKontrakterINorge: PT.number,
  andelOmsetningINorge: PT.number,
  andelOppdragINorge: PT.number,
  antallAdmAnsatte: PT.number,
  antallAnsatte: PT.number,
  arbeidstakereRekruttertILand: PT.string,
  ekstraArbeidsgivere: PT.arrayOf(PT.string),
  oppdragsKontrakterIHovedsakInngaattILand: PT.string,
  utsendteNeste12Mnd: PT.number,
});
const MaritimtArbeidPropType = PT.arrayOf(PT.shape({
  fartsomradeKode: PT.string,
  flaggLandkode: PT.string,
  installasjonsLandkode: PT.string,
  navn: PT.string,
  territorialfarvann: PT.string,
}));
const OppholdUtlandPropType = PT.shape({
  ektefelleEllerBarnINorge: PT.bool,
  forutgaendeBostedINorge: PT.bool,
  oppholdsPeriode: Periode,
  oppholdslandkoder: PT.arrayOf(PT.string),
  sammeAdresseSomArbeidsgiver: PT.bool,
  studentFinansieringKode: PT.string,
  studentSemester: PT.string,
});
const PersonOpplysningerPropType = PT.shape({
  medfolgendeAndre: PT.string,
  medfolgendeFamilie: PT.arrayOf(PT.string),
  utenlandskIdent: PT.arrayOf(PT.shape({
    ident: PT.string,
    landkode: PT.string,
  })),
});
const SelvstendigArbeidPropType = PT.shape({
  erSelvstendig: PT.bool,
  selvstendigForetak: PT.arrayOf(PT.shape({
    fortsetterEtterArbeidIUtlandet: PT.bool,
    orgnr: PT.string,
  })),
});
const SoeknadslandPropType = PT.shape({
  landkoder: PT.arrayOf(PT.string),
});

const SoknadDokumentPropType = PT.shape({
  arbeidNorge: ArbeidNorge,
  arbeidUtland: ArbeidUtland,
  arbeidsgiversBekreftelse: ArbeidsgiversBekreftelse,
  arbeidsinntekt: ArbeidsinntektPropType,
  bosted: BostedPropType,
  foretakUtland: ForetakUtlandPropType,
  juridiskArbeidsgiverNorge: JuridiskArbeidsgiverNorgePropType,
  maritimtArbeid: MaritimtArbeidPropType,
  oppholdUtland: OppholdUtlandPropType,
  periode: Periode,
  personOpplysninger: PersonOpplysningerPropType,
  selvstendigArbeid: SelvstendigArbeidPropType,
  soeknadsland: SoeknadslandPropType,
});
const GateAdressePropType = PT.shape({
  gatenavn: PT.string,
  gatenummer: PT.string,
  husbokstav: PT.string,
  husnummer: PT.string,
});
const ForretningsAdressePropType = PT.shape({
  gateadresse: GateAdressePropType,
  land: PT.string,
  postnr: PT.string,
  poststed: PT.string,
});
const OrganisasjonerPropType = PT.arrayOf(PT.shape({
  forretningsadresse: ForretningsAdressePropType,
  navn: PT.string,
  oppstartdato: PT.string,
  organisasjonsform: PT.string,
  orgnr: PT.string,
  postadresse: PT.shape({
    gateadresse: GateAdressePropType,
    land: PT.string,
    postnr: PT.string,
    poststed: PT.string,
  }),
}));
const PersonerPropType = PT.arrayOf(PT.shape({
  bostedsadresse: PT.shape({
    gateadresse: GateAdressePropType,
    land: Kodeverk,
    postnr: PT.string,
    poststed: PT.string,
  }),
  fnr: PT.string,
  foedselsdato: PT.string,
  kjoenn: Kodeverk,
  personStatus: Kodeverk,
  sammensattNavn: PT.string,
  sivilstand: Kodeverk,
  statsborgerskap: Kodeverk,
}));

const TilleggsDataPropType = PT.shape({
  organisasjoner: OrganisasjonerPropType,
  personer: PersonerPropType,
});
const SoknadPropType = PT.shape({
  behandlingID: PT.number,
  soeknadDokument: SoknadDokumentPropType,
  tilleggsData: TilleggsDataPropType,
});

export { SoknadPropType as Soknad };
