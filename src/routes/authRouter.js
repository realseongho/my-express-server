import { Router } from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = Router();

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    req.logIn(user, { session: false }, (err) => {
      if (err) {
        return next(err);
      }
      const accessToken = jwt.sign(
        { id: user._id, username: user.username },
        "kitri_secret",
        { expiresIn: "10m" }
      );
      return res.status(200).json({ accessToken });
    });
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ message: "Logged out successfully" });
  });
});

router.post("/join", async (req, res) => {
  const { username, age, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) {
      return res.status(409).json({ message: "User already exists" });
    }
    const newUser = new User({ username, password, age });
    const savedUser = await newUser.save();

    if (!savedUser) {
      throw new Error("User save operation failed");
    }
    res.status(201).json({ message: "User joined successfully" });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

router.put("/change-password", async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findOne({ username: req.user.username });

    if (!user || oldPassword != user.password) {
      return res.status(401).json({ message: "Authentication failed" });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

router.delete("/delete-account", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });

    await User.deleteOne({ username: req.user.username });
    // 세션 지우기
    req.logOut((err) => {
      if (err) {
        console.error("Error logging out:", err);
        return res.status(500).json({ message: "Error logging out" });
      }
    });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).send("Internal server error");
  }
});

// 세션 읽기
router.get("/get-session", (req, res) => {
  const username = req.user.id;
  res.send(`Session value: ${username}`);
});
export default router;
