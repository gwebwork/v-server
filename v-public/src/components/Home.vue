<template>
  <div>
    <el-button type="info" @click="logout">撤销</el-button>
  </div>
</template>
<script>
export default {
  methods: {
    logout() {
      sessionStorage.clear() //清除token
      this.$router.push('/login') //重定向到登录页
    }
  }
}
</script>

<style lang="less" scoped>
</style>