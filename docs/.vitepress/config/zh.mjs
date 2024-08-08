import { defineConfig } from "vitepress";

export const zh = defineConfig({
  lang: "zh-Hans",
  description: "Twig模板语言的JS移植",

  themeConfig: {
    nav: nav(),

    sidebar: {
      "/zh/guide/": { base: "/zh/guide/", items: sidebarGuide() },
      "/zh/reference/": {
        base: "/zh/reference/",
        items: sidebarReference()
      }
    },

    editLink: {
      pattern: "https://github.com/twigjs/twig.js/edit/master/docs/:path",
      text: "在 GitHub 上编辑此页面"
    },

    footer: {
      message: "该文档 基于 MIT 许可发布",
      copyright: `版权所有 © ${new Date().getFullYear()} twig.js`
    },

    docFooter: {
      prev: "上一页",
      next: "下一页"
    },

    outline: {
      label: "页面导航",
      level: "deep"
    },

    lastUpdated: {
      text: "最后更新于",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium"
      }
    },

    langMenuLabel: "多语言",
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",

    notFound: {
      title: "找不到页面",
      quote: "如果你不改变方向，并且一直走下去，你最终会到达现在前进的地方",
      linkLabel: "回到首页",
      linkText: "带我回家"
    }
  }
});

function nav() {
  return [
    {
      text: "指南",
      link: "/zh/guide/what-is-it",
      activeMatch: "/zh/guide/"
    },
    {
      text: "参考",
      link: "/zh/reference/compiling-templates",
      activeMatch: "/zh/reference/"
    },
    {
      text: "1.7.1",
      items: [
        {
          text: "变更日志",
          link: "https://github.com/twigjs/twig.js/releases/tag/v1.17.1",
          target: "_blank"
        },
        {
          text: "贡献指南",
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
      text: "介绍",
      items: [
        { text: "是什么?", link: "what-is-it" },
        { text: "快速开始", link: "getting-started" }
      ]
    }
  ];
}

function sidebarReference() {
  return [
    {
      text: "参考",
      items: [{ text: "编译模板", link: "compiling-templates" }]
    }
  ];
}

export const search = {
  zh: {
    placeholder: "搜索文档",
    translations: {
      button: {
        buttonText: "搜索文档",
        buttonAriaLabel: "搜索文档"
      },
      modal: {
        searchBox: {
          resetButtonTitle: "清除查询条件",
          resetButtonAriaLabel: "清除查询条件",
          cancelButtonText: "取消",
          cancelButtonAriaLabel: "取消"
        },
        startScreen: {
          recentSearchesTitle: "搜索历史",
          noRecentSearchesText: "没有搜索历史",
          saveRecentSearchButtonTitle: "保存至搜索历史",
          removeRecentSearchButtonTitle: "从搜索历史中移除",
          favoriteSearchesTitle: "收藏",
          removeFavoriteSearchButtonTitle: "从收藏中移除"
        },
        errorScreen: {
          titleText: "无法获取结果",
          helpText: "你可能需要检查你的网络连接"
        },
        footer: {
          selectText: "选择",
          navigateText: "切换",
          closeText: "关闭",
          searchByText: "搜索提供者"
        },

        noResultsText: "无法找到相关结果",
        resetButtonTitle: "重置搜索",
        displayDetails: "显示详情视图",
        noResultsScreen: {
          noResultsText: "无法找到相关结果",
          suggestedQueryText: "你可以尝试查询",
          reportMissingResultsText: "你认为该查询应该有结果？",
          reportMissingResultsLinkText: "点击反馈"
        }
      }
    }
  }
};
