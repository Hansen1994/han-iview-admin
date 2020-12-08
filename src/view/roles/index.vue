<template>
  <div>
    <i-row :gutter="10">
      <i-col span="5">
        <Card :dis-hover="true" :shadow="true">
          <p slot="title"><Icon type="md-contacts"></Icon>角色列表</p>
          <a href="#" slot="extra"> <Icon type="md-add"></Icon>新增 </a>
          <ul class="imooc-card">
            <li
              v-for="(item, index) in roles"
              :key="'roles' + index"
              class="flex"
              :class="{ selected: roleIndex === index }"
              @click="selectRole(index)"
            >
              <div class="flex1 round">{{ item.title }}</div>
              <span>
                <Icon type="md-build" size="22" color="#2d8cf0"></Icon>
                <Icon type="md-trash" size="22" color="#ed4014"></Icon>
              </span>
            </li>
          </ul>
        </Card>
      </i-col>
      <i-col span="6">
        <Card :dis-hover="true" :shadow="true">
          <Tree :data="menuData" show-checkbox></Tree>
        </Card>
      </i-col>
      <i-col span="13">
        <Card :title="$t('resources')" :dis-hover="true" :shadow="true">
          <OperationsTable
            :columns="columns"
            :tableData="tableData"
            :isEdit="isEdit"
            @on-change="handleTableChange"
          ></OperationsTable>
        </Card>
      </i-col>
    </i-row>
  </div>
</template>

<script>
import OperationsTable from '@/view/menu/operations.vue'
export default {
  data() {
    return {
      isEdit: false,
      roles: [
        {
          title: 'parent 1'
        },
        {
          title: 'parent 2'
        },
        {
          title: 'parent 3'
        },
        {
          title: 'parent 4'
        },
        {
          title: 'parent 5'
        }
      ],
      menuData: [
        {
          title: 'parent 1',
          expand: true,
          children: [
            {
              title: 'parent 1-1',
              expand: true,
              children: [
                {
                  title: 'leaf 1-1-1'
                },
                {
                  title: 'leaf 1-1-2'
                }
              ]
            },
            {
              title: 'parent 1-2',
              expand: true,
              children: [
                {
                  title: 'leaf 1-2-1'
                },
                {
                  title: 'leaf 1-2-1'
                }
              ]
            }
          ]
        }
      ],
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
      tableData: []
    }
  },
  components: {
    OperationsTable
  },
  methods: {
    selectRole(index) {
      if (this.roleIndex === '' || this.roleIndex !== value) {
        this.roleIndex = index
      } else {
        this.roleIndex = ''
      }
    },
    addMenu() {},
    editMenu() {},
    deleteMenu() {},
    handleTreeChange(item) {
      if (item.length === 0) {
        return
      }
      // 非编辑状态
      if (!this.isEdit) {
        this.selectNode = item
        if (item[0].operations && item[0].operations.length > 0) {
          this.tableData = [...item[0].operations]
        }
      } else {
        this.$Message.error('当前为编辑状态，请取消编辑后查看！')
      }
    },
    handleTableChange(table) {
      this.tableData = table
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
    i:first-child {
      margin-right: 2px;
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
        background-color: #d5e8fc;
      }
    }
  }
  .round {
    padding: 1px 2px;
    border-radius: 3px;
  }
}
</style>
