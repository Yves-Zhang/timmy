<template>

</template>

<script>
import auth from '../../auth';

export default {
  mounted() {
    const { account: userName, password } = this.$route.query;
    debugger; // eslint-disable-line no-debugger, no-restricted-syntax

    auth.login(this, {userName, password}, '/').then(response => {
      if (!response) {
        console.log('确认科室数据是否正确');
      }
    });
  }
}
</script>
