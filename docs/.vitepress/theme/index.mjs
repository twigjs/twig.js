// .vitepress/theme/index.js
import DefaultTheme from "vitepress/theme";
import { watch } from "vue";
import { useRoute } from "vitepress";

import "./custom.css";

export default {
  ...DefaultTheme,
  setup() {
    const route = useRoute();
    watch(
      () => route.path,
    );
  },
};
