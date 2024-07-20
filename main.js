
if (!window.ai?.canCreateTextSession || !ai.createTextSession) {
	document.querySelector("#prompt-api-unavailable").hidden = false;
	throw new Error("Prompt API not available");
};
if (await window.ai?.canCreateTextSession?.() !== "readily") {
	document.querySelector("#model-unavailable").hidden = false;
	throw new Error("Model not available")
};

const session = await ai.createTextSession({});

if (!session) {
	document.querySelector("#session-creation-failed").hidden = false;
	throw new Error("Session creation failed")
};

document.querySelector("#everything-available").hidden = false;

const starIconDataURL = `data:image/svg+xml;charset=utf-8,${self.encodeURIComponent(
	await (await self.fetch(import.meta.resolve("./assets/star-icon.svg"))).text()
)}`;

const englishWords = (await (await self.fetch("./data/english-words.txt")).text()).split("\n");

const { console, setTimeout, Reflect, Promise, Proxy, Symbol } = window;

const startProxying = async () => {
	let currentWord = "";
	let history = [];
	let wordArray = [];
	const proxy = new Proxy({}, {
		get(_, newWord) {
			wordArray.push(newWord);
			return proxy;
		},
	});
	const Properties = class {
		/** @type {string} */ word;
		/** @type {any} */ get;
	};
	const logInputWords = (/** @type {string[]} */[firstWord, ...otherWords]) => {
		const firstWordColor = "light-dark(#1f1f1f, #c7c7c7)";
		const periodColor = "light-dark(#1f1f1f, #e3e3e3)";
		const otherWordsColor = "light-dark(#1f1f1f, #facc15)";
		console.info(
			"%c" + firstWord + otherWords.map((word) => "%c.%c" + word).join(""),
			`color: ${firstWordColor};`,
			...otherWords.flatMap(() => [`color: ${periodColor};`, `color: ${otherWordsColor};`]),
		);
	};
	const css = `padding-inline-start: 3ch;`;
	const additionalFirstLineCSS = `background: url('${starIconDataURL}') 0 0 / 1lh 1lh no-repeat;`;
	const logDialog = (/** @type {{prompt: string[], response: string}[]} */ dialog) => {
		console.clear();
		for (const { prompt, response } of dialog) {
			logInputWords(prompt);
			const lines = response.split("\n");
			console.info(
				`%c${lines.join("%c\n%c")}%c`,
				...lines.flatMap((line, i) => [css + (i ? "" : additionalFirstLineCSS), ""])
			);
		}
	};
	const getter = function () {
		wordArray.push(this.word);
		setTimeout(async () => {
			logDialog(history);
			logInputWords(wordArray);
			console.info("%cgenerating response...", css + additionalFirstLineCSS + "font-style: italic; color: light-dark(#666, #bbb);");
			const stream = session.promptStreaming(wordArray.join(" "));
			const iterator = stream[Symbol.asyncIterator]();
			let iteratorResult;
			let lastChunk;
			for (let i = 0; iteratorResult = await iterator.next(), !iteratorResult.done; ++i) {
				lastChunk = iteratorResult.value.trimStart();
				if (i % 3 === 0) {
					logDialog([...history, { prompt: wordArray, response: lastChunk }]);
				}
			}
			logDialog([...history, { prompt: wordArray, response: lastChunk }]);
			history.push({
				prompt: wordArray,
				response: lastChunk,
			});
			wordArray = [];
		});
		return proxy;
	};
	for (let i = 0; i < englishWords.length; ++i) {
		currentWord = englishWords[i];
		const properties = new Properties();
		properties.word = currentWord;
		properties.get = getter.bind(properties);
		Reflect.defineProperty(globalThis, currentWord, properties);

		if (i % 1000 === 999) {
			await new Promise((resolve) => setTimeout(resolve));
		}
	}
	console.clear();
};

console.info(
	[
		`%cWelcome to %cDevTools Chatbot%c!`,
		`\n\n`,
		`%c⚠\uFE0F IMPORTANT:%c Please make sure "Autocompletion" is disabled in DevTools settings under "Sources"! %cBad things will happen otherwise!`,
		`\n\n`,
		`%cTo use %cDevTools Chatbot%c, `,
		`simply type the sentence you want to tell/ask the chatbot into the console, `,
		`but with periods (.) instead of spaces as word separators. `,
		`For example, if you want to ask it "What is 2 + 2?", type %cWhat.is.two.plus.two%c into the console. `,
		`Also, note that the first word must be a known word in the English dictionary, with all but the first letters lowercased.`,
		`\n\n`,
		`To get started, type %cstart%c and press enter.`
	].join(""),
	"font-size: 1.3em;",
	"font-size: 1.3em; font-weight: bold;",
	"font-size: 1.3em;",
	"font-weight: bold; color: light-dark(#e00, #f77);",
	"",
	"font-weight: bold;",
	"",
	"",
	"",
	"border: 1px solid #aaaa; padding-inline: .3em;",
	"",
	"border: 1px solid #aaaa; padding-inline: .3em;",
	"",
);

Reflect.defineProperty(globalThis, "start", {
	configurable: true,
	get: () => {
		Reflect.deleteProperty(globalThis, "start");
		startProxying();
		return "Starting...";
	},
});

export { };
