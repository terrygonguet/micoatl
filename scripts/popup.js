/**
 * @typedef {CustomEvent<[string, string]>} PinEvent
 */

/**
 * @typedef {CustomEvent<{ direction: "vertical" | "horizontal", size: number }>} ResizeEvent
 */

class Popup extends HTMLElement {
	constructor() {
		super()

		this.attachShadow({ mode: "open" })

		const vertical = this.getAttribute("vertical") ?? "top",
			horizontal = this.getAttribute("horizontal") ?? "right"

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
				this.dispatchEvent(new CustomEvent("pin", { detail: [vertical, horizontal] })),
			)
			this.shadowRoot.append(handle)
		}

		const resizeH = document.createElement("button")
		resizeH.classList.add("resize-handle-horizontal")
		makeResizeHandle(resizeH, e => {
			const { pageX } = e,
				{ left, right } = this.getBoundingClientRect(),
				horizontal = this.getAttribute("horizontal") ?? "right",
				width = horizontal == "left" ? pageX - left : right - pageX
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
			const { pageY } = e,
				{ top, bottom } = this.getBoundingClientRect(),
				vertical = this.getAttribute("vertical") ?? "top",
				height = vertical == "top" ? pageY - top : bottom - pageY
			this.dispatchEvent(
				new CustomEvent("resize", {
					detail: { direction: "vertical", size: clamp(height, 50, innerHeight - 50) },
				}),
			)
		})
		this.shadowRoot.append(resizeV)

		Popup.updateStyles(this)
	}

	connectedCallback() {
		Popup.updateStyles(this)
	}

	attributeChangedCallback(name, old, value) {
		Popup.updateStyles(this)
	}

	static get observedAttributes() {
		return ["width", "height", "vertical", "horizontal"]
	}

	/**
	 * @param {HTMLElement} elem
	 */
	static updateStyles(elem) {
		const width = elem.getAttribute("width") ?? "300px",
			height = elem.getAttribute("height") ?? "300px",
			vertical = elem.getAttribute("vertical") ?? "top",
			horizontal = elem.getAttribute("horizontal") ?? "right"

		let style = elem.shadowRoot.querySelector("style") ?? document.createElement("style")
		elem.shadowRoot.append(style)

		style.textContent = css`
			:host {
				position: absolute;
				${vertical}: 0;
				${horizontal}: 0;
				width: ${width};
				height: ${height};
				background-color: beige;
				margin: 0.25rem;
				border: 1px solid black;
				padding: 0.5rem;
				z-index: 999;
			}
			button {
				position: absolute;
				padding: 0;
				border: none;
				background-color: transparent;
				cursor: pointer;
			}
			.pin-handle {
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
