import { Router } from "express";
import pool from "../db.js";

const router = Router();

// ---------------- CREATE TODO ----------------
router.post("/", async (req, res) => {
    try {
        const { description, completed } = req.body;

        const result = await pool.query(
            "INSERT INTO todo (description, completed) VALUES ($1, $2) RETURNING *",
            [description, completed ?? false]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// ---------------- GET TODOS ----------------
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM todo ORDER BY todo_id DESC");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// ---------------- UPDATE TODO ----------------
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { description, completed } = req.body;

        const result = await pool.query(
            "UPDATE todo SET description = COALESCE($1, description), completed = COALESCE($2, completed) WHERE todo_id = $3 RETURNING *",
            [description, completed, id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

// ---------------- DELETE TODO ----------------
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM todo WHERE todo_id = $1", [id]);
        res.sendStatus(204); // ✅ no string response
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
