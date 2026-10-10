export const analyticsConfig = {
  enabled: true,
  provider: '51la',
  scriptUrl: 'https://sdk.51.la/js-sdk-pro.min.js',
  siteId: '3QWnhGXlcMmbY41B',
  checkKey: '3QWnhGXlcMmbY41B',
  publicCounter: {
    enabled: true,
    scriptUrl: 'https://cdn.busuanzi.cc/busuanzi/3.6.9/busuanzi.min.js',
    timeoutMs: 12_000,
    unavailableLabel: '暂不可用',
    articleLoadingTitle: '历史阅读量；本站新增阅读量正在加载',
    articleReadyTitle: '历史阅读量与本站新阅读量之和',
    articleFallbackTitle: '新增阅读量暂不可用，当前仅显示历史阅读量',
  },
} as const;
