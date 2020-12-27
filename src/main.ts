import "regenerator-runtime/runtime";
import { waitForElem } from "./async-utils";
import { createElement } from "./html-utils";
import { decryptGpgFile, isGpgFile } from "./gpg-utils";

const NEW_CONTENT_DOWNLOAD_BUTTON_SELECTOR =
  ".binary-container .until-revision.binary .download-file-button";
const OLD_CONTENT_DOWNLOAD_BUTTON_SELECTOR =
  ".binary-container .since-revision.binary .download-file-button";
const FILE_CONTENT_DOWNLOAD_BUTTON_SELECTOR =
  "#file-content .binary-container .download-file-button";
const DOWNLOAD_BUTTON_SELECTOR = `${NEW_CONTENT_DOWNLOAD_BUTTON_SELECTOR},${FILE_CONTENT_DOWNLOAD_BUTTON_SELECTOR}`;
const DECRYPTED_CONTENT_ELEMENT_ID = "gpg-file-content";
const TOGGLE_DECRYPTED_BUTTON_ID = "gpg-toggle-decrypted-content";

declare global {
  interface Window {
    aui: any;
  }
}

main().catch((e) => {
  console.warn("Something went wrong in bitbucket gpg viewer extension:", e);
});

async function waitForFileContentToLoad() {
  await waitForElem(
    "#commit-file-content .content-view.fully-loaded, #file-content .content-view"
  );
}

function heuristicallyCheckIfBitbucket() {
  // latest version of bitbucket doesn't have this classname and they are not supported.
  return Boolean(document.querySelector("body.bitbucket-theme"));
}

async function main() {
  if (!heuristicallyCheckIfBitbucket()) {
    console.warn(
      "bitbucket gpg viewer: this website is matched as a bitbucket instance, but it's either a wrong match or the version is not supported"
    );
  }
  await applyIfApplicable();
  window.addEventListener("hashchange", applyIfApplicable);
}

async function applyIfApplicable() {
  if (hasFileContent()) {
    await waitForFileContentToLoad();

    const downloadBtn: HTMLAnchorElement = document.querySelector(
      DOWNLOAD_BUTTON_SELECTOR
    );

    if (downloadBtn && isGpgFile(downloadBtn.href)) {
      const button = createElement<HTMLButtonElement>(
        `<button class="aui-button" id="${TOGGLE_DECRYPTED_BUTTON_ID}">Decrypt</button>`
      );
      button.addEventListener("click", toggleDecryptedContent);
      downloadBtn
        .closest(".file-content")
        .querySelector(".file-toolbar .primary")
        .append(button);
    }
  }
}

const toggleDecryptedContent = async (e: Event) => {
  const button = e.target as HTMLButtonElement;
  let decrypted = document.getElementById(DECRYPTED_CONTENT_ELEMENT_ID);
  button.disabled = true;
  try {
    if (decrypted) {
      hideDecryptedContent();
      button.innerText = "Decrypt";
    } else {
      await showDecryptedContent();
      button.innerText = "Show original";
    }
  } catch (e) {
    throw e;
  } finally {
    button.disabled = false;
  }
};

const hideDecryptedContent = () => {
  document.querySelector(".binary-container").removeAttribute("hidden");
  document.getElementById(DECRYPTED_CONTENT_ELEMENT_ID).remove();
};
const showDecryptedContent = async () => {
  const gpgFileUrl = document.querySelector<HTMLAnchorElement>(
    DOWNLOAD_BUTTON_SELECTOR
  ).href;
  const oldContentUrl = document.querySelector<HTMLAnchorElement>(
    OLD_CONTENT_DOWNLOAD_BUTTON_SELECTOR
  )?.href;

  let decryptedContent,
    decryptedOldContent = "";
  try {
    decryptedContent = await decryptGpgFile(gpgFileUrl);
    if (oldContentUrl) {
      decryptedOldContent = await decryptGpgFile(oldContentUrl);
    }
  } catch (e) {
    alert(`Decryption failed: ${normalizeAndGetErrorMessage(e)}`);
    console.error(e);
    throw e;
  }
  const contentRoot = createElement(
    `<div id="${DECRYPTED_CONTENT_ELEMENT_ID}" style="font-size: 0.75rem"></div>`
  );
  document.querySelector(".content-view").append(contentRoot);
  document.querySelector(".binary-container").setAttribute("hidden", "");
  if (isInDiffMode() && decryptedContent !== decryptedOldContent) {
    const { renderDiff } = await import("./render-diff");
    renderDiff(
      { newContent: decryptedContent, oldContent: decryptedOldContent },
      contentRoot
    );
  } else {
    const { renderContent } = await import("./render-content");
    renderContent({ fileContent: decryptedContent }, contentRoot);
  }
};

const isInDiffMode = () =>
  Boolean(document.querySelector(NEW_CONTENT_DOWNLOAD_BUTTON_SELECTOR));

function normalizeAndGetErrorMessage(e: Error | any): string {
  const msg = e.message || `${e}`;
  if (msg === "Error decrypting message: Modification detected.") {
    return "Wrong password!";
  }
  return msg;
}

function hasFileContent() {
  return document.querySelector(".file-content") !== null;
}
