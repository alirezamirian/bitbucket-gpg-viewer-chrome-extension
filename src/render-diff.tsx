import * as React from "react";
import { useMemo } from "react";
import ReactDOM from "react-dom";
import { diffLines, formatLines } from "unidiff";
import { parseDiff, Diff, Hunk, tokenize, markEdits } from "react-diff-view";
import "react-diff-view/style/index.css";

const EMPTY_HUNKS = [];

function DiffView({ newText, oldText }) {
  const { tokens, hunks, type } = useMemo(() => {
    const diffText = formatLines(diffLines(oldText, newText), {
      context: 3,
    });
    const [{ hunks, type }] = parseDiff(diffText, { nearbySequences: "zip" });
    let tokens =
      hunks &&
      tokenize(hunks, { enhancers: markEdits(hunks, { type: "block" }) });
    return { tokens, hunks, type };
  }, [oldText, newText]);

  return (
    <Diff
      viewType="unified"
      diffType={type}
      hunks={hunks || EMPTY_HUNKS}
      tokens={tokens}
    >
      {(hunks) => hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)}
    </Diff>
  );
}

export function render({ newContent, oldContent }) {
  const rootElement = document.getElementById("gpg-file-content");
  ReactDOM.render(
    <DiffView newText={newContent} oldText={oldContent} />,
    rootElement
  );
}
