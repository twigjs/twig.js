import { defineConfig } from "vitepress";
import { shared } from "./shared.mjs";
import { zh } from "./zh.mjs";
import { en } from "./en.mjs";



const config = {
    ...shared,

    locales: {
        root: { label: "English", ...en },
        zh: { label: "简体中文", ...zh },
    },
}




export default defineConfig(config);
