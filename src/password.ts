let passwordMap: Record<string, string> = {};

export function getPassword(cacheKey): string {
  if (passwordMap[cacheKey]) {
    return passwordMap[cacheKey];
  }
  return prompt("Please enter the encryption password:", "");
}

export function savePassword(cacheKey: string, password: string) {
  passwordMap[cacheKey] = password;
}
