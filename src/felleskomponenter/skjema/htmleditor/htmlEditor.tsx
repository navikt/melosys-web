import { Editor } from "react-draft-wysiwyg";
import React, { useState } from "react";
import { ContentState, convertFromHTML, convertToRaw, EditorState } from "draft-js";
import draftToHtml from "draftjs-to-html";
import "./htmlEditor.css";
import * as Nav from "../../../navFrontend";

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

  return (
    <>
      {rest?.label ? <Nav.Typo.Element className="editor_label">{rest?.label}</Nav.Typo.Element> : ""}
      <Editor
        editorState={currentEditorState}
        toolbar={toolbar}
        wrapperClassName="wrapper"
        editorClassName="editor"
        onEditorStateChange={onEditorStateChange}
        stripPastedStyles
        ariaLabel={rest?.label}
        {...rest}
      />
    </>
  );
}

export default HtmlEditor;
