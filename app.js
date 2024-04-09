
/**
 * Represente l'application TODO.
 * @class
 */
class TodoApp {
    #todos = [];
    #todosTerminees = [];
    #todoIdIncrement = 0;

    // UI Elements

    /**
     * The form element for creating TODOs.
     * @type {HTMLFormElement}
     */
    #appUI = document.getElementById("app");
    #todoForm = document.getElementById("todoForm");
    #btnNouveauTodo = document.getElementById("btnNouveauTodo");
    #btnAjouterTodo = document.getElementById("btnAjouterTodo");
    #btnAnnulerTodo = document.getElementById("btnAnnulerTodo");
    #todosList = document.getElementById("todosList");
    #todosTermineesList = document.getElementById("todosTermineesList");

    constructor() {
        this.#todos = [];
    }

    init() {
        this.#btnNouveauTodo.addEventListener(
            "click",
            this.afficheTodoForm.bind(this, false)
        );

        this.#btnAjouterTodo.addEventListener(
            "click",
            this.creerTodo.bind(this)
        );
        this.#btnAnnulerTodo.addEventListener(
            "click",
            this.afficheTodoForm.bind(this, true)
        );

        this.#appUI.addEventListener("todosUpdated", this.afficherTodos.bind(this));
        this.#appUI.addEventListener("todosTermineesUpdated", this.afficherTodosTerminees.bind(this));

        this.dispatchTodosUpdated();
        this.dispatchTodosTermineesUpdated();
        console.log("Application initialisée avec succès.");
        console.log(this.#todos);
    }

    afficheTodoForm(annuler = false) {
        if (annuler) {
            this.#todoForm.classList.remove("active", "already-active");
            this.#todoForm.reset();
        } else {
            if (this.#todoForm.classList.contains("active")) {
                this.#todoForm.classList.add("already-active");
                
            } else {
                this.#todoForm.classList.add("active");
            }
        }
    }

    creerTodo() {
        let titre = this.#todoForm.elements["todoTitre"];
        let dateEcheance = this.#todoForm.elements["todoDateEcheance"];
        let heureEcheance = this.#todoForm.elements["todoHeureEcheance"];

        let dateEcheanceValue = new Date(`${dateEcheance.value}${heureEcheance.value ? "T" + heureEcheance.value : ""}` ?? undefined);
        
        let todo = new Todo(
            titre.value,
            dateEcheanceValue ?? new Date()
        );

        console.log(titre.value, dateEcheance.value, heureEcheance.value);
        console.log(todo);
        this.ajouterTodo(todo);
        this.afficheTodoForm(true);
    }

    /**
     * Ajoute un nouveau todo à la liste des todos.
     * @param {Todo} todo - L'objet todo à ajouter.
     */
    ajouterTodo(todo) {
        todo.id = this.#todoIdIncrement++;
        this.#todos.push(todo);
        this.#todos.sort((a, b) => {
            // Compare les dates d'échéance
            let date_a = new Date(a.dateEcheance + "T" + a.heureEcheance);
            let date_b = new Date(b.dateEcheance + "T" + b.heureEcheance);
            return date_a.getTime() - date_b.getTime();
        });

        this.dispatchTodosUpdated();
    }

    dispatchTodosUpdated() {
        this.#appUI.dispatchEvent(new CustomEvent("todosUpdated", {
            detail: {
                todos: this.#todos
            }
        }));
    }

    dispatchTodosTermineesUpdated() {
        this.#appUI.dispatchEvent(new CustomEvent("todosTermineesUpdated", {
            detail: {
                todosTerminees: this.#todosTerminees
            }
        }));
    }

    terminerTodo(todoId) {
        let todo = this.#todos.find(todo => todo.id === todoId);
        todo.estTerminee = true;
        this.#todosTerminees.push(todo);
        this.supprimerTodo(todoId);
        this.dispatchTodosTermineesUpdated();
    }

    supprimerTodo(todoId) {
        this.#todos = this.#todos.filter(todo => todo.id !== todoId);
        this.dispatchTodosUpdated();
    }

    supprimerTodoTerminee(todoId) {
        this.#todosTerminees = this.#todosTerminees.filter(todo => todo.id !== todoId);
        this.dispatchTodosTermineesUpdated();
    }

    updateTodoTitre(todoId, titre) {
        let todo = this.#todos.find(todo => todo.id === todoId);
        todo.titre = titre;
    }

    afficherTodos(event) {
        if (this.#todos.length === 0) {
            this.#todosList.innerHTML = "<h3 class='section-title'>Rien à faire</h3>";
            return;
        }

        this.#todosList.innerHTML = ``;

        this.#todos.forEach((todo) => {
            let todoItem = document.createElement("div");
            todoItem.classList.add("task");
            todoItem.innerHTML = `
                <div class="task-icon">
                    <img src="img/Object.png" alt="task icon">
                </div>
                <div class="task-content">
                    <h3 class="task-title" contenteditable onchange="app.updateTodoTitre(${todo.id}, this.innerText)">${todo.titre}</h3>
                    <p class="task-infos">${todo.dateEcheance} - ${todo.heureEcheance}</p>
                </div>
                <div class="task-actions">
                    <button class="btn-check btn-icon" onclick="app.terminerTodo(${todo.id})">
                    <i class="bi bi-check-square"></i>
                    </button>
                    <button class="btn-delete btn-icon" onclick="app.supprimerTodo(${todo.id})">
                    <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            `;

            todosList.appendChild(todoItem);
        });
    }

    afficherTodosTerminees(event) {
        if (this.#todosTerminees.length === 0) {
            this.#todosTermineesList.innerHTML = "";
            return;
        }

        this.#todosTermineesList.innerHTML = `<h3 class="section-title">Completées</h3>`;

        this.#todosTerminees.forEach((todo) => {
            let todoItem = document.createElement("div");
            todoItem.setAttribute("data-id", todo.id);
            todoItem.classList.add("task", "task-done");
            todoItem.innerHTML = `
                <div class="task-icon">
                    <img src="img/Object.png" alt="task icon">
                </div>
                <div class="task-content">
                    <h3 class="task-title">${todo.titre}</h3>
                    <p class="task-infos">${todo.dateEcheance} - ${todo.heureEcheance}</p>
                </div>
                <div class="task-actions">
                    <button class="btn-delete btn-icon" onclick="app.supprimerTodoTerminee(${todo.id})">
                    <i class="bi bi-trash-fill"></i>
                    </button>
                </div>
            `;
            todosTermineesList.appendChild(todoItem);
        });
    }

    getTodos() {
        return this.#todos;
    }
}

