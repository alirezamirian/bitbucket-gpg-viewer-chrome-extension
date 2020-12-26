export function createElement<T extends HTMLElement>(htmlString: string): T {
  const div = document.createElement("div");
  div.innerHTML = htmlString.trim();

  return div.firstChild as T;
}
