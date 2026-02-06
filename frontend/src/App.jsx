import { useEffect, useState } from "react";
import axios from "axios";
import { MdModeEditOutline, MdOutlineDone } from "react-icons/md";
import { FaTrash } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import { API_URL } from "./api.js";

function App() {
  const [description, setDescription] = useState("");
  const [todos, setTodos] = useState([]); // ALWAYS ARRAY
  const [editingTodo, setEditingTodo] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ---------------- FETCH TODOS ----------------
  const getTodos = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(`${API_URL}/todos`);

      // 🔒 DEFENSIVE: ensure array
      setTodos(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch todos.");
      setTodos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTodos();
  }, []);

  // ---------------- ADD TODO ----------------
  const onSubmitForm = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      setError(null);
      const res = await axios.post(`${API_URL}/todos`, {
        description: description.trim(),
        completed: false,
      });

      setTodos((prev) => [...prev, res.data]);
      setDescription("");
    } catch (err) {
      console.error(err);
      setError("Failed to add todo.");
    }
  };

  // ---------------- SAVE EDIT ----------------
  const saveEdit = async (id) => {
    const trimmedText = editedText.trim();
    if (!trimmedText) {
      setError("Todo cannot be empty.");
      return;
    }

    try {
      setError(null);

      const res = await axios.put(`${API_URL}/todos/${id}`, {
        description: trimmedText,
      });

      setTodos((prev) =>
        prev.map((todo) =>
          todo.todo_id === id ? res.data : todo
        )
      );

      setEditingTodo(null);
      setEditedText("");
    } catch (err) {
      console.error(err);
      setError("Failed to update todo.");
    }
  };

  // ---------------- DELETE TODO ----------------
  const deleteTodo = async (id) => {
    try {
      setError(null);
      await axios.delete(`${API_URL}/todos/${id}`);

      setTodos((prev) => prev.filter((todo) => todo.todo_id !== id));
    } catch (err) {
      console.error(err);
      setError("Failed to delete todo.");
    }
  };

  // ---------------- TOGGLE COMPLETED ----------------
  const toggleCompleted = async (id) => {
    const todo = todos.find((t) => t.todo_id === id);
    if (!todo) return;

    try {
      setError(null);

      const res = await axios.put(`${API_URL}/todos/${id}`, {
        completed: !todo.completed,
      });

      setTodos((prev) =>
        prev.map((t) =>
          t.todo_id === id ? res.data : t
        )
      );
    } catch (err) {
      console.error(err);
      setError("Failed to update todo.");
    }
  };

  // ---------------- RENDER ----------------
  return (
    <div className="min-h-screen bg-gray-800 flex justify-center items-center p-4">
      <div className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-lg p-8">
        <h1 className="text-4xl font-bold mb-6">PERN TODO APP</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* ADD TODO */}
        <form
          onSubmit={onSubmitForm}
          className="flex gap-2 mb-6 border p-2 rounded"
        >
          <input
            className="flex-1 px-3 py-2 outline-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What needs to be done?"
          />
          <button className="bg-blue-500 text-white px-4 rounded">
            Add
          </button>
        </form>

        {/* TODOS */}
        {loading ? (
          <p>Loading...</p>
        ) : !Array.isArray(todos) || todos.length === 0 ? (
          <p>No tasks available.</p>
        ) : (
          <div className="space-y-4">
            {todos.map((todo) => (
              <div key={todo.todo_id}>
                {editingTodo === todo.todo_id ? (
                  <div className="flex gap-2">
                    <input
                      autoFocus
                      className="flex-1 border p-2"
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                    />
                    <button
                      onClick={() => saveEdit(todo.todo_id)}
                      className="bg-green-500 text-white px-3 rounded"
                    >
                      <MdOutlineDone />
                    </button>
                    <button
                      onClick={() => {
                        setEditingTodo(null);
                        setEditedText("");
                      }}
                      className="bg-gray-500 text-white px-3 rounded"
                    >
                      <IoClose />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleCompleted(todo.todo_id)}
                        className={`h-5 w-5 rounded-full border ${
                          todo.completed ? "bg-green-500" : ""
                        }`}
                      />
                      <span
                        className={
                          todo.completed ? "line-through text-gray-400" : ""
                        }
                      >
                        {todo.description}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTodo(todo.todo_id);
                          setEditedText(todo.description);
                        }}
                      >
                        <MdModeEditOutline />
                      </button>
                      <button onClick={() => deleteTodo(todo.todo_id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
