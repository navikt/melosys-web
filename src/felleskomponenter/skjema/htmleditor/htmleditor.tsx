import React, { useState } from "react";
import { EditorState, ContentState, convertToRaw, convertFromHTML } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import { Field, WrappedFieldProps } from "redux-form";

import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./htmleditor.css";

const toolbar = {
  options: ["inline", "fontSize", "list", "link", "history"],
  inline: { options: ["bold", "italic", "underline", "strikethrough"] },
  list: { inDropdown: true },
};

type InnerHtmlEditorComponentProps = {
  [x: string]: any;
};

function InnerHTMLEditorComponent({ input, ...rest }: InnerHtmlEditorComponentProps & WrappedFieldProps) {
  const [currentEditorState, setCurrentEditorState] = useState(
    EditorState.createWithContent(ContentState.createFromBlockArray(convertFromHTML(input.value).contentBlocks))
  );

  const onEditorStateChange = (editorState: EditorState) => {
    setCurrentEditorState(editorState);
    input.onChange(draftToHtml(convertToRaw(editorState.getCurrentContent())));
  };

  const inputProps = {
    ...input,
    ...rest,
  };

  return (
    <div className="editor_content" {...inputProps}>
      <Editor
        editorState={currentEditorState}
        toolbar={toolbar}
        wrapperClassName="wrapper"
        editorClassName="editor"
        onEditorStateChange={onEditorStateChange}
        placeholder={rest.placeholder || ""}
      />
    </div>
  );
}

interface HtmleditorProps extends InnerHtmlEditorComponentProps {
  feltNavn: string;
  className: string;
}

function HTMLEditor({ feltNavn, className, ...rest }: HtmleditorProps) {
  return <Field name={feltNavn} className={className} component={InnerHTMLEditorComponent} props={rest} />;
}

export default HTMLEditor;
