/**
 * @param {TemplateStringsArray} strings
 * @param  {...any} args
 * @returns {string}
 */
function noopTag(strings, ...args) {
	return strings.reduce((acc, cur, i) => acc + cur + (args[i] ?? ""), "")
}

function noop() {}

/**
 * @param {number} n
 * @param {number} min
 * @param {number} max
 */
function clamp(n, min, max) {
	return Math.max(min, Math.min(max, n))
}

function safe_not_equal(a, b) {
	return a != a ? b == b : a !== b || (a && typeof a === "object") || typeof a === "function"
}

const subscriber_queue = []

/**
 * Shamelessly stolen and un-tsified from https://github.com/sveltejs/svelte/blob/master/src/runtime/store/index.ts
 * @template T
 * @param {T} value
 * @param {Function} start
 */
function writable(value, start = noop) {
	let stop
	const subscribers = []

	/**
	 * @param {T} new_value
	 */
	function set(new_value) {
		if (safe_not_equal(value, new_value)) {
			value = new_value
			if (stop) {
				// store is ready
				const run_queue = !subscriber_queue.length
				for (let i = 0; i < subscribers.length; i += 1) {
					const s = subscribers[i]
					s[1]()
					subscriber_queue.push(s, value)
				}
				if (run_queue) {
					for (let i = 0; i < subscriber_queue.length; i += 2) {
						subscriber_queue[i][0](subscriber_queue[i + 1])
					}
					subscriber_queue.length = 0
				}
			}
		}
	}

	/**
	 * @param {Function} fn
	 */
	function update(fn) {
		set(fn(value))
	}

	function subscribe(run, invalidate = noop) {
		const subscriber = [run, invalidate]
		subscribers.push(subscriber)
		if (subscribers.length === 1) {
			stop = start(set) || noop
		}
		run(value)

		return () => {
			const index = subscribers.indexOf(subscriber)
			if (index !== -1) {
				subscribers.splice(index, 1)
			}
			if (subscribers.length === 0) {
				stop()
				stop = null
			}
		}
	}

	return { set, update, subscribe }
}

async function localStore(key, defaultValue) {
	const local = await browser.storage.local.get({ [key]: defaultValue }),
		store = writable(local[key])
	store.subscribe(nextValue => browser.storage.local.set({ [key]: nextValue }))
	return store
}

/**
 * @param {string} str
 */
function xmur3(str) {
	for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
		(h = Math.imul(h ^ str.charCodeAt(i), 3432918353)), (h = (h << 13) | (h >>> 19))
	return function () {
		h = Math.imul(h ^ (h >>> 16), 2246822507)
		h = Math.imul(h ^ (h >>> 13), 3266489909)
		return (h ^= h >>> 16) >>> 0
	}
}

/**
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @param {number} d
 */
function sfc32(a, b, c, d) {
	return function () {
		a >>>= 0
		b >>>= 0
		c >>>= 0
		d >>>= 0
		var t = (a + b) | 0
		a = b ^ (b >>> 9)
		b = (c + (c << 3)) | 0
		c = (c << 21) | (c >>> 11)
		d = (d + 1) | 0
		t = (t + d) | 0
		c = (c + t) | 0
		return (t >>> 0) / 4294967296
	}
}

/**
 * @param {string} str
 */
function str2prng(str) {
	const seed = xmur3(str),
		prng = sfc32(seed(), seed(), seed(), seed())
	return prng
}

/**
 * Minimum is inclusive, maximum is exclusive
 * @param {number} min
 * @param {number} max
 * @param {()=>number} prng
 */
function randInt(min, max, prng = Math.random) {
	min = Math.ceil(min)
	max = Math.floor(max)
	return Math.floor(prng() * (max - min) + min)
}

/**
 * Return array of [r,g,b,a] from any valid color. if failed returns undefined
 * From https://gist.github.com/oriadam/396a4beaaad465ca921618f2f2444d49
 * @param {string} color
 * @returns {[number,number,number,number]}
 */
function colorValues(color) {
	if (!color) return
	if (color.toLowerCase() === "transparent") return [0, 0, 0, 0]
	if (color[0] === "#") {
		if (color.length < 7) {
			// convert #RGB and #RGBA to #RRGGBB and #RRGGBBAA
			color =
				"#" +
				color[1] +
				color[1] +
				color[2] +
				color[2] +
				color[3] +
				color[3] +
				(color.length > 4 ? color[4] + color[4] : "")
		}
		return [
			parseInt(color.substr(1, 2), 16),
			parseInt(color.substr(3, 2), 16),
			parseInt(color.substr(5, 2), 16),
			color.length > 7 ? parseInt(color.substr(7, 2), 16) / 255 : 1,
		]
	}
	if (color.indexOf("rgb") === -1) {
		// convert named colors
		var temp_elem = document.body.appendChild(document.createElement("fictum")) // intentionally use unknown tag to lower chances of css rule override with !important
		var flag = "rgb(1, 2, 3)" // this flag tested on chrome 59, ff 53, ie9, ie10, ie11, edge 14
		temp_elem.style.color = flag
		if (temp_elem.style.color !== flag) return // color set failed - some monstrous css rule is probably taking over the color of our object
		temp_elem.style.color = color
		if (temp_elem.style.color === flag || temp_elem.style.color === "") return // color parse failed
		color = getComputedStyle(temp_elem).color
		document.body.removeChild(temp_elem)
	}
	if (color.indexOf("rgb") === 0) {
		if (color.indexOf("rgba") === -1) color += ",1" // convert 'rgb(R,G,B)' to 'rgb(R,G,B)A' which looks awful but will pass the regxep below
		return color.match(/[\.\d]+/g).map(function (a) {
			return +a
		})
	}
}

/**
 * Returns the best text color for the given background color
 * Inspired by https://gomakethings.com/dynamically-changing-the-text-color-based-on-background-color-contrast-with-vanilla-js/
 * @param {string} backgroundColor
 */
function textColor(backgroundColor) {
	const [r, g, b] = colorValues(backgroundColor),
		yiq = (r * 299 + g * 587 + b * 114) / 1000
	return yiq < 128 ? "white" : "black"
}

const css = noopTag
