import { decrypt, message } from "openpgp";
import { getPassword, savePassword } from "./password";

export function isGpgFile(url: string) {
  return new URL(url).pathname.endsWith(".gpg");
}

export async function decryptGpgFile(url: string) {
  const bytes = getBinaryContent(url);
  const encryptedMessage = await message.read(bytes);
  // Technically, password can be different, we should use the full url (which includes commit hash)
  // for caching password, but in practice, it's very unlikely that we will use the same password
  // to decrypt both old and new file (by only using pathname as cache key). It can be easily
  // changed tho in future if needed.
  let passwordCacheKey = new URL(url).pathname;
  const password = getPassword(passwordCacheKey);
  if (!password) {
    alert("Password not entered");
    throw new Error("Password not entered");
  }
  const { data } = await decrypt({
    message: encryptedMessage,
    passwords: [password],
  });
  // only save password if decryption was successful
  savePassword(passwordCacheKey, password);
  return data;
}

const binaryContentCache = {};
async function getBinaryContent(url: string) {
  if (!binaryContentCache[url]) {
    const response = await fetch(url);
    binaryContentCache[url] = new Uint8Array(await response.arrayBuffer());
  }
  return binaryContentCache[url];
}
