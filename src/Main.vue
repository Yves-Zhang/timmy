<template>
  <div id="root">
    <header-component :is-full.sync="isFull" :full-fn="toggleFull"></header-component>
    <section :style="{'min-height': `${window.innerHeight - 70 - 40}px`}" class="main-wrapper" :class="{w: !isFull, full: isFull}">
      <router-view :is-full.sync="isFull" :full-fn="toggleFull"></router-view>
    </section>
    <footer-component v-show="!isFull"></footer-component>
  </div>
</template>

<script>
import Header from './layout/header/Header.vue';
import Footer from './layout/footer/Footer.vue';

require('./main.scss');

export default {
  name: 'Main',
  components: {
    'header-component': Header,
    'footer-component': Footer
  },
  data () {
    return {
      window: window,
      isFull: JSON.parse(localStorage.getItem('isFull')) || false
    }
  },
  methods: {
    // 全屏切换
    toggleFull() {
      this.isFull = !this.isFull;
      localStorage.setItem('isFull', JSON.stringify(this.isFull));
    }
  }
};
</script>
