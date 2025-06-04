import React, { useState } from "react";
import * as Nav from "../../../../../navFrontend";
import { AarsavregningResponse } from "../../../../../services/modules/aarsavregning/aarsavregning";
import * as Utils from "../../../../../utils";
import "./aarsavregningssammendrag.css";

interface AarsavregningssammendragProps {
  aarsavregningResponse: AarsavregningResponse;
  harGrunnlagIMelosys?: boolean;
}

export function Aarsavregningssammendrag({
  aarsavregningResponse,
  harGrunnlagIMelosys = false,
}: AarsavregningssammendragProps) {
  const [isDetailed, setIsDetailed] = useState(false);

  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null) return "0 kr";
    return `${Utils.formaterTilNorskBelop(amount, 0)} kr`;
  };

  const getAmountClass = (amount: number | undefined | null): string => {
    if (amount === undefined || amount === null || amount === 0) return "";
    return amount > 0 ? "positive-amount" : "negative-amount";
  };

  // Determine what type of settlement this is
  const harTidligereGrunnlag = !!aarsavregningResponse.tidligereGrunnlagsopplysninger;
  const harNyttGrunnlag = !!aarsavregningResponse.nyttGrunnlag;
  const harKunAvgiftssystemData = !harTidligereGrunnlag && !harNyttGrunnlag;

  // Detect if previous grunnlag is from årsavregning (vs førstegangsbehandling)
  const erForrigeÅrsavregning =
    !!aarsavregningResponse.tidligereGrunnlagsopplysninger?.tidligereÅrsavregningFakturertBeloepAvgiftssystem;

  // Extract amounts for calculation - following backend logic exactly
  const manueltAvgiftBeloep = aarsavregningResponse.avregning?.manueltAvgiftBeloep || 0;
  const beregnetAvgift = aarsavregningResponse.nyttGrunnlag?.avgift.totalAvgift || 0;
  const currentAvgift = manueltAvgiftBeloep || beregnetAvgift; // Backend: manueltAvgiftBeloep != null ? manueltAvgiftBeloep : beregnetAvgiftBelop

  const tidligereBeregnetAvgift = aarsavregningResponse.tidligereGrunnlagsopplysninger?.avgift.totalAvgift || 0;
  const tidligereFakturert = aarsavregningResponse.avregning?.tidligereFakturertBeloep || 0;
  const tidligereFakturertAvgiftssystem = aarsavregningResponse.avregning?.tidligereFakturertBeloepAvgiftssystem || 0;
  const tidligereÅrsavregningAvgiftssystem =
    aarsavregningResponse.tidligereGrunnlagsopplysninger?.tidligereÅrsavregningFakturertBeloepAvgiftssystem || 0;
  const tidligereTilFakturering = aarsavregningResponse.tidligereGrunnlagsopplysninger?.tilFaktureringBeloep || 0;
  const tilFakturering = aarsavregningResponse.avregning?.tilFaktureringBeloep || 0;

  const renderCompactView = () => {
    if (harKunAvgiftssystemData) {
      return (
        <>
          <Nav.Table className="compact-table summary-table">
            <Nav.Table.Body>
              <Nav.Table.Row>
                <Nav.Table.DataCell className="label-cell">Tidligere fakturert i Avgiftssystemet:</Nav.Table.DataCell>
                <Nav.Table.DataCell className={`amount-cell ${getAmountClass(tidligereFakturertAvgiftssystem)}`}>
                  {formatCurrency(tidligereFakturertAvgiftssystem)}
                </Nav.Table.DataCell>
              </Nav.Table.Row>
              <Nav.Table.Row className="final-difference-row">
                <Nav.Table.DataCell className="label-cell">
                  <strong>Til fakturering:</strong>
                </Nav.Table.DataCell>
                <Nav.Table.DataCell className={`amount-cell ${getAmountClass(tilFakturering)}`}>
                  <strong>{formatCurrency(tilFakturering)}</strong>
                </Nav.Table.DataCell>
              </Nav.Table.Row>
            </Nav.Table.Body>
          </Nav.Table>
          {tilFakturering !== 0 && (
            <Nav.Alert variant={tilFakturering > 0 ? "warning" : "info"} className="compact-alert billing-alert">
              {tilFakturering > 0
                ? `Bruker skal faktureres ${formatCurrency(tilFakturering)} tillegg`
                : `Bruker skal refunderes ${formatCurrency(Math.abs(tilFakturering))}`}
            </Nav.Alert>
          )}
        </>
      );
    }

    return (
      <>
        <Nav.Table className="compact-table summary-table">
          <Nav.Table.Body>
            {(harNyttGrunnlag || manueltAvgiftBeloep) && (
              <Nav.Table.Row>
                <Nav.Table.DataCell className="label-cell">
                  {manueltAvgiftBeloep ? "Manuell endelig avgift:" : "Ny beregnet avgift:"}
                </Nav.Table.DataCell>
                <Nav.Table.DataCell className={`amount-cell ${getAmountClass(currentAvgift)}`}>
                  {formatCurrency(currentAvgift)}
                </Nav.Table.DataCell>
              </Nav.Table.Row>
            )}
            {tidligereFakturert !== 0 && (
              <Nav.Table.Row>
                <Nav.Table.DataCell className="label-cell operator-cell">
                  <span className="operator">−</span>Tidligere fakturert:
                </Nav.Table.DataCell>
                <Nav.Table.DataCell className={`amount-cell ${getAmountClass(tidligereFakturert)}`}>
                  {formatCurrency(tidligereFakturert)}
                </Nav.Table.DataCell>
              </Nav.Table.Row>
            )}
            {tidligereFakturertAvgiftssystem !== 0 && (
              <Nav.Table.Row>
                <Nav.Table.DataCell className="label-cell operator-cell">
                  <span className="operator">−</span>
                  Avgiftssystem (inneværende):
                </Nav.Table.DataCell>
                <Nav.Table.DataCell className={`amount-cell ${getAmountClass(tidligereFakturertAvgiftssystem)}`}>
                  {formatCurrency(tidligereFakturertAvgiftssystem)}
                </Nav.Table.DataCell>
              </Nav.Table.Row>
            )}
            {tidligereÅrsavregningAvgiftssystem !== 0 && (
              <Nav.Table.Row>
                <Nav.Table.DataCell className="label-cell operator-cell">
                  <span className="operator">+</span>
                  Avgiftssystem (forrige registrert):
                </Nav.Table.DataCell>
                <Nav.Table.DataCell className={`amount-cell ${getAmountClass(tidligereÅrsavregningAvgiftssystem)}`}>
                  {formatCurrency(tidligereÅrsavregningAvgiftssystem)}
                </Nav.Table.DataCell>
              </Nav.Table.Row>
            )}
            <Nav.Table.Row className="final-difference-row">
              <Nav.Table.DataCell className="label-cell">
                <strong>Til fakturering:</strong>
              </Nav.Table.DataCell>
              <Nav.Table.DataCell className={`amount-cell ${getAmountClass(tilFakturering)}`}>
                <strong>{formatCurrency(tilFakturering)}</strong>
              </Nav.Table.DataCell>
            </Nav.Table.Row>
          </Nav.Table.Body>
        </Nav.Table>
        {tilFakturering !== 0 && (
          <Nav.Alert variant={tilFakturering > 0 ? "warning" : "info"} className="compact-alert billing-alert">
            {tilFakturering > 0
              ? `Bruker skal faktureres ${formatCurrency(tilFakturering)} tillegg`
              : `Bruker skal refunderes ${formatCurrency(Math.abs(tilFakturering))}`}
          </Nav.Alert>
        )}
        {tidligereÅrsavregningAvgiftssystem !== 0 && (
          <Nav.Alert variant="info" className="compact-alert correction-info-alert">
            <strong>Avgiftssystem korreksjon:</strong> Forrige årsavregning registrerte{" "}
            {formatCurrency(tidligereÅrsavregningAvgiftssystem)} fra avgiftssystemet, denne årsavregningen registrerer{" "}
            {formatCurrency(tidligereFakturertAvgiftssystem)}. Differanse på{" "}
            {formatCurrency(Math.abs(tidligereÅrsavregningAvgiftssystem - tidligereFakturertAvgiftssystem))}
            {tidligereÅrsavregningAvgiftssystem > tidligereFakturertAvgiftssystem ? "refunderes" : "tilleggsfaktureres"}
            for å korrigere registreringen.
          </Nav.Alert>
        )}
      </>
    );
  };

  const renderDetailedView = () => {
    if (harKunAvgiftssystemData) {
      return (
        <div className="final-calculation-section">
          <Nav.Heading level="3" size="small" className="section-title">
            Avgiftssystem avregning
          </Nav.Heading>
          <Nav.Table className="calculation-table summary-table">
            <Nav.Table.Body>
              <Nav.Table.Row className="info-row">
                <Nav.Table.DataCell className="label-cell">Tidligere fakturert i Avgiftssystemet:</Nav.Table.DataCell>
                <Nav.Table.DataCell className="amount-cell">
                  {formatCurrency(tidligereFakturertAvgiftssystem)}
                </Nav.Table.DataCell>
              </Nav.Table.Row>
              <Nav.Table.Row className="final-difference-row">
                <Nav.Table.DataCell className="label-cell">
                  <strong>Til fakturering:</strong>
                </Nav.Table.DataCell>
                <Nav.Table.DataCell className={`amount-cell ${getAmountClass(tilFakturering)}`}>
                  <strong>{formatCurrency(tilFakturering)}</strong>
                </Nav.Table.DataCell>
              </Nav.Table.Row>
            </Nav.Table.Body>
          </Nav.Table>
          {tilFakturering !== 0 && (
            <Nav.Alert variant={tilFakturering > 0 ? "warning" : "info"} className="billing-alert">
              {tilFakturering > 0
                ? `Bruker skal faktureres ${formatCurrency(tilFakturering)} tillegg`
                : `Bruker skal refunderes ${formatCurrency(Math.abs(tilFakturering))}`}
            </Nav.Alert>
          )}
        </div>
      );
    }

    return (
      <>
        {harTidligereGrunnlag && (
          <div className="previous-settlement-section">
            <Nav.Heading level="3" size="small" className="section-title">
              {erForrigeÅrsavregning ? "Forrige årsavregning" : "Tidligere grunnlag (førstegangsbehandling)"}
            </Nav.Heading>
            <Nav.Table className="summary-table">
              <Nav.Table.Body>
                <Nav.Table.Row>
                  <Nav.Table.DataCell className="label-cell">Beregnet avgift:</Nav.Table.DataCell>
                  <Nav.Table.DataCell className={`amount-cell ${getAmountClass(tidligereBeregnetAvgift)}`}>
                    {formatCurrency(tidligereBeregnetAvgift)}
                  </Nav.Table.DataCell>
                </Nav.Table.Row>
                {tidligereÅrsavregningAvgiftssystem !== 0 && (
                  <Nav.Table.Row>
                    <Nav.Table.DataCell className="label-cell">Avgiftssystem (oppgitt):</Nav.Table.DataCell>
                    <Nav.Table.DataCell className={`amount-cell ${getAmountClass(tidligereÅrsavregningAvgiftssystem)}`}>
                      {formatCurrency(tidligereÅrsavregningAvgiftssystem)}
                    </Nav.Table.DataCell>
                  </Nav.Table.Row>
                )}
                {erForrigeÅrsavregning && (
                  <Nav.Table.Row>
                    <Nav.Table.DataCell className="label-cell">Resultat (til fakturering):</Nav.Table.DataCell>
                    <Nav.Table.DataCell className={`amount-cell ${getAmountClass(tidligereTilFakturering)}`}>
                      {formatCurrency(tidligereTilFakturering)}
                    </Nav.Table.DataCell>
                  </Nav.Table.Row>
                )}
              </Nav.Table.Body>
            </Nav.Table>
          </div>
        )}

        {harNyttGrunnlag && (
          <div className="current-settlement-section">
            <Nav.Heading level="3" size="small" className="section-title">
              Nytt grunnlag (årsavregning)
            </Nav.Heading>
            <Nav.Table className="summary-table">
              <Nav.Table.Body>
                <Nav.Table.Row>
                  <Nav.Table.DataCell className="label-cell">
                    {manueltAvgiftBeloep ? "Manuell endelig avgift:" : "Beregnet avgift:"}
                  </Nav.Table.DataCell>
                  <Nav.Table.DataCell className={`amount-cell ${getAmountClass(currentAvgift)}`}>
                    {formatCurrency(currentAvgift)}
                  </Nav.Table.DataCell>
                </Nav.Table.Row>
                {tidligereFakturertAvgiftssystem !== 0 && (
                  <Nav.Table.Row>
                    <Nav.Table.DataCell className="label-cell">Avgiftssystem (oppgitt):</Nav.Table.DataCell>
                    <Nav.Table.DataCell className={`amount-cell ${getAmountClass(tidligereFakturertAvgiftssystem)}`}>
                      {formatCurrency(tidligereFakturertAvgiftssystem)}
                    </Nav.Table.DataCell>
                  </Nav.Table.Row>
                )}
              </Nav.Table.Body>
            </Nav.Table>
          </div>
        )}

        <div className="final-calculation-section">
          <Nav.Heading level="3" size="small" className="section-title">
            Beregning til fakturering
          </Nav.Heading>
          <Nav.Table className="calculation-table summary-table">
            <Nav.Table.Body>
              {(harNyttGrunnlag || manueltAvgiftBeloep) && (
                <Nav.Table.Row>
                  <Nav.Table.DataCell className="label-cell">
                    {manueltAvgiftBeloep ? "Manuell endelig avgift:" : "Ny beregnet avgift:"}
                  </Nav.Table.DataCell>
                  <Nav.Table.DataCell className={`amount-cell ${getAmountClass(currentAvgift)}`}>
                    {formatCurrency(currentAvgift)}
                  </Nav.Table.DataCell>
                </Nav.Table.Row>
              )}
              {tidligereFakturert !== 0 && (
                <Nav.Table.Row>
                  <Nav.Table.DataCell className="label-cell operator-cell">
                    <span className="operator">−</span>Tidligere fakturert:
                  </Nav.Table.DataCell>
                  <Nav.Table.DataCell className={`amount-cell ${getAmountClass(tidligereFakturert)}`}>
                    {formatCurrency(tidligereFakturert)}
                  </Nav.Table.DataCell>
                </Nav.Table.Row>
              )}
              {tidligereFakturertAvgiftssystem !== 0 && (
                <Nav.Table.Row>
                  <Nav.Table.DataCell className="label-cell operator-cell">
                    <span className="operator">−</span>
                    Avgiftssystem (inneværende):
                  </Nav.Table.DataCell>
                  <Nav.Table.DataCell className={`amount-cell ${getAmountClass(tidligereFakturertAvgiftssystem)}`}>
                    {formatCurrency(tidligereFakturertAvgiftssystem)}
                  </Nav.Table.DataCell>
                </Nav.Table.Row>
              )}
              {tidligereÅrsavregningAvgiftssystem !== 0 && (
                <Nav.Table.Row>
                  <Nav.Table.DataCell className="label-cell operator-cell">
                    <span className="operator">+</span>
                    Avgiftssystem (forrige registrert):
                  </Nav.Table.DataCell>
                  <Nav.Table.DataCell className={`amount-cell ${getAmountClass(tidligereÅrsavregningAvgiftssystem)}`}>
                    {formatCurrency(tidligereÅrsavregningAvgiftssystem)}
                  </Nav.Table.DataCell>
                </Nav.Table.Row>
              )}
              <Nav.Table.Row className="final-difference-row">
                <Nav.Table.DataCell className="label-cell">
                  <strong>Til fakturering:</strong>
                </Nav.Table.DataCell>
                <Nav.Table.DataCell className={`amount-cell ${getAmountClass(tilFakturering)}`}>
                  <strong>{formatCurrency(tilFakturering)}</strong>
                </Nav.Table.DataCell>
              </Nav.Table.Row>
            </Nav.Table.Body>
          </Nav.Table>

          {tidligereÅrsavregningAvgiftssystem !== 0 && (
            <Nav.Alert variant="info" className="correction-info-alert">
              <strong>Avgiftssystem korreksjon:</strong> Forrige årsavregning registrerte{" "}
              {formatCurrency(tidligereÅrsavregningAvgiftssystem)} fra avgiftssystemet, denne årsavregningen registrerer{" "}
              {formatCurrency(tidligereFakturertAvgiftssystem)}. Differanse på{" "}
              {formatCurrency(Math.abs(tidligereÅrsavregningAvgiftssystem - tidligereFakturertAvgiftssystem))}
              {tidligereÅrsavregningAvgiftssystem > tidligereFakturertAvgiftssystem
                ? "refunderes"
                : "tilleggsfaktureres"}
              for å korrigere registreringen.
            </Nav.Alert>
          )}
        </div>
      </>
    );
  };

  const getTitle = () => {
    if (harKunAvgiftssystemData) {
      return "Avgiftssystem avregning";
    }
    if (harTidligereGrunnlag && !harNyttGrunnlag) {
      return "Tidligere grunnlag oversikt";
    }
    if (!harTidligereGrunnlag && harNyttGrunnlag) {
      return "Nytt grunnlag beregning";
    }
    return "Årsavregning sammendrag";
  };

  return (
    <div className={`aarsavregnings-sammendrag ${isDetailed ? "detailed" : "compact"}`}>
      <div className={isDetailed ? "detailed-header" : "compact-header"}>
        <Nav.Heading level="2" size="medium" className="summary-title">
          {getTitle()}
        </Nav.Heading>
        <Nav.Button
          variant="tertiary"
          size="small"
          className={isDetailed ? "collapse-button" : "expand-button"}
          onClick={() => setIsDetailed(!isDetailed)}
        >
          {isDetailed ? "Skjul detaljer" : "Vis detaljer"}
        </Nav.Button>
      </div>

      {isDetailed ? renderDetailedView() : renderCompactView()}
    </div>
  );
}
