import { decrypt, message } from "openpgp";

export function isGpgFile(url: string) {
  return new URL(url).pathname.endsWith(".gpg");
}

export async function decryptGpgFile(url: string) {
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

async function getBinaryContent(url: string) {
  const response = await fetch(url);
  return new Uint8Array(await response.arrayBuffer());
}
