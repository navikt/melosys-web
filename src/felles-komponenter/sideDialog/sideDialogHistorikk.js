import React from 'react';
import { connect } from 'react-redux';
import Snakkebolbe from 'nav-frontend-snakkeboble';

import './sideDialogHistorikk.css';

const uuid = require('uuid/v4');

const mockDialogObjekt = [
  { dato: '26.04.2017 kl. 13:56', tekst: 'OK, da kan du sette bostedsadresse til arbeidsstedet til den er avklart.', avsender: 'behandler' },
  { dato: '26.04.2017 kl. 13:56', tekst: 'Jeg har ikke noen endelig adresse ennå - arbeidsgiver ser etter mulige leiligheter.', avsender: 'soker' },
  { dato: '26.04.2017 kl. 13:56', tekst: 'Ser at du har oppgitt bostedsadresse i Norge. Her er det ment bostedsadresse i landet du skal oppholde deg i.', avsender: 'behandler' },
];

const SideDialogHistorikk = () => (
  <div className="sideDialogHistorikk">
    { mockDialogObjekt.map(item => (
      <Snakkebolbe
        ikonClass={`snakkeboble__ikon snakkeboble__ikon--${item.avsender}`}
        dato={item.dato}
        pilHoyre={item.avsender === 'behandler'}
        pilVenstre={item.avsender === 'soker'}
        key={uuid()}>{item.tekst}</Snakkebolbe>))
    }
  </div>
);

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SideDialogHistorikk);
