async function start() {
	const defaultSettings = {
			popupVertical: "top",
			popupHorizontal: "right",
			popupWidth: 300,
			popupHeight: 400,
			popupHide: false,
		},
		[widthStore, heightStore, verticalStore, horizontalStore, hideStore] = await Promise.all([
			localStore("popupWidth", defaultSettings.popupWidth),
			localStore("popupHeight", defaultSettings.popupHeight),
			localStore("popupVertical", defaultSettings.popupVertical),
			localStore("popupHorizontal", defaultSettings.popupHorizontal),
			localStore("popupHide", defaultSettings.popupHide),
		])

	try {
		customElements.define("mixcoatl-popup", Popup)
	} catch (err) {
		location.reload()
	}

	const popup = document.createElement("mixcoatl-popup")
	popup.addEventListener(
		"pin",
		/** @param {PinEvent} e */
		async e => {
			const { vertical, horizontal } = e.detail
			verticalStore.set(vertical)
			horizontalStore.set(horizontal)
		},
	)
	popup.addEventListener(
		"resize",
		/** @param {ResizeEvent} e */
		async e => {
			const { direction, size } = e.detail
			if (direction == "horizontal") widthStore.set(size)
			else heightStore.set(size)
		},
	)
	popup.addEventListener("close", () => hideStore.set(true))

	widthStore.subscribe(popupWidth => popup.setAttribute("width", popupWidth))
	heightStore.subscribe(popupHeight => popup.setAttribute("height", popupHeight))
	verticalStore.subscribe(popupVertical => popup.setAttribute("vertical", popupVertical))
	horizontalStore.subscribe(popupHorizontal => popup.setAttribute("horizontal", popupHorizontal))
	hideStore.subscribe(popupHide => popup.setAttribute("hidden", popupHide))

	document.body.append(popup)

	browser.storage.onChanged.addListener(changes => {
		if (changes.popupHide?.newValue == false) hideStore.set(false)
	})

	const port = browser.runtime.connect()
}

if ("customElements" in globalThis) start()
