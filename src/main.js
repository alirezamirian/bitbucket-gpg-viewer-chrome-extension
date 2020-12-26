import "regenerator-runtime/runtime";
import { message, decrypt } from "openpgp";

const DOWNLOAD_BUTTON_SELECTOR = ".binary-container .download-file-button";

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
  if (hasFileContent()) {
    await waitForFileContentToLoad();

    /**
     * @type {HTMLAnchorElement}
     */
    const downloadBtn = document.querySelector(DOWNLOAD_BUTTON_SELECTOR);

    if (downloadBtn && isGpgFile(downloadBtn.href)) {
      downloadBtn.after(createShowGpgFileContentButton(downloadBtn.href));
    }
  }

  function createShowGpgFileContentButton(gpgFileUrl) {
    const elem = createElement(
      `<a class="aui-button" href="${document.location.hash}">Decode</a>`
    );
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
}

function createElement(htmlString) {
  const div = document.createElement("div");
  div.innerHTML = htmlString.trim();

  return div.firstChild;
}
async function waitForElem(
  selector,
  { interval = 100, giveUpAfterMs = 5000 } = {}
) {
  const giveUpTimestamp = new Date().getTime() + giveUpAfterMs;
  do {
    let elem = document.querySelector(selector);
    if (elem) {
      return elem;
    }
    if (new Date().getTime() > giveUpTimestamp) {
      throw new Error(`waited for ${giveUpAfterMs}ms for ${selector}`);
    }
    await wait(interval);
  } while (true);
}

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function hasFileContent() {
  return document.querySelector(".file-content") !== null;
}

function isGpgFile(url) {
  return new URL(url).pathname.endsWith(".gpg");
}

async function decryptGpgFile(url) {
  const bytes = getBinaryContent(url);
  const encryptedMessage = await message.read(bytes);
  const password = prompt("Please enter the encryption password:", "");
  if (!password) {
    alert("Password not entered");
    throw new Error("Password not entered");
  }
  const { data } = await decrypt({
    message: encryptedMessage,
    passwords: [password],
  });
  return data;
}

async function getBinaryContent(url) {
  const response = await fetch(url);
  return new Uint8Array(await response.arrayBuffer());
}
