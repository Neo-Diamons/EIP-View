import { writable } from "svelte/store";
import { browser } from "$app/environment";

const stored = browser ? localStorage.token : null;
export const auth = writable(stored || "");

if (browser) {
	auth.subscribe((value) => (localStorage.token = value));
}
