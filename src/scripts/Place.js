const TILE_W = 291,
	TILE_H = 281,
	RADIUS = 12

class Place extends HTMLElement {
	constructor() {
		super()
		this.zoom = 1
		this.offset = [0, 0]

		this.attachShadow({ mode: "open" })

		this.canvas = document.createElement("canvas")
		this.shadowRoot.append(this.canvas)

		this.ctx = this.canvas.getContext("2d")

		/** @type {{ [name:string]: HTMLImageElement }} */
		this.imageMap = {}
		this.loaded = false
		Place.loadImages()
			.then(map => {
				this.imageMap = map
				this.loaded = true
				Place.render(this)
			})
			.catch(console.error)

		const style = document.createElement("style")
		style.textContent = Place.css
		this.shadowRoot.append(style)

		this.canvas.addEventListener(
			"wheel",
			/** @param {WheelEvent} e */
			e => {
				e.preventDefault()
				this.zoom = clamp(this.zoom + Math.sign(e.deltaY) * -0.5, 0.5, 3)
				Place.render(this)
			},
		)

		const cleanup = () => {
			window.removeEventListener("mousemove", cb)
			this.removeEventListener("mouseup", cleanup)
		}
		/**
		 * @param {MouseEvent} e
		 */
		const cb = e => {
			this.offset[0] += e.movementX
			this.offset[1] += e.movementY
			Place.render(this)
		}

		this.canvas.addEventListener("mousedown", () => {
			window.addEventListener("mousemove", cb)
			window.addEventListener("mouseup", cleanup)
		})
	}

	attributeChangedCallback(name, old, value) {
		switch (name) {
			case "width":
				this.canvas.setAttribute("width", value)
				break
			case "height":
				this.canvas.setAttribute("height", value)
				break
		}
		Place.render(this)
	}

	/**
	 * @param {Place} self
	 */
	static render(self) {
		if (!self.loaded) return

		const { grass } = self.imageMap,
			{ width, height } = self.canvas,
			[offsetX, offsetY] = self.offset
		// prng = str2prng(location.host)

		self.ctx.clearRect(0, 0, width, height)
		self.ctx.resetTransform()
		self.ctx.imageSmoothingEnabled = false
		self.ctx.save()
		self.ctx.translate(Math.floor(width / 2) + offsetX, Math.floor(height / 2) + offsetY)
		self.ctx.scale(self.zoom, self.zoom)

		for (let y = 0; y < RADIUS; y++) {
			for (let x = 0; x < RADIUS; x++) {
				if (Math.hypot(x + 0.5 - RADIUS / 2, y + 0.5 - RADIUS / 2) > RADIUS / 2) continue
				self.ctx.drawImage(
					grass,
					(x - y - 1) * (TILE_W / 8),
					(y + x - RADIUS) * (TILE_H / 13.6), // ¯\_(ツ)_/¯
					TILE_W / 4,
					TILE_H / 4,
				)
			}
		}

		self.ctx.restore()
	}

	static get observedAttributes() {
		return ["width", "height"]
	}

	/**
	 * @returns {Promise<{ [name:string]: HTMLImageElement }>}
	 */
	static loadImages() {
		const names = ["grass"],
			map = {}
		return new Promise((resolve, reject) => {
			names.forEach(name => {
				const image = new Image(TILE_W, TILE_H)
				image.src = browser.runtime.getURL(`sprites/${name}.png`)
				image.onload = () => {
					map[name] = image
					if (Object.keys(map).length == names.length) resolve(map)
				}
				image.onerror = err => reject(err)
			})
		})
	}

	static get css() {
		return css`
			:host {
				height: 100%;
				width: 100%;
			}
			canvas {
				height: 100%;
				width: 100%;
				image-rendering: crisp-edges;
			}
		`
	}
}

define("mixcoatl-place", Place)
