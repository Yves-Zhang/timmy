<template>
<footer class="footer w">
      <div class="copy-right">Copyright © {{currentYear}} 深圳市联新移动医疗科技有限公司 All Rights Reserved CIMS V1.1</div>
</footer>
</template>

<script>
import Vue from 'vue';

require('./footer.scss');

export default {
  name: 'Footer',
  data: () => {
    return {
      currentYear: new Date().getFullYear()
    }
  }
};
</script>
