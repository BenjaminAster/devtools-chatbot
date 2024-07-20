
import * as FS from "node:fs/promises";
import * as Path from "node:path";

// const url = "https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt";
const url = "https://www.mit.edu/~ecprice/wordlist.10000";
let text = (await (await global.fetch(url)).text()).replaceAll("\r", "");
const words = text.trim().split("\n");
const length = words.length;
for (let i = 0; i < length; ++i) {
	const word = words[i];
	words.push(word.charAt(0).toUpperCase() + word.slice(1));
}

await FS.mkdir(Path.resolve(import.meta.dirname, "./data/"), { recursive: true });
await FS.writeFile(Path.resolve(import.meta.dirname, "./data/english-words.txt"), words.join("\n"), { encoding: "utf-8" });
