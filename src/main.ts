import "regenerator-runtime/runtime";
import { waitForElem } from "./async-utils";
import { createElement } from "./html-utils";
import { decryptGpgFile, isGpgFile } from "./gpg-utils";

const DOWNLOAD_BUTTON_SELECTOR =
  ".binary-container .until-revision.binary .download-file-button";
const OLD_CONTENT_DOWNLOAD_BUTTON_SELECTOR =
  ".binary-container .since-revision.binary .download-file-button";

declare global {
  interface Window {
    aui: any;
  }
}

// TODO: add close button for decrypted content
// TODO: fix diff
// TODO: fix file view
main().catch((e) => {
  console.warn("Something went wrong in bitbucket gpg viewer extension:", e);
});

async function waitForFileContentToLoad() {
  await waitForElem(".content-view.fully-loaded");
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
      const button = createElement(
        `<button class="aui-button">Decode</button>`
      );
      button.addEventListener("click", showDecryptedContent);
      downloadBtn
        .closest(".file-content")
        .querySelector(".file-toolbar .change-type-placeholder")
        .after(button);
    }
  }
}

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
    return;
  }
  document
    .querySelector(".content-view")
    .append(
      createElement(
        `<div id="gpg-file-content" style="font-size: 0.75rem"></div>`
      )
    );
  document.querySelector(".binary-container").setAttribute("hidden", "");
  const { render } = await import("./render-diff");
  render({ newContent: decryptedContent, oldContent: decryptedOldContent });
};

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
