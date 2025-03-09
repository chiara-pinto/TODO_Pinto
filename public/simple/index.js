const createMiddleware = () => {
    return {
        send: (todo) => {
            return fetch("/todo/add", {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(todo)
            }).then(response => response.json());
        },
        load: () => {
            return fetch("/todo").then(response => response.json());
        },
        put: (todo) => {
            return fetch("/todo/complete", {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(todo)
            }).then(response => response.json());
        },
        delete: (id) => {
            return fetch("/todo/" + id, {
                method: 'DELETE'
            }).then(response => response.json());
        }
    };
};

const createForm = (add) => {
    const inputInsert = document.querySelector("#inputInsert");
    const inputDate = document.querySelector("#inputDate");
    const buttonInsert = document.querySelector("#buttonInsert");
    buttonInsert.onclick = () => {
        add(inputInsert.value, inputDate.value);
        inputInsert.value = "";
        inputDate.value = "";
    };
};

const createList = () => {
    const listTable = document.querySelector("#listTable");
    const template = `
        <tr>
            <td class="%COLOR">%TASK</td>
            <td>%DATE</td>
            <td><button class="btn btn-success" id="COMPLETE_%ID">COMPLETA</button></td>
            <td><button class="btn btn-danger" id="DELETE_%ID">ELIMINA</button></td>
        </tr>
    `;
    return {
        render: (todos, completeTodo, deleteTodo) => {
            let html = "";
            todos.forEach((todo) => {
                let row = template.replace("COMPLETE_%ID", "COMPLETE_" + todo.id)
                                  .replace("DELETE_%ID", "DELETE_" + todo.id)
                                  .replace("%TASK", todo.name)
                                  .replace("%DATE", todo.date)
                                  .replace("%COLOR", todo.completed ? "text-success" : "text-primary");
                html += row;
            });
            listTable.innerHTML = html;
            todos.forEach((todo) => {
                document.querySelector("#COMPLETE_" + todo.id).onclick = () => completeTodo(todo.id);
                document.querySelector("#DELETE_" + todo.id).onclick = () => deleteTodo(todo.id);
            });
        }
    };
};

const createBusinessLogic = (middleware, list) => {
    let todos = [];
    const reload = () => {
        middleware.load().then((json) => {
            todos = json.todos;
            list.render(todos, completeTodo, deleteTodo);
        });
    };
    const completeTodo = (id) => {
        const todo = todos.find(todo => todo.id === id);
        middleware.put(todo).then(() => reload());
    };
    const deleteTodo = (id) => {
        middleware.delete(id).then(() => reload());
    };
    return {
        add: (task, date) => {
            const todo = { name: task, completed: false, date: date };
            middleware.send(todo).then(() => reload());
        },
        reload: reload
    };
};

const middleware = createMiddleware();
const list = createList();
const businessLogic = createBusinessLogic(middleware, list);
createForm(businessLogic.add);
businessLogic.reload();
