import js from "@eslint/js";
import globals from "globals";
import {defineConfig} from "eslint/config";

export default defineConfig([
    {
        files: ["src/*.{js}", "test/*.{js}", "bin/*.{js}"],
        plugins: {js},
        extends: ["js/recommended"],
        languageOptions: {globals: globals.browser}
    },
]);
