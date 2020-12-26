let passwordMap: Record<string, string> = {};

export function getPassword(url): string {
  if (passwordMap[url]) {
    return passwordMap[url];
  }
  return prompt("Please enter the encryption password:", "");
}

export function savePassword(url: string, password: string) {
  passwordMap[url] = password;
}
