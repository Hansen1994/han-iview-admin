<template>
  <div>
    <i-row :gutter="10">
      <i-col span="6" :sm="24" :md="9" :lg="6">
        <imooc-tree
          :size="size"
          :isEdit="isEdit"
          :menuData="menuData"
          @addMenu="_addMenu"
          @editMenu="editMenu"
          @deleteMenu="deleteMenu"
          @handleTreeChange="handleTreeChange"
        ></imooc-tree>
      </i-col>
      <i-col span="18" :sm="24" :md="15" :lg="18">
        <i-card
          :title="$t('Menu Options')"
          icon="ios-options"
          :dis-hover="true"
          :shadow="true"
          style="margin-bottom: 10px"
        >
          <imooc-form
            :isEdit="isEdit"
            :formItem="formData"
            @submit="submit"
            @cancel="cancel"
          ></imooc-form>
        </i-card>
        <i-card :title="$t('resources')" :dis-hover="true" :shadow="true">
          <imooc-operations
            :localData="tableData"
            :columns="columns"
            :isEdit="isEdit"
            @on-change="handleTableChange"
          ></imooc-operations>
        </i-card>
      </i-col>
    </i-row>
  </div>
</template>

<script>
import { addMenu, updateMenu, getMenu, deleteMenu } from '@/api/admin'
import { sortObj, getNode } from '@/libs/util'
import Tree from './tree'
import Form from './form'
import Operations from './operations'
export default {
  data() {
    return {
      isEdit: false,
      // 表单数据
      formData: {
        title: '',
        name: '', // 组件名称
        path: '',
        component: '',
        hideInBread: false,
        hideInMenu: false,
        notCache: false,
        icon: '',
        sort: 0,
        redirect: '',
        type: 'menu',
        link: '',
        operations: []
      },
      // 屏幕的变化
      screenWidth: 0,
      // 是否选择了节点
      selectNode: [],
      // 菜单选项
      menuData: [],
      type: '',
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
        },
        {
          title: '设置',
          key: 'settings',
          slot: 'action',
          hidden: true,
          fixed: 'right',
          width: 100,
          align: 'center'
        }
      ],
      tableData: []
    }
  },
  components: {
    'imooc-tree': Tree,
    'imooc-form': Form,
    'imooc-operations': Operations
  },
  mounted() {
    window.vue = this
    const that = this
    window.onresize = () => {
      return (() => {
        that.screenWidth = document.body.clientWidth
      })()
    }
    this._getMenu()
  },
  computed: {
    size() {
      if (this.screenWidth < 768) {
        return 'default'
      } else {
        return 'small'
      }
    }
  },
  methods: {
    // 后台获取菜单列表
    _getMenu() {
      getMenu().then((res) => {
        if (res.code === 200) {
          this.menuData = res.data
        }
      })
    },
    // 表单初始化
    initFields() {
      // 表单清空
      this.formData = {
        title: '',
        name: '', // 组件名称
        path: '',
        component: '',
        hideInBread: false,
        hideInMenu: false,
        notCache: false,
        icon: '',
        sort: 0,
        redirect: '',
        type: 'menu',
        link: '',
        operations: []
      }
      // 不可编辑
      this.isEdit = false
      // 判断兄弟还是孩子节点初始化
      this.type = ''
      // 表单初始化
      this.tableData = []
    },
    // 增加菜单
    _addMenu(type) {
      this.initFields()
      this.type = type
      // console.log(this.selectNode)
      // console.log(this.menuData)
      if (this.selectNode.length > 0 || this.menuData.length === 0) {
        this.isEdit = true
      } else {
        this.$Message.error('请选择菜单节点后再添加选项！')
      }
    },
    // 编辑菜单
    editMenu() {
      if (this.selectNode.length > 0) {
        this.isEdit = true
        this.formData = { ...this.selectNode[0] }
      } else {
        this.$Message.error('请选择菜单节点后再编辑')
      }
    },
    // 删除菜单
    deleteMenu() {
      if (this.selectNode.length > 0 || this.menuData.length === 0) {
        this.$Modal.confirm({
          title: '确定要删除此节点么?',
          content: `要删除${this.selectNode[0].title}的菜单项吗?`,
          onOk: () => {
            const deleteNode = (tree, node) => {
              for (let i = 0; i < tree.length; i++) {
                const currentNode = tree[i]
                if (currentNode.nodeKey === node.nodeKey) {
                  tree.splice(i, 1)
                  return tree
                } else {
                  if (tree.children && tree.children.length > 0) {
                    deleteNode(tree.children, node)
                  }
                }
              }
              return tree
            }

            // this.selectNode = []
            // 判断是删除一级菜单 还是删除子菜单
            const parent = getNode(this.menuData, this.selectNode[0])
            if (parent.nodeKey !== this.selectNode[0].nodeKey) {
              // 删除子菜单
              updateMenu(parent).then((res) => {
                if (res.code === 200) {
                  this.$Message.success('删除子菜单成功')
                }
              })
            } else {
              deleteMenu({ _id: parent._id }).then((res) => {
                if (res.code === 200) {
                  this.$Message.success('删除一级菜单成功')
                }
              })
            }
            this.menuData = deleteNode(this.menuData, this.selectNode[0])
          }
        })
      } else {
        this.$Message.error('请选择菜单节点后再进行删除！')
      }
    },
    submit(data) {
      // 参数(整个菜单列表, 选中的节点信息),返回一级列表
      let parent = getNode(this.menuData, this.selectNode[0])
      // 这里是将表格的数据也写入data作为菜单树一个节点上的信息
      if (this.tableData.length > 0) {
        data.operations = this.tableData
      }
      // 1.获取formData中的数据 -> menuData中
      // a.type->数据插入的节点
      // b.数据需要按照tree的方式格式化(详见iview的tree)
      if (this.type === 'bro') {
        // 兄弟节点
        if (this.menuData.length === 0) {
          addMenu(data).then((res) => {
            if (res.code === 200) {
              this.menuData.push(data)
              this.$Message.success('添加首个一级菜单成功')
              this.initFields()
            }
          })
        } else {
          // 选中的项
          const selectNode = this.selectNode[0]
          // 二级节点添加新的兄弟节点
          const getMenu = (parent, select) => {
            for (let i = 0; i < parent.length; i++) {
              const item = parent[i]
              // 去重
              // 原有数据等于选中数据，也就是说按照顺序加入兄弟节点
              if (item.name === select.name) {
                // 排序
                parent.push(data)
                // 对sort属性进行排序
                parent = sortObj(parent, 'sort')
                return parent
              } else {
                // 判断有无孩子节点(在孩子节点上设置兄弟节点)
                if (item.children && item.children.length > 0) {
                  getMenu(item.children, select)
                }
              }
            }
            return parent
          }
          this.menuData = getMenu(this.menuData, selectNode)
          // 1.可能是一级节点的兄弟节点编辑
          if (parent.nodeKey === selectNode.nodeKey) {
            addMenu(data).then((res) => {
              if (res.code === 200) {
                // bug修复??
                // 二级节点添加新的兄弟节点
                // const getMenu = (parent, select) => {
                //   for (let i = 0; i < parent.length; i++) {
                //     const item = parent[i]
                //     // 去重
                //     // 原有数据等于选中数据，也就是说按照顺序加入兄弟节点
                //     if (item.name === select.name) {
                //       // 排序
                //       parent.push(res.data)
                //       // 对sort属性进行排序
                //       parent = sortObj(parent, 'sort')
                //       return parent
                //     } else {
                //       // 判断有无孩子节点(在孩子节点上设置兄弟节点)
                //       if (item.children && item.children.length > 0) {
                //         getMenu(item.children, select)
                //       }
                //     }
                //   }
                //   return parent
                // }

                this.$Message.success('添加菜单成功')
              }
            })
          } else {
            // 2. 可能是二级节点的兄弟节点添加新的兄弟节点 -> parent 一级节点->updateMenu
            // 也就是说，虽然添加二级节点的兄弟节点，但是我们还是更新一级急待你的数据
            parent = getNode(this.menuData, selectNode)
            updateMenu(parent).then((res) => {
              if (res.code === 200) {
                this.$Message.success('添加子孙兄弟节点成功')
              }
            })
          }
        }
      } else if (this.type === 'child') {
        // console.log(this.type)
        // console.log(selectNode[0])
        // 子节点
        if (typeof this.selectNode[0].children === 'undefined') {
          this.$set(this.selectNode[0], 'children', [data])
        } else {
          // 排序
          // 那么在父节点添加孩子节点
          // let arr = [...this.selectNode[0].children, data]
          // arr.sortObj(arr, 'sort')
          // 在选中的父级元素上设置不为空时候的孩子节点
          this.$set(this.selectNode[0], 'children', [
            // 应该是两段数据的拼接
            ...this.selectNode[0].children,
            data
          ])
          // this.$set(this.selectNode[0], 'children', data)
          parent = getNode(this.menuData, this.selectNode[0])
          // 更新操作
          updateMenu(parent).then((res) => {
            if (res.code === 200) {
              this.$Message.success('添加子菜单成功了！')
            }
          })
        }
      } else {
        // type 为默认值时候(用于编辑更新时候用)
        // 恢复到默认状态(通过这个type='',以便编辑时候更新)，更新菜单节点
        const updateNode = (tree, node) => {
          for (let i = 0; i < tree.length; i++) {
            const currentNode = tree[i]
            // iView 给每个节点都设置了一个 nodeKey 字段，用来标识节点的 id
            if (currentNode.nodeKey === node.nodeKey) {
              /* 将编辑的数据更新到树形菜单 */
              tree.splice(i, 1, node)
              return tree
            } else {
              // 对孩子节点的统计
              if (tree.children && tree.children.length > 0) {
                updateNode(tree.children, node)
              }
            }
          }
          return tree
        }
        this.menuData = updateNode(this.menuData, data)
        // 更改当前选中的值
        this.$set(this.selectNode, 0, data)
        parent = getNode(this.menuData, this.selectNode[0])
        // 更新操作
        updateMenu(parent).then((res) => {
          if (res.code === 200) {
            this.$Message.success('更新菜单成功！')
          }
          // 为了排序
          this._getMenu()
        })
      }
      // console.log(data)
      // 提交完后表单初始化
      this.initFields()
    },
    cancel() {
      this.isEdit = false
      this.initFields()
    },
    // 节点传来的数据,通过点击节点向表单表格传递数据
    handleTreeChange(val) {
      // 如果没有选择节点则跳出
      if (val.length === 0) {
        this.initFields()
        this.selectNode.length = 0
        return
      }
      if (!this.isEdit) {
        this.selectNode = val
        this.formData = this.selectNode[0]

        if (
          this.selectNode[0].operations &&
          this.selectNode[0].operations.length > 0
        ) {
          // 防止修改原数据
          this.tableData = [...this.selectNode[0].operations]
        }
      } else {
        this.$Message.error('当前为编辑状态，请取消编辑后查看！')
      }
    },
    handleDeleteBatch() {
      // 批量进行删除
      if (this.selection.length === 0) {
        this.$Message.info('请选择需要删除的数据！')
        return
      }
      const msg = this.selection.map((o) => o.username).join(',')
      this.$Modal.confirm({
        title: '确定删除用户吗？',
        content: `删除${msg}的用户`,
        onOk: () => {
          const arr = this.selection.map((o) => o._id)
          deleteUserById(arr).then((res) => {
            // this.tableData.splice(index, 1)
            this.tableData = this.tableData.filter(
              (item) => !arr.includes(item._id)
            )
            this.$Message.success('删除成功！')
            //  this._getList()
          })
        },
        onCancel: () => {
          this.$Message.info('取消操作！')
        }
      })
    },
    handleSetBatch() {
      // 批量进行删除
      if (this.selection.length === 0) {
        this.$Message.info('请选择需要删除的数据！')
        return
      }
      // 批量进行设置 -> vip, 禁言, 角色
      this.showSet = true
    },
    onPageChange(page) {
      this.page = page
    },
    onPageSizeChange(size) {
      this.limit = size
    },
    // 拿到表格数据
    handleTableChange(table) {
      // console.log('handleTableChange -> table', table)
      this.tableData = table
    }
  }
}
</script>

<style lang="scss"></style>
