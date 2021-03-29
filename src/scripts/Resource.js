class Resource {
	/**
	 * @param {string} id
	 * @param {string} color
	 * @param {"white" | "black" | undefined} textColor
	 */
	constructor(id, color, textColor) {
		this.id = id
		this.name = browser.i18n.getMessage(this.id + "ResourceName") || this.id
		this.description = browser.i18n.getMessage(this.id + "ResourceDescription")
		this.color = color
		this.textColor = textColor ?? textColor(this.color)
	}

	/**
	 * @returns {Resource[]}
	 */
	static getAllResources() {
		return Object.values(Resource).filter(val => val instanceof Resource)
	}

	// static Wood = new Resource("wood", "saddlebrown", "white")
	// static CyanStone = new Resource("cyanStone", "paleturquoise", "black")
	// static MagentaStone = new Resource("magentaStone", "palevioletred", "black")
	// static YellowStone = new Resource("yellowStone", "beige", "black")
	// static BlackStone = new Resource("blackStone", "#111", "white")
	// static BlueOre = new Resource("blueOre", "slateblue", "white")
	// static GreenOre = new Resource("greenOre", "darkseagreen", "black")
	// static RedOre = new Resource("redOre", "indianred", "white")
	// static WhiteOre = new Resource("whiteOre", "white", "black")
}
