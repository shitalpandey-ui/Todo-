const express = require('express');
const { pool }= require('../config/connectToDatabase');

const router = express.Router();

//create a new todo
 router.post("/", async(req,res)=>{
    try{
        const {description, completed} = req.body;
        const newTodo = await pool.query(
            "INSERT INTO tasks (description, completed) VALUES ($1, $2) Returning *",
            [description, completed || false]);
        res.json(newTodo.rows[0]);    
    }catch(err){
        console.error(err.message);
        res.status(500).send("Server Error");
    }
 });

 //Get all todos or tasks

 router.get("/", async(req,res) =>{
    try{
        const allTodos = await pool.query("SELECT * FROM tasks");
        res.json(allTodos.rows);
    }catch(err){

        console.error(err.message);
        res.status(500).send("Server Error");
    }
 });

 //Update the todos or tasks

 router.get("/:id", async(req,res) => {
     try{
      const { id } = req.param;
      const { description, completed } = req.body;
      const updateTodo = await pool.query(
        "UPDATE tasks SET description = $1 , completed = $2 WHERE task_id = $3 RETURNING *",
        [description , completed , id]
      );

     }catch(err){
     console.error(err.message);
     res.status(500).send("Server Error");
     }
 });


module.exports = router;

