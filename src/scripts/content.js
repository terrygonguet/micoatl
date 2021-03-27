async function start() {
	const defaultSettings = {
			popupVertical: "top",
			popupHorizontal: "right",
			popupWidth: 300,
			popupHeight: 400,
			popupShow: true,
		},
		[widthStore, heightStore, verticalStore, horizontalStore, showStore] = await Promise.all([
			localStore("popupWidth"),
			localStore("popupHeight"),
			localStore("popupVertical"),
			localStore("popupHorizontal"),
			localStore("popupShow"),
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
	widthStore.subscribe(popupWidth => popup.setAttribute("width", popupWidth))
	heightStore.subscribe(popupHeight => popup.setAttribute("height", popupHeight))
	verticalStore.subscribe(popupVertical => popup.setAttribute("vertical", popupVertical))
	horizontalStore.subscribe(popupHorizontal => popup.setAttribute("horizontal", popupHorizontal))
	showStore.subscribe(showStore => (popup.style.display = showStore ? "block" : "none"))
	document.body.append(popup)
}

if ("customElements" in globalThis) start()
