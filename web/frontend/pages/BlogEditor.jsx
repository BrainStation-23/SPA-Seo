import { useEffect, useState } from "react";
import "../assets/lexical-styles.css";

import ExampleTheme from "../Themes/ExampleTheme";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import TreeViewPlugin from "../plugins/TreeViewPlugin";
import ToolbarPlugin from "../plugins/ToolbarPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TRANSFORMERS } from "@lexical/markdown";

import ListMaxIndentLevelPlugin from "../plugins/ListMaxIndentLevelPlugin";
import CodeHighlightPlugin from "../plugins/CodeHighlightPlugin";
import AutoLinkPlugin from "../plugins/AutoLinkPlugin";

import { useGenerateBlogContentAI } from "../hooks/useAIQuery";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $createParagraphNode,
  $createTextNode,
  $getSelection,
} from "lexical";
import { $generateHtmlFromNodes } from "@lexical/html";

function Placeholder() {
  return <div className="editor-placeholder">Enter some rich text...</div>;
}

const editorConfig = {
  // The editor theme
  theme: ExampleTheme,
  // Handling of errors during update
  onError(error) {
    throw error;
  },
  // Any custom nodes go here
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
  ],
};

function InsertTextButton({ generatedText }) {
  const [editor] = useLexicalComposerContext();

  const getHTMLContent = () => {
    let htmlExport = "";
    editor.read(() => {
      htmlExport = $generateHtmlFromNodes(editor);
    });
    return htmlExport;
  };

  const insertText = () => {
    editor.update(() => {
      const root = $getRoot(); // Get the root node of the editor

      // Create a new paragraph node with the generated text
      const paragraphNode = $createParagraphNode();
      const textNode = $createTextNode(generatedText);
      paragraphNode.append(textNode);

      // Append the paragraph node to the root node
      root.append(paragraphNode);
    });
  };

  return (
    <>
      <button onClick={insertText}>Insert Generated Text</button>
      <button onClick={() => console.log(getHTMLContent())}>Get HTML</button>
    </>
  );
}

export default function Editor() {
  const [editorState, setEditorState] = useState(/* Initial editor state */);
  const [htmlContent, setHtmlContent] = useState("");
  const { data, mutate: generateContent } = useGenerateBlogContentAI();
  const [input, setInput] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
      <div>
        <input
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          type="text"
        />
        <button
          onClick={() => {
            generateContent({ prompt: input });
          }}
        >
          hit
        </button>
      </div>
      <div className="blog-editor">
        <LexicalComposer initialConfig={editorConfig}>
          <div className="editor-container">
            <ToolbarPlugin />
            <div className="editor-inner">
              <RichTextPlugin
                contentEditable={<ContentEditable className="editor-input" />}
                placeholder={<Placeholder />}
                ErrorBoundary={LexicalErrorBoundary}
              />
              <HistoryPlugin />
              <InsertTextButton
                generatedText={JSON.stringify(data?.aiResult)}
              />
              <TreeViewPlugin />
              <AutoFocusPlugin />
              <CodeHighlightPlugin />
              <ListPlugin />
              <LinkPlugin />
              <AutoLinkPlugin />
              <ListMaxIndentLevelPlugin maxDepth={7} />
              <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
            </div>
          </div>
        </LexicalComposer>
      </div>
    </div>
  );
}
