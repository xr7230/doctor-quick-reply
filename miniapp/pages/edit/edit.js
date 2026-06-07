const storage = require('../../utils/storage');

Page({
  data: {
    id: null,
    isEdit: false,
    content: '',
    categoryIndex: 0,
    categories: []
  },

  onLoad(options) {
    const categories = storage.getCategories();
    if (options.id) {
      const templates = storage.getAll();
      const item = templates.find(t => t.id === options.id);
      if (item) {
        const idx = categories.indexOf(item.category);
        this.setData({
          id: options.id,
          isEdit: true,
          content: item.content,
          categoryIndex: idx > -1 ? idx : 0,
          categories
        });
        wx.setNavigationBarTitle({ title: '编辑模板' });
        return;
      }
    }
    this.setData({ categories });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onCategoryChange(e) {
    this.setData({ categoryIndex: parseInt(e.detail.value) });
  },

  save() {
    const { content, categoryIndex, categories } = this.data;
    if (!content.trim()) {
      wx.showToast({ title: '请输入内容', icon: 'none' });
      return;
    }
    const category = categories[categoryIndex] || categories[0];
    const item = { content: content.trim(), category };

    if (this.data.isEdit) {
      storage.update(this.data.id, item);
    } else {
      storage.add(item);
    }

    wx.showToast({ title: '已保存', icon: 'success' });
    setTimeout(() => wx.navigateBack(), 800);
  },

  confirmDelete() {
    const self = this;
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复',
      success(res) {
        if (res.confirm) {
          storage.remove(self.data.id);
          wx.showToast({ title: '已删除', icon: 'none' });
          setTimeout(() => wx.navigateBack(), 800);
        }
      }
    });
  }
});