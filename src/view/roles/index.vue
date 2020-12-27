<template>
  <div>
    <i-row :gutter="10">
      <i-col span="5" :sm="24" :md="24" :lg="5">
        <Card :dis-hover="true" :shadow="true">
          <p slot="title"><Icon type="md-contacts"></Icon>角色列表</p>
          <a slot="extra" @click.prevent="addRoleModel()" v-if="!isEdit">
            <Icon type="md-add"></Icon>新增
          </a>
          <ul class="imooc-card">
            <li
              v-for="(item, index) in roles"
              :key="'roles' + index"
              class="flex"
              :class="{ selected: roleIndex === index }"
              @click="selectRole(index)"
            >
              <div class="flex1 round">{{ item.name }}</div>
              <span>
                <!-- .stop阻止点击事件继续传播,防止触发selectRole造成未选中状态 -->
                <Icon
                  type="ios-create"
                  size="16"
                  @click.stop="editLabel(item, index)"
                ></Icon>
                <Icon
                  type="md-build"
                  size="16"
                  color="#2d8cf0"
                  @click.stop="editRole(item, index)"
                ></Icon>
                <Icon
                  type="md-trash"
                  size="16"
                  color="#ed4014"
                  @click.stop="_deleteRole(item, index)"
                ></Icon>
              </span>
            </li>
          </ul>
        </Card>
      </i-col>
      <i-col span="6" :sm="24" :md="8" :lg="6">
        <Card :dis-hover="true" :shadow="true" title="菜单权限" icon="md-menu">
          <div slot="extra">
            <ButtonGroup class="imooc-btn-group" v-if="isEdit">
              <Button
                size="small"
                icon="ios-create"
                type="primary"
                @click="submit"
                >确定</Button
              >
              <Button size="small" icon="md-trash" @click="cancel()"
                >取消</Button
              >
            </ButtonGroup>
          </div>
          <Tree
            :data="menuData"
            show-checkbox
            @on-select-change="handleTreeChange"
            r
            @on-check-change="handleTreeChecked"
          ></Tree>
        </Card>
      </i-col>
      <i-col span="13" :sm="24" :md="16" :lg="13">
        <Card
          :title="$t('resources')"
          icon="md-exit"
          :dis-hover="true"
          :shadow="true"
        >
          <OperationsTable
            :columns="columns"
            :tableData="tableData"
            :isEdit="isEdit"
            @on-change="handleTableChange"
          ></OperationsTable>
        </Card>
      </i-col>
    </i-row>
    <Modal
      v-model="showAdd"
      title="添加角色"
      :loading="loading"
      @on-ok="modelSubmit()"
      @on-cancel="modelCancel()"
    >
      <Form :model="formItem" :label-width="80" :rules="formRules" ref="form">
        <FormItem label="角色名称" prop="name">
          <Input v-model="formItem.name" placeholder="请输入角色名称"></Input>
        </FormItem>
        <FormItem label="角色编码" prop="role">
          <Input v-model="formItem.role" placeholder="请输入角色编码"></Input>
        </FormItem>
        <FormItem label="角色描述">
          <Input v-model="formItem.desc" placeholder="请输入角色描述"></Input>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
import { getMenu, getRoles, addRole, updateRole, deleteRole } from '@/api/admin'
import OperationsTable from './operations.vue'
import { modifyNode, getPropertyIds } from '@/libs/util'

