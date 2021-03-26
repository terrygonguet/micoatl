browser.runtime.onConnect.addListener(port => {
	const { url } = port.sender
	console.log(url)
})