/**
 * Represente une tache Todo.
 */
class Todo {
    
    #id = 0;
    /** @type {String} */
    #dateEcheance = null;
    #heureEcheance = null;
    #estTerminee = false;
    #titre = "";

    constructor(titre, dateEcheance, estTerminee = false) {
        this.#titre = titre;
        this.dateEcheance = dateEcheance;
        this.heureEcheance = dateEcheance;
        this.estTerminee = estTerminee;
    }

    set dateEcheance(date) {
        if (date instanceof Date) {
            this.#dateEcheance = date.toLocaleDateString();
        } else if (typeof date === 'string') {
            this.#dateEcheance = new Date(date).toLocaleDateString();
        } else if (date === null) {
            this.#dateEcheance = null;
        } 
    }

    get dateEcheance() {
        return this.#dateEcheance;
    }

    set heureEcheance(heure) {
        if (heure instanceof Date) {
            this.#heureEcheance = heure.toLocaleTimeString();
        } else if (typeof heure === 'string') {
            this.#heureEcheance = new Date(this.dateEcheance + 'T' + heure).toLocaleTimeString();
        } else if (heure === null) {
            this.#heureEcheance = null;
        } 
    }

    get heureEcheance() {
        return this.#heureEcheance;
    }

    set estTerminee(estTerminee) {
        this.#estTerminee = (typeof estTerminee == 'boolean') ?estTerminee : false;
    }

    get estTerminee() {
        return this.#estTerminee;
    }

    get titre() {
        return this.#titre;
    }

    set titre(titre) {
        titre = titre.charAt(0).toUpperCase() + titre.slice(1);
        this.#titre = titre;
    }
}

let app = new TodoApp();
window.addEventListener('load', () => {
    app.init();
});