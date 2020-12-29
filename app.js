// const sortCompleted = document.getElementById("sort-completed");
// const sortAll = document.getElementById("sort-all");
// const sortDate = document.getElementById("sort-date");
// sortCompleted.addEventListener("click", sortCompletedTasks);
// sortAll.addEventListener("click", sortAllTasks);
// sortDate.addEventListener("click", sortByDate);                 select click doesnt work in chrome and edge but works on mozilla

const todoInput = document.querySelector(".todo-input");
const dateInput = document.querySelector(".date-input");
const todoButton = document.querySelector(".todo-button");
const todoList = document.querySelector(".todo-list");
const deletePopup = document.getElementById("confirm-box");
const confirmDelete = document.getElementById("confirm");
const cancelDelete = document.getElementById("cancel");
const test = document.querySelectorAll(".todo-item");
var item; // used so that when delete confirmation pops up we don't forget what item to delete

document.addEventListener("DOMContentLoaded", updateViewEverySecond);
todoButton.addEventListener("click", addTodo);
todoList.addEventListener("click", deleteCheck);
todoInput.addEventListener("input", removeError);
confirmDelete.addEventListener("click", deleteTask);
cancelDelete.addEventListener("click", cancelDeleteTask);

function updateViewEverySecond() {
  updateView();
  setInterval(function () {
    updateView();
  }, 1000);
}

function removeError(e) {
  document.getElementById("error").style.display = "none";
}

function getTimeDiff(taskDeadline) {
  if (taskDeadline === "") {
    return "";
  }
  let currentTime = new Date();
  const test = new Date(taskDeadline.concat(":00.000Z"));
  test.setHours(test.getHours() - 2);

  var timeDiff = test.getTime() - currentTime.getTime();
  var minutes = Math.floor(timeDiff / (1000 * 60));
  var hours = Math.floor(minutes / 60);
  var days = Math.floor(hours / 24);
  hours = hours - days * 24;
  minutes = minutes - hours * 60 - days * 24 * 60 + 1;
  if (hours === 0 && days === 0) {
    return minutes + "m";
  } else if (days === 0) {
    return hours + "h " + minutes + "m";
  }
  return days + "d " + hours + "h " + minutes + "m";
}

function addTodo(event) {
  event.preventDefault();
  if (todoInput.value.trim().length === 0) {
    const error = document.getElementById("test");
    document.getElementById("error").style.display = "block";
    return;
  }

  var remainingTime = getTimeDiff(dateInput.value);

  const todoDiv = document.createElement("div");
  todoDiv.classList.add("todo");

  const newTodo = document.createElement("li");
  newTodo.innerHTML = todoInput.value + "<span>" + remainingTime + "</span>";
  newTodo.classList.add("todo-item");
  todoDiv.appendChild(newTodo);

  var save = {
    text: todoInput.value,
    complete: false,
    date: dateInput.value,
  };

  saveAddedTask(save);

  const completedButton = document.createElement("button");
  completedButton.innerHTML = '<i class = "fas fa-check"></i>';
  completedButton.classList.add("complete-btn");
  todoDiv.appendChild(completedButton);

  const trashButton = document.createElement("button");
  trashButton.innerHTML = '<i class = "fas fa-trash"></i>';
  trashButton.classList.add("trash-btn");
  todoDiv.appendChild(trashButton);

  todoList.appendChild(todoDiv);

  todoInput.value = "";
  dateInput.value = "";
}
//delete upon confirmation
function deleteTask() {
  const todo = item.parentElement;
  removeSessionTodo(todo);
  todo.remove();
  deletePopup.style.display = "none";
}
//hides delete confirmation box since it was canceled
function cancelDeleteTask() {
  deletePopup.style.display = "none";
}
//delets and marks tasks as completed
function deleteCheck(event) {
  item = event.target;
  if (item.classList[0] === "trash-btn") {
    deletePopup.style.display = "block";
  }

  if (item.classList[0] === "complete-btn") {
    const todo = item.parentElement;
    var existing = sessionStorage.getItem("todos");
    existing = existing ? JSON.parse(existing) : {};
    var completedTask;
    for (task of existing) {
      var remainingTime = getTimeDiff(task.date);
      var currentTask;
      if (remainingTime === "") {
        currentTask = task.text;
      } else {
        currentTask = task.text.trimRight() + "\n" + remainingTime;
      }
      if (currentTask === todo.childNodes[0].innerText) {
        task.complete = !task.complete;
        completedTask = task;
      }
    }
    //send completed item to the back  of the list if currently sort by date is not selected
    if (
      completedTask.complete &&
      document.querySelector(".filter-todo").getElementsByTagName("option")[2]
        .disabled === false
    ) {
      existing.sort(function (x, y) {
        return x.text == completedTask.text
          ? 1
          : y.text == completedTask.text
          ? -1
          : 0;
      });
    }

    sessionStorage.setItem("todos", JSON.stringify(existing));
    updateView();
  }
}

