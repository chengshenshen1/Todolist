// key
const STORAGE_KEY = 'my_todos_key';

// 根据不同状态过滤后的子数组
let filters = {
	all(todoList){
		return todoList;
	},
	active(todoList){
		return todoList.filter(function (todo) {
			return !todo.completed;
		});
	},
	completed(todoList){
		return todoList.filter(function (todo) {
			return todo.completed;
		});
	}
}
// 本地存储
let todoStorage = {
	fetch(){
		let todoList = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
		return todoList;
	},
	save(todoList) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(todoList))
	}
}

// 创建Vue对象
let vm = new Vue({

	el: '.todo_app',
	data: {
		todoList: todoStorage.fetch(),
		newTodo: '',
		visibility: 'all'
	},
	filters: {
		pluralize(value){
			return value === 1 ? 'item' : 'items';
		}
	},
	methods: {
		addTodo(){
			if(this.newTodo){
				let todo = this.newTodo.trim();
				this.todoList.push({'label': todo, 'completed': false, 'editing': false});
				this.newTodo = '';
			}
		},
		removeTodo(index) {
			this.todoList.splice(index,1);
		},
		editTodo(todo) {
			this.editingTodoOldValue = todo.label;
			todo.editing = true;
		},
		finishEdit(todo,index) {
			if(!todo.editing){
				return;
			}
			todo.editing = false;
			todo.label = todo.label.trim();
			if(!todo.label) {
				this.todoList.splice(index,1);
			}
		},
		cancelEdit(todo) {
			todo.editing = false;
			todo.label = this.editingTodoOldValue;
		},
		removeCompleted() {
			this.todoList = filters.active(this.todoList);
		}
	},
	directives: {
		'auto-focus': function(el, value) {
			if (value) {
				el.focus();
			}
		}
	},
	watch: {
			// 数据发生改变后保存到本地
			todoList: {
				handler(todoList) {
					todoStorage.save(todoList)
				},
				deep: true
			}
		},
		computed: {
			remaining(){
				return filters.active(this.todoList).length;
			},
			toggleAllChecked: {
				get() {
					return this.remaining === 0;
				},
				set(value) {
					this.todoList.forEach(function (todo) {
						todo.completed = value;
					});
				}
			},
			filterTodoList(){
				return filters[this.visibility](this.todoList);
			}
		}
})

// 监听方法
function onHashChange(){
	let visibility = window.location.hash.replace(/#\/?/, '');
	if(filters[visibility]) {
		vm.visibility = visibility;
	}else {
		window.location.hash = ''
		vm.visibility = 'all';
	}
}

// 添加事件监听
window.addEventListener('hashchange', onHashChange)
onHashChange()


