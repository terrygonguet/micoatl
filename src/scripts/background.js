/** @type {Map<string, any>} */
const cache = new Map()

browser.runtime.onConnect.addListener(port => {
	const url = new URL(port.sender.url)

	if (!cache.has(url.host)) cache.set(url.host, new Host(url.host))
	const host = cache.get(url.host)

	console.log(host, cache)
})

browser.browserAction.onClicked.addListener(() => browser.storage.local.set({ popupHide: false }))
