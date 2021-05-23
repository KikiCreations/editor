import { ArrayTree } from './Tree/ArrayTree'
import { ObjectTree } from './Tree/ObjectTree'
import { PrimitiveTree } from './Tree/PrimitiveTree'
import { TPrimitiveTree } from './Tree/Tree'

export class TreeSelection {
	constructor(protected tree: ArrayTree | ObjectTree) {
		tree.isSelected = true
	}

	getTree() {
		return this.tree
	}

	dispose() {
		this.tree.isSelected = false
	}

	edit(value: string) {
		const parent = this.tree.getParent()
		if (!parent) throw new Error(`Cannot edit property name without parent`)
		if (parent instanceof ArrayTree)
			throw new Error(`Cannot edit array indices`)

		// The tree key must be of type string because of the instanceof check above
		parent.updatePropertyName(<string>this.tree.key, value)
	}

	addKey(key: string) {
		const newTree = new ObjectTree(this.tree, {})
		if (this.tree instanceof ArrayTree) this.tree.children.push(newTree)
		else this.tree.children[key] = this.tree.children[key] = newTree

		this.tree.isSelected = false
		newTree.isSelected = true
		this.tree = newTree
	}

	addValue(value: TPrimitiveTree) {
		if (Object.keys(this.tree.children).length !== 0) return

		this.tree.replace(new PrimitiveTree(this.tree.getParent(), value))
	}
}

export class TreeValueSelection {
	constructor(protected tree: PrimitiveTree) {
		tree.isValueSelected = true
	}

	getTree() {
		return this.tree
	}

	dispose() {
		this.tree.isValueSelected = false
	}

	edit(value: string) {
		this.tree.setValue(value)
	}
}
