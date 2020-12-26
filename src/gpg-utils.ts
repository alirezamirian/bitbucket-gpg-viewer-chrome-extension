import { decrypt, message } from "openpgp";
import { getPassword, savePassword } from "./password";

export function isGpgFile(url: string) {
  return new URL(url).pathname.endsWith(".gpg");
}

export async function decryptGpgFile(url: string) {
  const bytes = getBinaryContent(url);
  const encryptedMessage = await message.read(bytes);
  const password = getPassword(url);
  if (!password) {
    alert("Password not entered");
    throw new Error("Password not entered");
  }
  const { data } = await decrypt({
    message: encryptedMessage,
    passwords: [password],
  });
  // only save password if decryption was successful
  savePassword(url, password);
  return data;
}

async function getBinaryContent(url: string) {
  const response = await fetch(url);
  return new Uint8Array(await response.arrayBuffer());
}
