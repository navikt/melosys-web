import { Editor, SyntheticKeyboardEvent } from "react-draft-wysiwyg";
import React, { useEffect, useState } from "react";
import { ContentState, convertToRaw, EditorState, RichUtils } from "draft-js";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import classNames from "classnames";

import * as Nav from "../../navFrontend";
import * as Utils from "../../utils";

import FontSize from "./fontSize";
import "./htmlEditor.css";

const toolbar = {
  options: ["inline", "fontSize", "list", "link", "history"],
  inline: { options: ["bold", "italic", "underline", "strikethrough"] },
  list: { inDropdown: true },
  fontSize: {
    options: [11, 12, 14, 16],
    component: FontSize,
  },
};

const editorStateFromHTML = (htmlValue: string) =>
  EditorState.createWithContent(ContentState.createFromBlockArray(htmlToDraft(htmlValue).contentBlocks));
const htmlFromEditorState = (editorState: EditorState) => draftToHtml(convertToRaw(editorState.getCurrentContent()));

type TextToHtmlEditorProps = {
  [x: string]: any;
};

function HtmlEditor({ value, onChange, ...rest }: TextToHtmlEditorProps) {
  const [currentEditorState, setCurrentEditorState] = useState(editorStateFromHTML(value));

  useEffect(() => {
    const currentHtml = htmlFromEditorState(currentEditorState);
    if (!Utils._isEmpty(currentHtml) && !Utils._isEmpty(value) && currentHtml !== value) {
      const editorState = editorStateFromHTML(value);
      onEditorStateChange(editorState);
    }
  }, [value]);

  const onEditorStateChange = (editorState: EditorState) => {
    setCurrentEditorState(editorState);
    onChange(htmlFromEditorState(editorState));
  };

  const handlePastedText = () => {
    return false; // Benyttes for å få default stateChange ved paste
  };

  const handleReturn = (e: SyntheticKeyboardEvent) => {
    if (e.key === "Enter") {
      const editorState = RichUtils.insertSoftNewline(currentEditorState);
      onEditorStateChange(editorState);
      return true;
    }
    return false;
  };

  return (
    <div className={classNames("htmlEditor", rest?.className)}>
      {rest?.label ? <Nav.Typo.Element className="editor_label">{rest?.label}</Nav.Typo.Element> : ""}
      <Editor
        handleReturn={handleReturn}
        editorState={currentEditorState}
        toolbar={toolbar}
        wrapperClassName={classNames("wrapper", { "wrapper-disabled": rest?.disabled, "wrapper-feil": rest?.feil })}
        editorClassName="editor"
        onEditorStateChange={onEditorStateChange}
        handlePastedText={handlePastedText}
        ariaLabel={rest?.label}
        {...rest}
      />
      {rest?.feil && (
        <div role="alert" aria-live="assertive" className="feilmelding">
          {rest.feil?.melding || rest.feil}
        </div>
      )}
    </div>
  );
}

export default HtmlEditor;
