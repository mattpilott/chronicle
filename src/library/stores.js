import { writable } from 'svelte/store'
import { storable } from '@neuekit/utils'

export let ui = writable()
export let prefs = storable(0, import.meta.env.name)
export let feeds = storable([], import.meta.env.name)