export default {
  // 在iview中，name与路由中的name相同(notCache为false情况下)会形成缓存
  name: 'roles_management',
  data() {
    return {
      // 是否为编辑状态
      isEdit: false,
      showAdd: false,
      // 判断是否模态框为编辑(添加)状态
      modelEdit: false,
      // (只限角色列表在编辑时候的索引)
      editIndex: '',
      loading: false,
      formItem: {
        name: '',
        desc: ''
      },
      roles: [],
      // roles: [
      //   {
      //     name: '超级管理员',
      //     role: 'super_admin',
      //     menu: ['5fd027a943e1fd3954ecc94f', '5fcdee3edb5b9206580ad537']
      //   }
      // ],
      formRules: {
        name: [
          {
            required: true,
            message: '请输入角色名称',
            trigger: 'blur'
          }
        ],
        role: [
          {
            required: true,
            message: '请输入觉得编码',
            trigger: 'blur'
          }
        ]
      },
      menuData: [],
      columns: [
        {
          type: 'selection',
          width: 60,
          align: 'center',
          hidden: true
        },
        {
          title: '资源名称',
          key: 'name',
          search: {
            type: 'input'
          },
          align: 'center'
        },
        {
          title: '资源路径',
          key: 'path',
          search: {
            type: 'input'
          },
          align: 'center'
        },
        {
          title: '请求类型',
          key: 'method',
          search: {
            type: 'input'
          },
          align: 'center',
          render: (h, params) => {
            return h('div', params.row.method.toUpperCase())
          }
        },
        {
          title: '资源类型',
          key: 'type',
          search: {
            type: 'radio',
            options: [
              {
                key: '全部',
                value: ''
              },
              {
                key: '接口',
                value: 'api'
              },
              {
                key: '按钮',
                value: 'btn'
              }
            ]
          },
          align: 'center'
        },
        {
          title: '资源描述',
          key: 'regmark',
          search: {
            type: 'input'
          }
        }
      ],
      roleIndex: '',
      // 表格数据
      tableData: [],
      // 选择的节点
      selectNode: []
    }
  },
  components: {
    OperationsTable
  },
  mounted() {
    window.vue = this
    this._getMenu()
    this._getRoles()
  },
  methods: {
    initForm() {
      this.loading = false
      this.showAdd = false
      this.modelEdit = false
      setTimeout(() => {
        this.$refs.form.resetFields()
      }, 0)
    },
    // 获取角色
    _getRoles() {
      getRoles().then((res) => {
        if (res.code === 200) {
          this.roles = res.data
        }
      })
    },
    // 获取菜单
    _getMenu() {
      getMenu().then((res) => {
        this.menuData = res.data
        localStorage.setItem('menuData', JSON.stringify(this.menuData))
      })
    },
    // 选中角色
    selectRole(value) {
      // 一开始未选中状态
      if (this.roleIndex === '' || this.roleIndex !== value) {
        // 选中后
        this.roleIndex = value
        // 如果当前角色菜单为空
        if (this.roles[this.roleIndex].menu.length === 0) {
          modifyNode(this.menuData, null, 'checked', false)
          this.tableData = []
          this.roleIndex = ''
          return
        }
        // 修改右侧菜单树+权限列表的选中状态(他就是个显示，不能编辑的)
        const tmpData = modifyNode(
          this.menuData,
          this.roles[this.roleIndex].menu,
          'checked',
          true
        )
        // 通过缓存数据形式达到锁住功能(就是不能点选复选框)
        localStorage.setItem('menuData', JSON.stringify(tmpData))
        if (this.selectNode.length > 0 && this.selectNode[0].operations) {
          this.tableData = this.selectNode[0].operations
        }
      } else {
        // 未选中
        modifyNode(this.menuData, null, 'checked', false)
        this.tableData = []
        this.roleIndex = ''
      }
    },
    // 添加角色跳出模态框
    addRoleModel() {
      this.showAdd = true
    },
    // 编辑角色跳出模态框
    editRole(item, index) {
      this.isEdit = true
      this.roleIndex = index
    },
    // 角色编辑
    editLabel(item, index) {
      this.showAdd = true
      this.modelEdit = true
      this.editIndex = index
      // 必需浅拷贝，不然两边数据会有引用关系造成同步变化
      this.formItem = { ...item }
    },
    // 删除角色
    _deleteRole(item, index) {
      this.$Modal.confirm({
        title: '确定删除吗？',
        content: `确定删除${item.name}的角色吗？`,
        onOk: () => {
          this.roles.splice(index, 1)
          // this.$Message.success('成功删除！')
          // this._getList()
          deleteRole({ _id: item._id }).then((res) => {
            if (res.code === 200 && res.data.deletedCount === 1) {
              this.$Message.success('成功删除！')
            }
          })
        },
        onCancel: () => {
          this.$Message.info('取消操作！')
        }
      })
    },
    // 编辑视图(中间那两个小按钮)
    submit() {
      this.isEdit = false
      localStorage.setItem('menuData', JSON.stringify(this.menuData))
      const menus = getPropertyIds(this.menuData, ['children', 'operations'])
      // 更新角色，以及他所对应的权限
      const tmp = { ...this.roles[this.roleIndex] }
      // 再来赋值一次
      tmp.menu = menus
      this.roles.splice(this.roleIndex, 1, tmp)
      updateRole(tmp).then((res) => {
        if (res.code === 200 && res.data.nModified === 1) {
          this.$Message.success('更新角色权限成功！')
        }
      })
    },
    cancel() {
      this.isEdit = false
      // 取消时，根据本地设置好的本地缓存进行恢复
      const tmpData = localStorage.getItem('menuData')
      if (typeof tmpData !== 'undefined') {
        this.menuData = JSON.parse(tmpData)
        this.tableData = []
        this.selectNode = []
      }
    },
    // 角色模态框提交
    modelSubmit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          // 检验通过后的逻辑
          // 1.这儿是表单的信息
          if (this.modelEdit) {
            const roleData = {
              _id: this.roles[this.editIndex]._id,
              ...this.formItem
            }
            // 为角色模态框重新编辑态
            // this.roles.splice(this.labelIndex, 1, { ...this.formItem })
            updateRole(roleData).then((res) => {
              if (res.code === 200 && res.data.nModified === 1) {
                this.roles.splice(this.labelIndex, 1, { ...this.formItem })
              }
            })
          } else {
            // 如果不是编辑
            // this.roles.push({ ...this.formItem })
            // 2.发送创建角色的请求
            addRole(this.formItem).then((res) => {
              if (res.code === 200 && res.data.name !== '') {
                this.roles.push({ ...this.formItem })
                this.$Message.success('添加成功啦！')
              }
            })
          }

          // 3.保证赋值完成后清除
          this.initForm()
        } else {
          this.loading = false
          this.$nextTick(() => (this.loading = true))
          this.$Message.error('哎呀，失败了，请检验表单数据！')
        }
      })
    },
    modelCancel() {
      this.initForm()
    },
    // 节点赋值
    handleTreeChange(item) {
      if (item.length === 0) {
        return
      }
      // 非编辑状态
      this.selectNode = item
      this.tableData = [...item[0].operations]
    },
    // 菜单权限点选
    handleTreeChecked(item) {
      if (!this.isEdit) {
        // 在未编辑状态，我们通过localStorage存储方式不让复选框点选
        const tmpData = localStorage.getItem('menuData')
        if (typeof tmpData !== 'undefined') {
          this.menuData = JSON.parse(tmpData)
        }
        this.$Message.warning('无法修改，请选择权限进行编辑！')
      }
    },
    // 点击表格时候获取当前表格数据
    handleTableChange(table) {
      const ids = table.map((o) => o._id)
      if (this.selectNode.length > 0 && this.selectNode[0].operations) {
        this.selectNode[0].operations.forEach((item) => {
          if (!ids.includes(item._id)) {
            item._checked = false
          } else {
            item._checked = true
          }
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.imooc-card {
  li {
    list-style: none;
    line-height: 24px;
  }
  span {
    display: none;
    i {
      margin-right: 2px;
      &:hover {
        background: #eee;
        display: inline-block;
        cursor: pointer;
        border-radius: 2px;
      }
    }
  }
  .flex {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-flow: row nowrap;
    &:hover {
      span {
        display: block;
      }
      .flex1 {
        background: #eaf4fe;
      }
    }
    &.selected {
      .flex1 {
        background-color: #357dfa;
      }
    }
  }
  .round {
    padding: 1px 2px;
    border-radius: 3px;
  }
}
</style>
