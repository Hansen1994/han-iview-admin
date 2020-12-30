<template>
  <div>
    <Row type="flex" align="middle">
      <i-col class="overtext" span="18">{{ row.param }}</i-col>
      <i-col span="6">
        <a @click="more()" style="padding-left: 6px">更多>></a>
      </i-col>
    </Row>
  </div>
</template>

<script>
export default {
  props: {
    row: {
      type: Object,
      default: () => {}
    }
  },
  methods: {
    more() {
      // 出现弹窗
      this.$Modal.info({
        title: '详情',
        render: (h, params) => {
          return h('Input', {
            props: {
              type: 'textarea',
              // 2代表文字间隔为2
              value: JSON.stringify(this.row.param, null, 2),
              rows: 16
            }
          })
        }
      })
    }
  }
}
</script>

<style lang="scss">
.overtext {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  display: box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}
</style>
