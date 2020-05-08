<template>
  <div>
    <!--面包屑-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="roleslist" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['dbbottom',i1===0?'bdtop':'','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>

              <!-- 二级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2===0?'':'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                      type="success"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3,i3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="serRightDialogClosed"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        :default-checked-keys="defKeys"
        default-expand-all
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      roleslist: [], //存储角色列表数据
      //权限对话框显示和影藏
      setRightDialogVisible: false,
      rightslist: [], //存储角色树形数据
      treeProps: {
        //树形控件的属性绑定对象
        label: 'authName',
        children: 'children'
      },
      defKeys: [], //默认选中节点的id值数组
      roleId:''  //分配权限的id
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获角色列表失败')
      } else {
        this.roleslist = res.data
        console.log(this.roleslist)
      }
    },
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm(
        '此操作将永久用户权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('取消删除权限')
      } else {
        const { data: res } = await this.$http.delete(
          `roles/${role.id}/rights/${rightId}`
        )
        if (res.meta.status !== 200) {
          return this.$message.error('删除权限失败')
        } else {
          role.children = res.data
        }
      }
    },
    //分配权限
    async showSetRightDialog(role) {
      this.roleId=role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分配权限失败')
      }
      this.rightslist = res.data
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },

    //通过递归的函数，获取角色所以的三级权限
    getLeafKeys(node, arr) {
      //如果当前node节点不包含children属性，就是三级节点
      //将id保存到arr中
      if (!node.children) {
        return arr.push(node.id)
      } //否则不是三级节点，要使用递归获得三级节点
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    serRightDialogClosed() {
      //关闭权限树形弹窗，清除上一次数据
      this.defKeys = []
    },
    //确定按钮上传树形数据到服务器
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr=keys.join(',')
      const {data:res}=await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }else{
        this.$message.success('分配权限成功')
        this.getRolesList()
        this.setRightDialogVisible = false
      }
    }
  }
}
</script>
<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.dbbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>