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

async function localStore(key) {
	const local = await browser.storage.local.get(key),
		store = writable(local[key])
	store.subscribe(nextValue => browser.storage.local.set({ [key]: nextValue }))
	return store
}

const css = noopTag
