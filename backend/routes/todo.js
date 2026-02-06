import { Router } from 'express'
import pool from '../db.js'
const router = Router();

//create a new todo
router.post("/", async (req, res) => {
    try {
        const { description, completed } = req.body;
        const newTodo = await pool.query(
            "INSERT INTO todo(description,completed) VALUES ($1,$2) RETURNING * ",
            [description, completed || false]
        );
        res.json((newTodo).rows[0]);

    } catch (error) {
        console.log(error)
        res.status(500).send("SERVER ERROR")
    }
});

router.get("/", async (req, res) => {
    try {
        const allTodos = await pool.query("SELECT * FROM todo")
        res.json(allTodos.rows)
    } catch (error) {
        console.log(error)
        res.status(500).send("SERVER ERROR")
    }
});


router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { description, completed } = req.body;
        const updatedTodo = await pool.query(
            "UPDATE todo SET description= $1,completed= $2 WHERE todo_id = $3 RETURNING *",
            [description, completed, id]
        );

        res.json({
            message: "Todo updated",
            todo: updatedTodo.rows[0]
        });

    } catch (error) {
        console.log(error)
        res.status(500).send("SERVER ERROR")
    }
})

router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(
            "DELETE FROM todo where todo_id=$1", [id]
        )
        res.json("Todo deleted");

    } catch (error) {
        console.log(error)
        res.status(500).send("SERVER ERROR")

    }
})

export default router;