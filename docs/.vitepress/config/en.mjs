import { defineConfig } from "vitepress";

export const en = defineConfig({
  lang: "en-US",
  description: "JS port of the Twig templating language",

  themeConfig: {
    nav: nav(),

    sidebar: {
      "/guide/": { base: "/guide/", items: sidebarGuide() },
      "/reference/": {
        base: "/reference/",
        items: sidebarReference()
      }
    },

    editLink: {
      pattern:
        "https://github.com/twigjs/twig.js/edit/master/docs/:path",
      text: "Edit this page on GitHub"
    },

    outline: {
      level: "deep"
    },

    footer: {
      message: "Docs released under the MIT License.",
      copyright: `Copyright © ${new Date().getFullYear()} twig.js`
    }
  }
});

function nav() {
  return [
    {
      text: "Guide",
      link: "/guide/what-is-it",
      activeMatch: "/guide/"
    },
    {
      text: "Reference",
      link: "/reference/compiling-templates",
      activeMatch: "/reference/"
    },
    {
      text: "1.7.1",
      items: [
        {
          text: "Release Notes",
          link:
            "https://github.com/twigjs/twig.js/releases/tag/v1.17.1",
          target: "_blank"
        },
        {
          text: "Contributing",
          link:
            "https://github.com/twigjs/twig.js/blob/master/.github/contributing.md",
          target: "_blank"
        }
      ]
    }
  ];
}

function sidebarGuide() {
  return [
    {
      text: "introduce",
      items: [
        { text: "What is it?", link: "what-is-it" },
        { text: "Getting Started", link: "getting-started" },
        { text: "Using twig.js", link: "using-twigjs" },
        { text: "Available Extensions", link: "available-extensions" }
      ]
    }
  ];
}

function sidebarReference() {
  return [
    {
      text: "Reference",
      items: [
        { text: "Compiling Templates", link: "compiling-templates" },
        { text: "Extending twig.js", link: "extending-twigjs" },
        {
          text: "Extending twig.js With Custom Tags",
          link: "extending-twigjs-with-custom-tags"
        },
        {
          text: "Implementation Notes",
          link: "implementation-notes"
        }
      ]
    }
  ];
}
