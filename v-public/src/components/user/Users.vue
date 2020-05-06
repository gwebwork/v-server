<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 搜索与添加区域  -->
      <el-row :gutter="15">
        <el-col :span="6">
          <el-input clearable placeholder="请输入内容" v-model="queryInfo.query" @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="rmoveUserId(scope.row.id)"></el-button>
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible= false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-z0-9_-])+@([a-zA-z0-9_-])+(\.[a-zA-z0-9_-])+/
      if (regEmail.test(value)) {
        return cb() //合法邮箱
      } else {
        cb(new Error('请输入符合规则的邮箱地址'))
      }
    }
    var checkMoblie = (rule, value, cb) => {
      const regMoblie = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMoblie.test(value)) {
        return cb() //合法手机号
      } else {
        cb(new Error('请输入符合规则的手机号'))
      }
    }
    return {
      queryInfo: {
        //获取用户信息
        query: '',
        pagenum: 1, //当前页数
        pagesize: 2 //当前显示多少条数据
      },
      userlist: [],
      total: 0,
      addDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      }, //添加用户的表单数据
      addFormRules: {
        //添加表单的验证规则
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 12, message: '用户名长度必须3到12位', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '密码长度必须6到16位', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMoblie, trigger: 'blur' }
        ]
      },
      editDialogVisible: false, //控制修改用户对话框现实与隐藏
      editForm: {}, //保存查询到的用户信息对象
      editFormRules:{
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
         mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMoblie, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      } else {
        this.userlist = res.data.users
        this.total = res.data.total
      }
    },
    handleSizeChange(newSize) {
      //监听pagesize改变
      console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      //监听页码值改变
      console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    //监听状态
    async userStateChange(userinfo) {
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      } else {
        this.$message.success('更新用户状态成功')
      }
    },
    //添加用户对话框关闭时，清空用户输入的内容
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    //添加用户，校验用户规则，通过就添加不通过就阻止添加
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) {
          //预校验为false时，阻止行为
          return
        } else {
          //预校验为true时,添加到数据库
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            this.$message.error('添加用户失败')
          } else {
            this.$message.success('添加用户成功')
            //隐藏添加用户对话框
            this.addDialogVisible = false
            this.getUserList() //重新获取用户列表
          }
        }
      })
    },
    //修改用户
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      this.editDialogVisible = true
      console.log(id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      } else {
        this.editForm = res.data
      }
    },
    //修改用户对话框关闭时，还原用户输入的内容
    editDialogClosed(){
      this.$refs.editFormRef.resetFields()
    },
    editUser(){
      this.$refs.editFormRef.validate(async valid => {
        console.log(valid)
        if (!valid) {
          //预校验为false时，阻止行为
          return
        } else {
          //预校验为true时,添加到数据库
          const { data: res } = await this.$http.put('users/'+this.editForm.id,{email:this.editForm.email,mobile:this.editForm.mobile})
          if (res.meta.status !== 200) {
            this.$message.error('更新用户失败')
          } else {
            //隐藏更新用户对话框
            this.editDialogVisible = false
            this.getUserList() //重新获取用户列表
            this.$message.success('更新用户成功')
          }
        }
      })
    },
    //根据id删除用户
    async rmoveUserId(id){
      const confirmResult=await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).catch(err=>{
        return err
      })

      //如果用户确认删除，返回字符串confirm
      //如果用户取消删除，则返回字符串cancel
      console.log(confirmResult)
      if(confirmResult!=='confirm'){
        return this.$message.info('已取消删除')
      }else{
        console.log('确认了删除');
        const {data:res}=await this.$http.delete('users/'+id)
        if(res.meta.status!==200){
          return this.$message.error("删除用户失败")
        }else{
          this.$message.success("删除用户成功"); //这里不能写return不然下面刷新不执行
          this.getUserList();
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>