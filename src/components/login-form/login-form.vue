<template>
  <Form ref="loginForm" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
    <FormItem prop="username">
      <Input v-model="form.username" placeholder="请输入用户名">
        <span slot="prepend">
          <Icon :size="16" type="ios-person"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="password">
      <Input v-model="form.password" placeholder="请输入密码">
        <span slot="prepend">
          <Icon :size="14" type="md-lock"></Icon>
        </span>
      </Input>
    </FormItem>
    <FormItem prop="code">
      <Input class="han-input" v-model="form.code" placeholder="请输入验证码">
        <span slot="prepend">
          <Icon :size="14" type="md-image"></Icon>
        </span>
        <span slot="append" class="han-code" v-html="svg" @click="changeCode">图片验证码</span>
      </Input>
    </FormItem>
    <FormItem>
      <Button @click="handleSubmit" class="han-code" type="primary" long>登录</Button>
    </FormItem>
  </Form>
</template>
<script>
// import axios from 'axios'
import { getCode } from '@/api/login'
import uuid from 'uuid/v4'
export default {
  name: 'LoginForm',
  props: {
    userNameRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '账号不能为空', trigger: 'blur' },
          { type: 'email', message: '邮箱格式不正确', trigger: 'change' }
        ]
      }
    },
    passwordRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          {
            type: 'string',
            min: 6,
            message: '密码至少为6位',
            trigger: 'change'
          }
        ]
      }
    },
    codeRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '验证码不能为空', trigger: 'blur' },
          {
            type: 'string',
            len: 4,
            message: '验证码长度不正确',
            trigger: 'change'
          }
        ]
      }
    }
  },
  data () {
    return {
      svg: '',
      form: {
        username: '',
        password: '',
        code: ''
      },
      sid: ''
    }
  },
  mounted () {
    let sid = ''
    if (localStorage.getItem('sid')) {
      sid = localStorage.getItem('sid')
    } else {
      sid = uuid()
      localStorage.setItem('sid', sid)
    }
    this.$store.commit('setSid', sid)
    this.form.sid = sid
    this._getCode()
  },
  computed: {
    rules () {
      return {
        username: this.userNameRules,
        password: this.passwordRules,
        code: this.codeRules
      }
    }
  },
  methods: {
    handleSubmit () {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          // this.$emit('on-success-valid', {
          //   userName: this.form.userName,
          //   password: this.form.password
          // })
          this.$emit('on-success-valid', { ...this.form })
        }
      })
    },
    changeCode () {
      this._getCode()
    },
    // 获取图片验证码数据
    _getCode () {
      getCode(this.$store.state.sid)
        .then((res) => {
          const obj = res.data
          if (res.status === 200) {
            this.svg = obj.data
          }
        })
    }
  }
}
</script>

<style lang="scss">
.han-input {
  .ivu-input-group-append {
    padding: 0;
  }
  .ivu-input-group-prepend {
    width: 32px;
  }
}

.han-code {
  display: inline-block;
  padding: 0;
  height: 28px;
  overflow: hidden;
  svg {
    width: 120px;
    position: relative;
    top: -12px;
    cursor: pointer;
  }
}
</style>
