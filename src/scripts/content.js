async function start() {
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
	const [widthStore, heightStore, verticalStore, horizontalStore, hideStore] = await syncPropsWithLocalStore(
		popup,
		["popupWidth", "width", 300],
		["popupHeight", "height", 400],
		["popupVertical", "vertical", "top"],
		["popupHorizontal", "horizontal", "right"],
		["popupHide", "hidden", false],
	)
	document.body.append(popup)

	browser.storage.onChanged.addListener(changes => {
		const newValue = changes.popupHide?.newValue
		if (newValue != undefined) hideStore.set(newValue)
	})

	const place = document.createElement("mixcoatl-place")
	widthStore.subscribe(value => place.setAttribute("width", value))
	heightStore.subscribe(value => place.setAttribute("height", value))
	popup.append(place)

	const port = browser.runtime.connect()
}

if ("customElements" in globalThis) start()
