/**
 * @typedef {CustomEvent<{ vertical: "top" | "bottom", horizontal: "left" | "right" }>} PinEvent
 */

/**
 * @typedef {CustomEvent<{ direction: "vertical" | "horizontal", size: number }>} ResizeEvent
 */

class Popup extends HTMLElement {
	constructor() {
		super()

		this.attachShadow({ mode: "open" })

		const pinHandles = [
			[document.createElement("button"), "top", "left", ""],
			[document.createElement("button"), "top", "right", "scaleX(-1)"],
			[document.createElement("button"), "bottom", "right", "scale(-1, -1)"],
			[document.createElement("button"), "bottom", "left", "scaleY(-1)"],
		]
		for (const [handle, vertical, horizontal, scale] of pinHandles) {
			handle.classList.add("pin-handle")
			handle.style[vertical] = 0
			handle.style[horizontal] = 0
			handle.textContent = "⇱"
			handle.style.transform = scale
			handle.id = `pin-handle-${vertical}-${horizontal}`
			handle.addEventListener("click", () =>
				this.dispatchEvent(new CustomEvent("pin", { detail: { vertical, horizontal } })),
			)
			this.shadowRoot.append(handle)
		}

		const resizeH = document.createElement("button")
		resizeH.classList.add("resize-handle-horizontal")
		makeResizeHandle(resizeH, e => {
			const { clientX } = e,
				{ left, right } = this.getBoundingClientRect(),
				horizontal = this.getAttribute("horizontal") ?? "right",
				width = horizontal == "left" ? clientX - left : right - clientX
			this.dispatchEvent(
				new CustomEvent("resize", {
					detail: { direction: "horizontal", size: clamp(width, 50, innerWidth - 50) },
				}),
			)
		})
		this.shadowRoot.append(resizeH)

		const resizeV = document.createElement("button")
		resizeV.classList.add("resize-handle-vertical")
		makeResizeHandle(resizeV, e => {
			const { clientY } = e,
				{ top, bottom } = this.getBoundingClientRect(),
				vertical = this.getAttribute("vertical") ?? "top",
				height = vertical == "top" ? clientY - top : bottom - clientY
			this.dispatchEvent(
				new CustomEvent("resize", {
					detail: { direction: "vertical", size: clamp(height, 50, innerHeight - 50) },
				}),
			)
		})
		this.shadowRoot.append(resizeV)

		const close = document.createElement("button")
		close.classList.add("close-handle")
		close.textContent = "×"
		close.addEventListener("click", () => this.dispatchEvent(new CustomEvent("close")))
		this.shadowRoot.append(close)

		const container = document.createElement("div")
		container.id = "container"
		this.shadowRoot.append(container)

		const slot = document.createElement("slot")
		container.append(slot)

		Popup.updateStyles(this)
	}

	connectedCallback() {
		Popup.updateStyles(this)
	}

	attributeChangedCallback(name, old, value) {
		Popup.updateStyles(this)
	}

	static get observedAttributes() {
		return ["width", "height", "vertical", "horizontal", "hidden"]
	}

	/**
	 * @param {HTMLElement} elem
	 */
	static updateStyles(elem) {
		const width = elem.getAttribute("width") ?? "300",
			height = elem.getAttribute("height") ?? "300",
			vertical = elem.getAttribute("vertical") ?? "top",
			horizontal = elem.getAttribute("horizontal") ?? "right",
			hidden = (elem.getAttribute("hidden") ?? "true") == "true"

		let style = elem.shadowRoot.querySelector("style") ?? document.createElement("style")
		elem.shadowRoot.append(style)

		style.textContent = css`
			* {
				box-sizing: border-box;
				font-family: sans-serif;
			}
			:host {
				position: fixed;
				${vertical}: 0;
				${horizontal}: 0;
				width: ${width}px;
				height: ${height}px;
				display: ${hidden ? "none" : "block"};
				margin: 0.25rem;
				border: 1px solid black;
				z-index: 999;
				color: white;

				background-color: black;
				background-image: radial-gradient(white, rgba(255, 255, 255, 0.2) 2px, transparent 40px),
					radial-gradient(white, rgba(255, 255, 255, 0.15) 1px, transparent 30px),
					radial-gradient(white, rgba(255, 255, 255, 0.1) 2px, transparent 40px),
					radial-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1) 2px, transparent 30px);
				background-size: 550px 550px, 350px 350px, 250px 250px, 150px 150px;
				background-position: 0 0, 40px 60px, 130px 270px, 70px 100px;
			}
			#container {
				display: flex;
				flex-direction: column;
				height: 100%;
				overflow-y: auto;
			}
			button {
				position: absolute;
				padding: 0;
				border: none;
				background-color: transparent;
				cursor: pointer;
				color: white;
			}
			.pin-handle,
			.close-handle {
				width: 1rem;
				height: 1rem;
			}
			#pin-handle-${vertical}-${horizontal} {
				display: none;
			}
			.resize-handle-horizontal {
				top: 50%;
				transform: translateY(-50%);
				height: 90%;
				width: 10px;
				${horizontal == "right" ? "left" : "right"}: -5px;
				cursor: ew-resize;
			}
			.resize-handle-vertical {
				left: 50%;
				transform: translateX(-50%);
				width: 90%;
				height: 10px;
				${vertical == "top" ? "bottom" : "top"}: -5px;
				cursor: ns-resize;
			}
			.close-handle {
				${vertical}: 0;
				${horizontal}: 0;
			}
		`
	}
}

/**
 * @param {HTMLElement} elem
 * @param {(e: MouseEvent) => void} cb
 */
function makeResizeHandle(elem, cb) {
	function cleanup() {
		window.removeEventListener("mousemove", cb)
		elem.removeEventListener("mouseup", cleanup)
	}

	elem.addEventListener("mousedown", () => {
		window.addEventListener("mousemove", cb)
		window.addEventListener("mouseup", cleanup)
	})
}

define("mixcoatl-popup", Popup)
