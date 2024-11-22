import { useCallback, useEffect, useState } from "react";
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

import {
  TextField,
  Button,
  VerticalStack,
  Badge,
  Label,
  HorizontalStack,
  Text,
} from "@shopify/polaris";
import { PlusIcon, XIcon } from "@shopify/polaris-icons";

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

function Editor({ data }) {
  return (
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
            generatedText={data?.aiResult?.suggestion?.join("\n")}
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
  );
}

export default function EditorWrapper() {
  const {
    data,
    mutate: generateContent,
    isLoading,
    isSuccess,
  } = useGenerateBlogContentAI();
  const [topic, setTopic] = useState("");
  const [prompt, setPrompt] = useState("");
  const [audience, setAudience] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [textFieldOutput, setTextFieldOutput] = useState("");

  const handleTopicChange = useCallback((value) => setTopic(value), []);
  const handlePromptChange = useCallback((value) => setPrompt(value), []);
  const handleAudienceChange = useCallback((value) => setAudience(value), []);
  const handleTextFieldChange = useCallback(
    (value) => setTextFieldOutput(value),
    []
  );
  const handleKeywordInputChange = useCallback(
    (value) => setKeywordsInput(value),
    []
  );

  return (
    <div style={{ display: "flex", flexDirection: "row", gap: "1rem" }}>
      <div style={{ width: "20%" }}>
        <VerticalStack gap={"1"}>
          <TextField label="Topic" value={topic} onChange={handleTopicChange} />
          <TextField
            label="Prompt"
            value={prompt}
            onChange={handlePromptChange}
          />
          <TextField
            label="Keywords"
            helpText={
              <HorizontalStack gap={"1"}>
                {keywords.map((keyword, index) => (
                  <Badge status="new" key={index}>
                    <HorizontalStack
                      blockAlign="center"
                      align="center"
                      gap={"1"}
                    >
                      <Text variant="bodySm">{keyword}</Text>
                      <Button
                        size="slim"
                        plain
                        icon={XIcon}
                        onClick={() => {
                          const newKeywords = Array.from(keywords);
                          newKeywords.splice(index, 1);
                          setKeywords(newKeywords);
                        }}
                      />
                    </HorizontalStack>
                  </Badge>
                ))}
              </HorizontalStack>
            }
            value={keywordsInput}
            onChange={handleKeywordInputChange}
            connectedRight={
              <Button
                primary
                icon={PlusIcon}
                onClick={() => {
                  if (keywordsInput.length > 0) {
                    setKeywords([...keywords, keywordsInput]);
                    setKeywordsInput("");
                  }
                }}
              ></Button>
            }
          />
          <TextField
            label="Audience type"
            value={audience}
            onChange={handleAudienceChange}
          />
          <Button
            primary
            onClick={() => {
              if (input.length === 0) return;
              generateContent(
                { prompt: input },
                {
                  onSuccess: (data) => {
                    const textFieldInputValue = data?.aiResult?.suggestion
                      ?.map((val, index) => `${index + 1}. ${val}`)
                      .join("\n");
                    setTextFieldOutput(textFieldInputValue);
                  },
                }
              );
            }}
          >
            Generate outline
          </Button>
        </VerticalStack>

        <TextField
          label="Output"
          multiline
          value={textFieldOutput}
          onChange={handleTextFieldChange}
        />
        <Button primary>Generate next</Button>
      </div>
      <div className="blog-editor">
        <Editor data={data} />
      </div>
    </div>
  );
}
