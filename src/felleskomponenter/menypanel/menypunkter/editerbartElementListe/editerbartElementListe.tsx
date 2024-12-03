import { ElementType } from "react";
import PT from "prop-types";
import { connect, ConnectedProps } from "react-redux";
import { FieldArray, change, WrappedFieldArrayProps } from "redux-form";
import classNames from "classnames";
import { ThunkDispatch } from "redux-thunk";
import { Action } from "redux";
import { RootState } from "AppTypes";

import FlereRedigeringsknapperListe from "./flereRedigeringsknapperListe";
import EnRedigeringsknappListe from "./enRedigeringsknappListe";
import { SymbolsynlighetConfig } from "../editerbartElement";

interface BaseProps {
  leggTilTekst: string | ((elementer: any[]) => string);
  redigerbart: boolean;
  redigererPreElementerKomponent?: ElementType;
  redigeringUtfortPreElementerKomponent?: ElementType;
  redigererKomponent: ElementType;
  redigeringUtfortKomponent: ElementType;
  ingenDataKomponent?: ElementType;
  hentDefaultElement: () => any;
  className?: string;
  hentNavn?: (element: any) => string;
  tittelTekst: string;
  harData: (elementer: any[], element: any) => boolean;
  maksAntallElementer?: number;
  tittelIkon?: ElementType;
  tittelUnderstrek?: boolean;
  elementUnderstrek?: boolean;
  flereRedigeringsknapper?: boolean;
  onBinClick?: (index: number) => void;
  symbolsynlighet?: SymbolsynlighetConfig;
  onLagreClick?: (elementer: any[]) => boolean | Promise<boolean>;
}

type InnerEditerbartElementListeProps = WrappedFieldArrayProps & BaseProps;

const mapDispatchToProps = (
  dispatch: ThunkDispatch<RootState, unknown, Action>,
  ownProps: InnerEditerbartElementListeProps,
) => ({
  settFeltVerdi: (field: string, value: any) => dispatch(change(ownProps.meta.form, field, value)),
});

const connector = connect(null, mapDispatchToProps);
type PropsFromRedux = ConnectedProps<typeof connector>;

function InnerEditerbartElementListe({
  leggTilTekst,
  redigerbart,
  fields,
  redigererPreElementerKomponent,
  redigeringUtfortPreElementerKomponent,
  redigererKomponent,
  redigeringUtfortKomponent,
  ingenDataKomponent,
  hentDefaultElement,
  className,
  hentNavn,
  tittelTekst,
  harData,
  maksAntallElementer,
  tittelIkon,
  tittelUnderstrek = false,
  elementUnderstrek,
  flereRedigeringsknapper = true,
  settFeltVerdi,
  onBinClick,
  symbolsynlighet,
  onLagreClick,
}: InnerEditerbartElementListeProps & PropsFromRedux) {
  const editerbartElementListeCls = classNames(className);

  const leggTil = () => fields.push(hentDefaultElement());

  const elementer = fields.getAll();

  const innerLeggTilTekst = typeof leggTilTekst === "function" ? leggTilTekst(elementer) : leggTilTekst;

  const kanLeggeTilFlereElementer = !maksAntallElementer || fields?.length < maksAntallElementer;

  const lagreClickHandler = () => {
    if (onLagreClick) {
      return onLagreClick(elementer);
    }
    return true;
  };

  return (
    <div className={editerbartElementListeCls}>
      {flereRedigeringsknapper ? (
        <FlereRedigeringsknapperListe
          redigerbart={redigerbart}
          tittelIkon={tittelIkon}
          hentNavn={hentNavn}
          harData={(element: any) => harData(fields.getAll(), element)}
          fields={fields}
          settFeltVerdi={settFeltVerdi}
          elementUnderstrek={elementUnderstrek}
          redigererKomponent={redigererKomponent}
          redigeringUtfortKomponent={redigeringUtfortKomponent}
          ingenDataKomponent={ingenDataKomponent}
          tittelTekst={tittelTekst}
          leggTilTekst={innerLeggTilTekst}
          leggTil={leggTil}
          onBinClick={onBinClick}
          onLagreClick={lagreClickHandler}
        />
      ) : (
        <EnRedigeringsknappListe
          redigerbart={redigerbart}
          tittelIkon={tittelIkon}
          fields={fields}
          harData={() => harData(fields.getAll(), null)}
          settFeltVerdi={settFeltVerdi}
          tittelUnderstrek={tittelUnderstrek}
          elementUnderstrek={elementUnderstrek}
          redigererPreElementerKomponent={redigererPreElementerKomponent}
          redigeringUtfortPreElementerKomponent={redigeringUtfortPreElementerKomponent}
          redigererKomponent={redigererKomponent}
          redigeringUtfortKomponent={redigeringUtfortKomponent}
          ingenDataKomponent={ingenDataKomponent}
          tittelTekst={tittelTekst}
          leggTilTekst={innerLeggTilTekst}
          leggTil={leggTil}
          kanLeggeTilFlereElementer={kanLeggeTilFlereElementer}
          onBinClick={onBinClick}
          symbolsynlighet={symbolsynlighet}
          onLagreClick={lagreClickHandler}
        />
      )}
    </div>
  );
}

const ConnectedInnerElementListe = connector(InnerEditerbartElementListe);

type EditerbartElementListeProps = BaseProps & {
  feltNavn: string;
};

function EditerbartElementListe({ feltNavn, ...rest }: EditerbartElementListeProps) {
  return <FieldArray component={ConnectedInnerElementListe} name={feltNavn} props={rest} rerenderOnEveryChange />;
}

EditerbartElementListe.propTypes = {
  feltNavn: PT.string.isRequired,
};

export default EditerbartElementListe;
