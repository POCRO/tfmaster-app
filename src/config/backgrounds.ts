// 背景图片配置文件
// 修改这里的路径即可更换对应页面的背景图片

export const backgrounds = {
  // 首页背景
  home: '/design_images/pexels-eliannedipp-4666750.jpg',

  // 背诵页面背景（包括学习、复习、单词详情、完成页面）
  quiz: '/design_images/pexels-berend-1452701.jpg',

  // 范文跟读列表页面背景
  readingList: '/design_images/pexels-nicolas-lesueur-912957568-20083342.jpg',

  // 范文详情页面背景
  readingDetail: '/design_images/pexels-nicolas-lesueur-912957568-20083342.jpg',
};

// 遮罩层透明度配置（0-1之间，0为完全透明，1为完全不透明）
export const overlayOpacity = {
  home: 0.75,
  quiz: 0.80,
  readingList: 0.80,
  readingDetail: 0.80,
};
