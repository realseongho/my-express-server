import express from "express";
import Todo from "../models/Todo.js";
const router = express.Router();

// 로그인한 유저의 todolist CRUD 구현
// 로그인 하지 않은 경우 접근 권한 x

router.get("/", async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.user.id });
    if (todos.length === 0) {
      return res.status(404).json({ message: "Todos not found" });
    }
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  const { title, description } = req.body;
  try {
    const newTodo = new Todo({ title, description, userId: req.user.id });
    const savedTodo = await newTodo.save();
    if (!savedTodo) {
      throw new Error("Todo save operation failed");
    }
    res.status(201).json({ message: "Todo joined successfully" });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

router.put("/:id", async (req, res) => {
  const {
    params: { id },
    body: { title, description, completed, dueDate },
  } = req;
  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: id, userId: req.user.id }, // _id와 userId를 조건으로 검색
      { title, description, completed, dueDate }, // 업데이트할 필드들
      { new: true } // 업데이트된 문서를 반환
    );

    if (!todo) {
      return res.status(404).json({
        message:
          "Todo not found or you do not have permission to update this todo",
      });
    }
    res.json(todo);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const todelete = await Todo.findOneAndDelete({
      userId: req.user.id,
      _id: req.params.id,
    });

    if (!todelete) {
      return res.status(404).json({
        message:
          "Todo not found or you do not have permission to delete this todo",
      });
    }
    res.json(todelete);
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

export default router;
