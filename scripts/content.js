async function start() {
	const defaultPopup = {
			vertical: "top",
			horizontal: "right",
			width: "300px",
			height: "400px",
		},
		settings = await browser.storage.local.get({ popup: defaultPopup })

	try {
		customElements.define("mixcoatl-popup", Popup)
	} catch (err) {
		location.reload()
	}

	const popup = document.createElement("mixcoatl-popup")
	for (const name in settings.popup) {
		popup.setAttribute(name, settings.popup[name])
	}
	popup.addEventListener(
		"pin",
		/** @param {PinEvent} e */
		async e => {
			const settings = await browser.storage.local.get({ popup: defaultPopup }),
				[vertical, horizontal] = e.detail,
				{ width, height } = settings.popup
			await browser.storage.local.set({
				popup: {
					vertical,
					horizontal,
					width,
					height,
				},
			})
		},
	)
	popup.addEventListener(
		"resize",
		/** @param {ResizeEvent} e */
		async e => {
			const settings = await browser.storage.local.get({ popup: defaultPopup }),
				{ direction, size } = e.detail,
				{ vertical, horizontal, width, height } = settings.popup
			await browser.storage.local.set({
				popup: {
					vertical,
					horizontal,
					width: direction == "horizontal" ? size + "px" : width,
					height: direction == "vertical" ? size + "px" : height,
				},
			})
		},
	)
	document.body.append(popup)

	browser.storage.onChanged.addListener(changes => {
		const change = changes.popup
		if (!change) return
		for (const name in change.newValue) {
			popup.setAttribute(name, change.newValue[name])
		}
	})
}

if ("customElements" in globalThis) start()
