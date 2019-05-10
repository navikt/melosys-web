export const lagLovvalgsbestemmelse = felt => (
  {
    felt: 'lovvalgsbestemmelse',
    oppdaterRedux: true,
    type: 'lovvalgsbestemmelse',
    innhold: felt,
  }
);

export const konverterLovvalgsbestemmelseTilStegData = lovvalgsbestemmelse => (
  {
    felt: 'lovvalgsbestemmelse',
    type: 'lovvalgsbestemmelse',
    innhold: lovvalgsbestemmelse,
  }
);
