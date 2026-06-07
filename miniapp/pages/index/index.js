const storage = require('../../utils/storage');

Page({
  data: {
    keyword: '',
    activeCategory: '',
    categories: [],
    templates: [],
    filteredList: []
  },

  onShow() {
    this.loadData();
  },

  loadData() {
    const templates = storage.getAll();
    const categories = storage.getCategories();
    this.setData({ templates, categories });
    this.filterList();
  },

  onSearch(e) {
    this.setData({ keyword: e.detail.value });
    this.filterList();
  },

  switchCategory(e) {
    this.setData({ activeCategory: e.currentTarget.dataset.cat });
    this.filterList();
  },

  filterList() {
    const { templates, keyword, activeCategory } = this.data;
    let list = templates;

    if (activeCategory) {
      list = list.filter(t => t.category === activeCategory);
    }
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      list = list.filter(t => t.content.toLowerCase().includes(kw) || t.category.toLowerCase().includes(kw));
    }

    this.setData({ filteredList: list });
  },

  copyContent(e) {
    const content = e.currentTarget.dataset.content;
    wx.setClipboardData({
      data: content,
      success() {
        wx.showToast({ title: '已复制', icon: 'success', duration: 1500 });
      }
    });
  },

  addTemplate() {
    wx.navigateTo({ url: '/pages/edit/edit' });
  },

  editTemplate(e) {
    wx.navigateTo({ url: '/pages/edit/edit?id=' + e.currentTarget.dataset.id });
  },

  deleteTemplate(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复',
      success: (res) => {
        if (res.confirm) {
          storage.remove(id);
          this.loadData();
          wx.showToast({ title: '已删除', icon: 'none' });
        }
      }
    });
  },

  manageCategories() {
    const self = this;
    wx.showActionSheet({
      itemList: this.data.categories,
      success(res) {
        const idx = res.tapIndex;
        wx.showModal({
          title: '删除分类',
          content: '确认删除"' + self.data.categories[idx] + '"？',
          success(r) {
            if (r.confirm) {
              const cats = self.data.categories.filter((_, i) => i !== idx);
              storage.saveCategories(cats);
              self.setData({ categories: cats, activeCategory: '' });
              self.filterList();
            }
          }
        });
      }
    });
  }
});