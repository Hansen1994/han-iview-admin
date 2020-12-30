<template>
  <div>
    <Card>
      <tables
        ref="tables"
        searchable
        search-place="top"
        v-model="tableData"
        :loading="loading"
        @on-selection-change="handleSelect"
        :columns="columns"
      >
        <!-- 使用插槽 -->
      </tables>
      <Row type="flex" justify="space-between" align="middle">
        <i-col class="ctrls">
          <Button @click="_deleteErrors()">批量删除</Button>
        </i-col>
        <i-col>
          <Page
            :total="total"
            :current="page"
            :page-size="limit"
            :page-size-opts="pageArr"
            show-elevator
            show-sizer
            show-total
            @on-change="onPageChange"
            @on-page-size-change="onPageSizeChange"
          />
        </i-col>
      </Row>
    </Card>
  </div>
</template>

<script>
import Tables from '_c/tables'
import Expend from './expend'
import More from './more'
import { getErrorLogsList, deleteErrors } from '@/api/admin'
import dayjs from 'dayjs'
export default {
  name: 'logs',
  components: { Tables },
  data() {
    const that = this
    return {
      columns: [
        {
          // expand就是前面那个小箭头
          type: 'expand',
          key: 'stack',
          width: 50,
          render: (h, params) => {
            // Expend这是一种高级的用法，利用组件的方式区展现内容
            return h(Expend, {
              // 将当列数据传递给expend组件
              props: {
                row: params.row
              }
            })
          }
        },
        {
          type: 'selection',
          width: 60,
          align: 'center',
          hidden: true
        },
        {
          title: '错误消息',
          key: 'message',
          minWidth: 150,
          search: {
            type: 'input'
          }
        },
        {
          title: '错误码',
          key: 'code',
          minWidth: 120,
          filters: [],
          filterMultipl: false, // 默认不筛选
          // 因为作用域的不同，所以采用that的方式
          filterRemote: that.filterHandle
        },
        {
          title: '请求类型',
          key: 'method',
          align: 'center',
          minWidth: 140,
          filters: [], // 筛选
          filterMultipl: false, // 默认不筛选
          filterRemote: that.filterHandle // 使用远程过滤， 作用与filterMethod类似
        },
        {
          title: '请求路径',
          key: 'path',
          align: 'center',
          minWidth: 80,
          hidden: true
        },
        {
          title: '请求参数',
          key: 'param',
          align: 'center',
          minWidth: 240,
          render: (h, params) => {
            return h(More, {
              props: {
                row: params.row
              }
            })
          }
        },
        {
          title: '日期',
          key: 'created',
          align: 'center',
          minWidth: 180,
          render: (h, params) => {
            return h('div', [
              h('span', dayjs(params.row.created).format('YYYY-MM-DD HH:mm:ss'))
            ])
          }
        },
        {
          title: '用户',
          key: 'username',
          align: 'center',
          minWidth: 180
        }
      ],
      total: 0,
      tableData: [],
      limit: 10,
      page: 1,
      loading: true,
      pageArr: [10, 20, 30],
      selection: [],
      filters: {}
    }
  },
  watch: {
    // 用监听方式实时监听filter变化，从而改变筛选状态
    filters(newval, oldval) {
      this._getList()
    }
  },
  mounted() {
    this._getList(this.filters)
  },
  methods: {
    // 获取列表
    _getList() {
      console.log(this.filters)
      getErrorLogsList({
        page: this.page - 1,
        limit: this.limit,
        // 通过把数据传给后端，让后端去筛选,这里的filter从filterHandle得到
        filter: this.filters || {}
      }).then((res) => {
        this.total = res.total
        this.tableData = res.data
        this.loading = false
        const keys = Object.keys(res.filter) // [code, method]
        // console.log(res.filter)
        this.columns.map((item) => {
          if (keys.includes(item.key)) {
            if (item.filters.length === 0) {
              // 数据格式要和column里的filter一样, 一个一个给
              item.filters = res.filter[item.key]
            }
          }
        })
      })
    },
    // 选中复选框
    handleSelect(val) {
      this.selection = val
    },
    // 切页
    onPageChange() {},
    // 变化一页显示条数
    onPageSizeChange() {},
    // 批量删除
    _deleteErrors() {
      const selection = this.selection
      console.log(selection)
      if (selection.length !== 0) {
        this.$Modal.confirm({
          title: '确认删除',
          content: '确定要删除已选中的错误消息么？',
          onOk: () => {
            const arr = this.selection.map((o) => o._id)
            console.log(arr)
            deleteErrors({ ids: arr }).then((res) => {
              if (res.code === 200) {
                this.tableData = this.tableData.filter((item) => {
                  // 过滤掉数组，常用
                  if (!arr.includes(item._id)) {
                    return item
                  }
                })
                this.$Message.success('删除成功')
              } else {
                this.$Message.error('删除失败，请联系客服')
              }
            })
          }
        })
      } else {
        this.$Modal.error({
          title: '错误',
          content: '请选择要删除的错误消息复选框'
        })
      }
    },
    // 过滤
    filterHandle(value, row) {
      const obj = { ...this.filters }
      // console.log(value) // [404, __ob__: Observer]
      if (value[0]) {
        obj[row] = value[0] // {code: 404} 或 {method: get}
      } else {
        delete obj[row]
      }
      this.filters = obj
    }
  }
}
</script>

<style></style>
