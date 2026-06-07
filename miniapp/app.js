const storage = require('./utils/storage');

App({
  onLaunch() {
    storage.ensureDefaults();
  },
  globalData: {
    categories: ["术后叮嘱", "检查通知", "用药说明", "日常问候", "其他"]
  }
});