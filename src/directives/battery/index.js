import Vue from 'vue';
require('./index.scss');

Vue.directive('battery', {
  update(el, binding) {
    let color = '#13CE66';
    if (binding.value <= 20) {
      color = '#FF4949';
    }

    el.innerHTML = `<i class="battery-icon"></i>
                    <span class="battery-vol" style="width:${30 * binding.value / 100}px;background: ${color}"></span>
                    <span class="battery-text">${binding.value}%</span>`;
    el.className = 'battery-icon-wrap';
  }
});
