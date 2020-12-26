export async function waitForElem(
  selector: string,
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

async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
