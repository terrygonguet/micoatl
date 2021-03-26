/**
 *
 * @param {TemplateStringsArray} strings
 * @param  {...any} args
 * @returns {string}
 */
function noopTag(strings, ...args) {
	return strings.reduce((acc, cur, i) => acc + cur + (args[i] ?? ""), "")
}

/**
 * @param {number} n
 * @param {number} min
 * @param {number} max
 */
function clamp(n, min, max) {
	return Math.max(min, Math.min(max, n))
}

const css = noopTag
