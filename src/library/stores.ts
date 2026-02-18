import { writable } from 'svelte/store'
import { storable } from 'kitto/svelte'

export const ui = writable()
export const prefs = storable(0, import.meta.env.name)
export const feeds = storable([], import.meta.env.name)
