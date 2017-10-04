import moment from 'moment';

const sortByDateDescending = (adate, bdate) => {
  const amom = moment(adate);
  const bmom = moment(bdate);
  if (amom.isAfter(bmom)) {
    return -1;
  } else if (amom.isSame(bmom)) {
    return 0;
  }
  return 1;
};

function compareAnsettelsesPeriode(a, b) {
  if (a.ansettelsesPeriode.fom && b.ansettelsesPeriode.fom) {
    return sortByDateDescending(
      a.ansettelsesPeriode.fom,
      b.ansettelsesPeriode.fom
    );
  }
  return -1;
}

function sorterArbeidsForholdPaaAnsettelsePeriode(saksopplysninger) {
  saksopplysninger.arbeidsforhold.sort(compareAnsettelsesPeriode);
}

function sorterOrganisasjoner(saksopplysninger) {
  saksopplysninger.organisasjoner.sort((a, b) => {
    if (a.orgnummer > b.orgnummer) {
      return 1;
    } else if (a.orgnummer === b.orgnummer) {
      return 0;
    }
    return -1;
  });
}

export default function sorterSaksopplysninger(saksopplysninger) {
  sorterArbeidsForholdPaaAnsettelsePeriode(saksopplysninger);
  sorterOrganisasjoner(saksopplysninger);
  return saksopplysninger;
}
