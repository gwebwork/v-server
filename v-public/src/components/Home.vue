<template>
  <el-container class="home-container">
    <!--头部区域-->
    <el-header>
      <div>
        <img src="../assets/timg.jpg" alt />
        <span>大熊商城后台管理</span>
      </div>
      <el-button type="info" @click="logout">撤销</el-button>
    </el-header>
    <el-container>
      <!--侧边栏-->
      <el-aside :width="isCollapse?'64px':'200px'">
        <div class="toggle-button" @click="toggleCollapse($event)">《《《</div>
        <el-menu :collapse="isCollapse" active-text-color="#409eff" background-color="#333744" text-color="#fff" :collapse-transition="false" unique-opened router :default-active="activePath">
          <!--一级菜单-->
          <!--当index为1时，下拉页会同时打开，只有每个index不一样时，才不会同时打开，当index等于item.id时才会唯一-->
          <el-submenu :index="item.id+''" v-for="item in menulist" :key="item.id">
            <!--一级菜单模板-->
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!--二级菜单-->
            <el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)"> 
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
        <!--侧边栏end-->
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>
<script>
export default {
  data() {
    return {
      menulist: [],
      iconsObj:{
        '125':'iconfont icon-user',
        '103':'iconfont icon-tijikongjian',
        '101':'iconfont icon-shangpin',
        '102':'iconfont icon-danju',
        '145':'iconfont icon-baobiao'
      },
      isCollapse:false,
      activePath:''
    }
  },
  created() {
    this.getMenuList()
    this.activePath=sessionStorage.getItem('activePath');
  },
  methods: {
    logout() {
      sessionStorage.clear() //清除token
      this.$router.push('/login') //重定向到登录页
    },
    async getMenuList() {
      const { data: res } = await this.$http.get('menus') //请求menus接口
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.menulist = res.data
      }
    },
    toggleCollapse(e){
      this.isCollapse=!this.isCollapse;
      console.log(e.target.innerHTML);
      if(e.target.innerHTML==='《《《'){
        e.target.innerHTML='》》》'
      }else{
        e.target.innerHTML='《《《'
      }
    },
    saveNavState(activePath){
      sessionStorage.setItem('activePath',activePath);
      this.activePath=activePath;
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 18px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
  img {
    width: 60px;
    height: 60px;
    border-radius: 50%;
  }
}
.el-aside {
  background-color: #333744;
  
  .el-menu{
    border-right:none;
    
  }
  .toggle-button{
    background-color: #4a5064;
    font-size: 10px;
    line-height: 24px;
    color: #fff;
    text-align: center;
    cursor: pointer;
    letter-spacing: -0.3em;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont{
  margin-right:8px;
}
</style>