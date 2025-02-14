<template>
	<!-- body-1 class sets the font-size -->
	<div
		class="body-1"
		v-if="directoryEntry && !directoryEntry.isLoading && isPackIndexerReady"
	>
		<template v-for="entry in directoryEntry.children">
			<!-- FOLDER -->
			<details
				class="folder"
				v-if="!entry.isFile"
				:key="entry.uuid"
				:open="entry.isFolderOpen"
			>
				<summary
					class="d-flex rounded-lg"
					@click.prevent="onClick(entry)"
					@click.right.prevent.stop="
						$emit('contextmenu', {
							type: entry.type,
							path: entry.path.join('/'),
							clientX: $event.clientX,
							clientY: $event.clientY,
							entry,
						})
					"
					v-ripple
				>
					<v-icon class="pr-1" :color="entry.color" small>
						{{
							entry.isFolderOpen
								? 'mdi-folder-open'
								: 'mdi-folder'
						}}
					</v-icon>
					<span class="folder">{{ entry.name }}</span>
				</summary>

				<FileDisplayer
					@closeWindow="$emit('closeWindow')"
					@contextmenu="$emit('contextmenu', $event)"
					:entry="entry"
				/>
			</details>
			<!--FILE-->
			<div
				v-else
				:key="entry.uuid"
				class="file rounded-lg"
				@click.stop="onClick(entry)"
				@click.right.prevent.stop="
					$emit('contextmenu', {
						type: 'file',
						path: entry.path.join('/'),
						clientX: $event.clientX,
						clientY: $event.clientY,
						entry,
					})
				"
				v-ripple
			>
				<v-icon :color="entry.color" small>
					{{ entry.icon || 'mdi-file-outline' }}
				</v-icon>
				{{ entry.name }}
			</div>
		</template>
	</div>

	<v-progress-linear v-else indeterminate />
</template>

<script>
import { DirectoryEntry } from './DirectoryEntry'
import { App } from '/@/App.ts'
import { PackIndexerMixin } from '/@/components/Mixins/Tasks/PackIndexer'

export default {
	name: 'FileDisplayer',
	mixins: [PackIndexerMixin],
	props: {
		entry: Object,
		startPath: Array,
	},

	mounted() {
		this.loadDirectory()
	},
	data: () => ({
		directoryEntry: null,
		tree: [],
	}),
	methods: {
		async loadDirectory() {
			if (!this.entry) {
				const app = await App.getApp()
				await app.projectManager.projectReady.fired

				app.project.packIndexer.once(async () => {
					this.directoryEntry = await DirectoryEntry.create(
						this.startPath
					)
				})
			} else {
				this.directoryEntry = this.entry
			}
		},
		onClick(entry) {
			const shouldCloseWindow = entry.open()
			if (shouldCloseWindow) this.$emit('closeWindow')
		},
	},
	watch: {
		startPath() {
			this.loadDirectory()
		},
		entry() {
			this.loadDirectory()
		},
	},
}
</script>

<style scoped>
div {
	padding-left: 0.5em;
}
div.file {
	cursor: pointer;
	overflow-x: auto;
	overflow-y: hidden;
	white-space: nowrap;
}
div.file::-webkit-scrollbar,
span.folder::-webkit-scrollbar {
	width: 2px;
	height: 2px;
}
span.folder {
	overflow-x: auto;
	white-space: nowrap;
}

.file,
.folder {
	/** New web thingy: https://web.dev/content-visibility/ */
	content-visibility: auto;
	contain-intrinsic-size: 24px;
}

summary {
	outline: none;
	cursor: pointer;
	display: block;
}
details[open] > summary > .open {
	display: inline;
}
details > summary > .open {
	display: none;
}
details[open] > summary > .closed {
	display: none;
}
details > summary > .closed {
	display: inline;
}

.file-displayer {
	overflow-y: auto;
}
</style>
