import React, { useState } from 'react';
import { EditorState, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import draftToHtml from 'draftjs-to-html';
import { Field, WrappedFieldProps } from 'redux-form';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import './htmleditor.css';

const toolbar = {
  options: ['inline', 'list', 'link', 'history'],
  inline: { options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace'] },
  list: { inDropdown: true },
};

type InnerHtmlEditorComponentProps = WrappedFieldProps & {
  [x: string]: any,
};

function InnerHTMLEditorComponent
({
  input,
  ...rest
}: InnerHtmlEditorComponentProps) {
  const [currentEditorState, setCurrentEditorState] = useState(EditorState.createEmpty());

  const onEditorStateChange = (editorState: any) => {
    setCurrentEditorState(editorState);
    input.onChange(draftToHtml(convertToRaw(editorState.getCurrentContent())));
  };

  const inputProps = {
    ...input, ...rest,
  };

  return (
    <div className="editor_content" {...inputProps}>
      <Editor
        editorState={currentEditorState}
        toolbar={toolbar}
        wrapperClassName="wrapper"
        editorClassName="editor"
        onEditorStateChange={onEditorStateChange}
        placeholder={rest.placeholder || ''}
      />
    </div>
  );
}

interface HtmleditorProps {
  feltNavn: string;
  className: string,
  [X: string]: any,
}

function HTMLEditor
({
  feltNavn,
  className,
  ...rest
}: HtmleditorProps) {
  return (
    <Field
      name={feltNavn}
      className={className}
      component={InnerHTMLEditorComponent}
      props={rest}
    />
  );
}

export default HTMLEditor;
