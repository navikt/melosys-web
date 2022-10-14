import { Editor, SyntheticKeyboardEvent } from "react-draft-wysiwyg";
import React, { useState } from "react";
import { ContentState, convertFromHTML, convertToRaw, EditorState, RichUtils } from "draft-js";
import draftToHtml from "draftjs-to-html";
import classNames from "classnames";
import "./htmlEditor.css";
import * as Nav from "../../navFrontend";

const toolbar = {
  options: ["inline", "fontSize", "list", "link", "history"],
  inline: { options: ["bold", "italic", "underline", "strikethrough"] },
  list: { inDropdown: true },
};

type TextToHtmlEditorProps = {
  [x: string]: any;
};

function HtmlEditor({ value, onChange, ...rest }: TextToHtmlEditorProps) {
  const [currentEditorState, setCurrentEditorState] = useState(
    EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(value).contentBlocks))
  );

  const onEditorStateChange = (editorState: EditorState) => {
    setCurrentEditorState(editorState);
    onChange(draftToHtml(convertToRaw(editorState.getCurrentContent())));
  };

  const handlePastedText = () => {
    return false; // Benyttes for å få default stateChange ved paste
  };

  const handleReturn = (e: SyntheticKeyboardEvent) => {
    if (e.key === "Enter") {
      setCurrentEditorState(RichUtils.insertSoftNewline(currentEditorState));
      onChange(draftToHtml(convertToRaw(currentEditorState.getCurrentContent())));
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
