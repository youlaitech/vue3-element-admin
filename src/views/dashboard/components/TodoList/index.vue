<template>
  <section class="todoapp">
    <!-- header -->
    <header class="header">
      <input class="new-todo" autocomplete="off" placeholder="Todo List" @keyup.enter="addTodo">
    </header>
    <!-- main section -->
    <section v-show="todos.length" class="main">
      <input id="toggle-all" :checked="allChecked" class="toggle-all" type="checkbox" @change="toggleAll({ done: !allChecked })">
      <label for="toggle-all" />
      <ul class="todo-list">
        <todo
          v-for="(todo, index) in filteredTodos"
          :key="index"
          :todo="todo"
          @toggleTodo="toggleTodo"
          @editTodo="editTodo"
          @deleteTodo="deleteTodo"
        />
      </ul>
    </section>
    <!-- footer -->
    <footer v-show="todos.length" class="footer">
      <span class="todo-count">
        <strong>{{ remaining }}</strong>
        {{ remaining | pluralize('item') }} left
      </span>
      <ul class="filters">
        <li v-for="(val, key) in filters" :key="key">
          <a :class="{ selected: visibility === key }" @click.prevent="visibility = key">{{ key | capitalize }}</a>
        </li>
      </ul>
    </footer>
  </section>
</template>

<script>
import Todo from './Todo.vue'

const STORAGE_KEY = 'todos'
const filters = {
  all: todos => todos,
  active: todos => todos.filter(todo => !todo.done),
  completed: todos => todos.filter(todo => todo.done)
}
const defaultList = [
  { text: 'Vue2升级Vue3', done: false },
  { text: 'Element-UI升级Element-Plus', done: false },
  { text: '商城应用Android、IOS端适配开发', done: false },
  { text: 'IM即时通讯(Netty/ZooKeeper/Redis)', done: false },
  { text: 'ElasticSearch商品搜索', done: false },
  { text: '分库分表实践', done: false },
  { text: 'Seata-TCC模式', done: false },
  { text: '微服务链路追踪', done: false },
  { text: '多租户', done: false },
  { text: 'ELK日志收集->ELFK日志收集', done: false },
  { text: '微服务流控Sentinel', done: true },
  { text: 'ELK日志搜集', done: true },
  { text: 'RabbitMQ死信队列-订单超时取消', done: true },
  { text: 'Redission分布式锁', done: true },
  { text: 'Seata-AT模式', done: true },
  { text: '微服务基础设施', done: true },
  { text: 'OAuth2 + JWT统一认证鉴权', done: true },
  { text: 'RBAC权限设计', done: true }
]
export default {
  components: { Todo },
  data() {
    return {
      visibility: 'all',
      filters,
      todos: defaultList
    }
  },
  computed: {
    allChecked() {
      return this.todos.every(todo => todo.done)
    },
    filteredTodos() {
      return filters[this.visibility](this.todos)
    },
    remaining() {
      return this.todos.filter(todo => !todo.done).length
    }
  },
  methods: {
    pluralize(n, w){
      return  n === 1 ? w : w + 's'
    },
    capitalize(s){
      return  s.charAt(0).toUpperCase() + s.slice(1)
    },
    setLocalStorage() {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.todos))
    },
    addTodo(e) {
      const text = e.target.value
      if (text.trim()) {
        this.todos.push({
          text,
          done: false
        })
        this.setLocalStorage()
      }
      e.target.value = ''
    },
    toggleTodo(val) {
      val.done = !val.done
      this.setLocalStorage()
    },
    deleteTodo(todo) {
      this.todos.splice(this.todos.indexOf(todo), 1)
      this.setLocalStorage()
    },
    editTodo({ todo, value }) {
      todo.text = value
      this.setLocalStorage()
    },
    clearCompleted() {
      this.todos = this.todos.filter(todo => !todo.done)
      this.setLocalStorage()
    },
    toggleAll({ done }) {
      this.todos.forEach(todo => {
        todo.done = done
        this.setLocalStorage()
      })
    }
  }
}
</script>

<style lang="scss">
  @import './index.scss';
</style>
