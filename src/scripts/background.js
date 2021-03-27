browser.runtime.onConnect.addListener(port => {
	const { url } = port.sender
	console.log(url)
})

browser.browserAction.onClicked.addListener(() => browser.storage.local.set({ popupShow: true }))
