import React from 'react';
import { connect } from 'react-redux';
import Snakkebolbe from 'nav-frontend-snakkeboble';

import './sideDialogHistorikk.css';

const SideDialogHistorikk = () => (
  <div className="sideDialogHistorikk">
    <Snakkebolbe dato="26.04.2017 kl. 13:56" pilHoyre ikonClass="snakkeboble__ikon snakkeboble__ikon--behandler">
      OK, da kan du sette bostedsadresse til arbeidsstedet til den er avklart.
    </Snakkebolbe>
    <Snakkebolbe dato="26.04.2017 kl. 13:56" pilVenstre ikonClass="snakkeboble__ikon snakkeboble__ikon--soker">
      Jeg har ikke noen endelig adresse ennå - arbeidsgiver ser etter mulige leiligheter.
    </Snakkebolbe>
    <Snakkebolbe dato="26.04.2017 kl. 13:56" pilHoyre ikonClass="snakkeboble__ikon snakkeboble__ikon--behandler">
      Ser at du har oppgitt bostedsadresse i Norge. Her er det ment bostedsadresse i landet du skal oppholde deg i.
    </Snakkebolbe>
  </div>
);

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(SideDialogHistorikk);
