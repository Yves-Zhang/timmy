import Vue from 'vue';

Vue.directive('focus', {
  inserted(el) {
    // 输入框自动焦点
    if (el.tagName === 'INPUT') {
      el.focus();
    } else if (el.className === 'el-input') {
      el.children[0].focus();
    }
  }
});
