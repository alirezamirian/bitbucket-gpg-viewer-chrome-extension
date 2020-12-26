import "regenerator-runtime/runtime";
import { waitForElem } from "./async-utils";
import { createElement } from "./html-utils";
import { decryptGpgFile, isGpgFile } from "./gpg-utils";

const DOWNLOAD_BUTTON_SELECTOR = ".binary-container .download-file-button";

declare global {
  interface Window {
    aui: any;
  }
}

// TODO: handle file changes in PR
// TODO: keep password in a variable for reuse
// TODO: handle wrong password similar to not providing password
// TODO: add close button for decrypted content
// TODO: fix file view
// TODO(bonus): Check if it's possible to have diff
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
}

async function applyIfApplicable() {
  if (hasFileContent()) {
    await waitForFileContentToLoad();

    const downloadBtn: HTMLAnchorElement = document.querySelector(
      DOWNLOAD_BUTTON_SELECTOR
    );

    if (downloadBtn && isGpgFile(downloadBtn.href)) {
      downloadBtn.after(createShowGpgFileContentButton(downloadBtn.href));
    }
  }
}

function createShowGpgFileContentButton(gpgFileUrl: string) {
  const elem = createElement(`<button class="aui-button">Decode</button>`);
  elem.addEventListener("click", async () => {
    const decryptedContent = await decryptGpgFile(gpgFileUrl);
    document.querySelector(".content-view").append(
      createElement(`
      <div style="position: absolute; left: 0; right: 0; top: 0; bottom: 0; padding: 10px; background: #fff">
      <pre id="decrypted-gpg-content"></pre>
</div>`)
    );
    document.querySelector(
      "#decrypted-gpg-content"
    ).textContent = decryptedContent;
    console.log("content", decryptedContent);
  });
  return elem;
}

function hasFileContent() {
  return document.querySelector(".file-content") !== null;
}