//remove old data and load from updated session storage data
function updateView() {
  const todos = todoList.childNodes;
  todoList.innerHTML = "";
  getTodos();
}
//sorts so that latest completed task is first
function sortCompletedTasks(e) {
  var myTodos = sessionStorage.getItem("todos");
  myTodos = myTodos ? JSON.parse(myTodos) : {};
  //reverse completed items so that last completed item is first
  var reversedNum = [];
  myTodos.map((val) => {
    if (val.complete) {
      reversedNum.unshift(val);
    } else {
      reversedNum.push(val);
    }
  });
  myTodos = reversedNum;

  //sort tasks so that completed tasks are first
  myTodos.sort(function (x, y) {
    return x.complete === y.complete ? 0 : x.complete ? -1 : 1;
  });
  sessionStorage.setItem("todos", JSON.stringify(myTodos));
  updateView();

  //disable selecting same filter option and enable all others
  var selector = document
    .querySelector(".filter-todo")
    .getElementsByTagName("option");
  selector[0].disabled = false;
  selector[1].disabled = true;
  selector[2].disabled = false;
}
//Basic sort that places all not completed items first
function sortAllTasks(e) {
  var myTodos = sessionStorage.getItem("todos");
  myTodos = myTodos ? JSON.parse(myTodos) : {};

  //sort tasks so that not completed tasks are first
  myTodos.sort(function (x, y) {
    return x.complete === y.complete ? 0 : x.complete ? 1 : -1;
  });
  sessionStorage.setItem("todos", JSON.stringify(myTodos));
  updateView();
  //disable selecting same filter option and enable all others
  var selector = document
    .querySelector(".filter-todo")
    .getElementsByTagName("option");
  selector[0].disabled = true;
  selector[1].disabled = false;
  selector[2].disabled = false;
}
//sorts so that item with
function sortByDate() {
  var myTodos = sessionStorage.getItem("todos");
  myTodos = myTodos ? JSON.parse(myTodos) : {};
  console.log("imhere");
  //sort tasks so that not completed tasks are first
  myTodos.sort(function (x, y) {
    if (x.date === "") return 1;
    if (y.date === "") return -1;
    let xdate = new Date(x.date.concat(":00.000Z"));
    let ydate = new Date(y.date.concat(":00.000Z"));
    var counter = 0;
    if (xdate > ydate) return 1;
    if (xdate < ydate) return -1;
    return 0;
  });

  sessionStorage.setItem("todos", JSON.stringify(myTodos));
  updateView();
  //disable selecting same filter option and enable all others
  var selector = document
    .querySelector(".filter-todo")
    .getElementsByTagName("option");
  selector[0].disabled = false;
  selector[1].disabled = false;
  selector[2].disabled = true;
}

function saveAddedTask(todo) {
  let todos;
  if (sessionStorage.getItem("todos") === null) {
    todos = [];
  } else {
    todos = JSON.parse(sessionStorage.getItem("todos"));
  }
  todos.push(todo);
  sessionStorage.setItem("todos", JSON.stringify(todos));
}

function getTodos() {
  let todos;
  if (sessionStorage.getItem("todos") === null) {
    todos = [];
  } else {
    todos = JSON.parse(sessionStorage.getItem("todos"));
  }
  todos.forEach(function (todo) {
    var remainingTime = getTimeDiff(todo.date);

    const todoDiv = document.createElement("div");
    todoDiv.classList.add("todo");

    const newTodo = document.createElement("li");
    newTodo.innerHTML = todo.text + "<span>" + remainingTime + "</span>";

    newTodo.classList.add("todo-item");
    todoDiv.appendChild(newTodo);

    const completedButton = document.createElement("button");
    completedButton.innerHTML = '<i class = "fas fa-check"></i>';
    completedButton.classList.add("complete-btn");
    todoDiv.appendChild(completedButton);

    const trashButton = document.createElement("button");
    trashButton.innerHTML = '<i class = "fas fa-trash"></i>';
    trashButton.classList.add("trash-btn");
    todoDiv.appendChild(trashButton);
    if (todo.complete === true) {
      todoDiv.classList.toggle("completed");
    }
    todoList.appendChild(todoDiv);
  });
}

function removeSessionTodo(todo) {
  let todos;
  if (sessionStorage.getItem("todos") === null) {
    todos = [];
  } else {
    todos = JSON.parse(sessionStorage.getItem("todos"));
  }
  for (task of todos) {
    var remainingTime = getTimeDiff(task.date);
    var currentTask;
    if (remainingTime === "") {
      currentTask = task.text;
    } else {
      currentTask = task.text + remainingTime;
    }
    if (currentTask === todo.childNodes[0].innerText) {
      todos.splice(todos.indexOf(task), 1);
    }
  }
  sessionStorage.setItem("todos", JSON.stringify(todos));
}
