const express = require("express");
const { UserModel, TodoModel } = require("./db");
const { auth, JWT_SECRET } = require("./auth");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

mongoose.connect("mongodb+srv://jainakshat0730:zC2pPWe54OGir2ki@cluster0.sugf2.mongodb.net/todo-app-database", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

const app = express();
app.use(express.json());

// Signup Route
app.post("/signup", async function(req, res) {
    try {
        const { email, password, name } = req.body;

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        await UserModel.create({
            email,
            password: hashedPassword,  // Store the hashed password
            name
        });

        res.json({
            message: "You are signed up"
        });
    } catch (error) {
        res.status(500).json({ error: "Signup failed: " + error.message });
    }
});

// Signin Route
app.post("/signin", async function(req, res) {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(403).json({ message: "Incorrect email or password" });
        }

        // Compare the hashed password with the incoming password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(403).json({ message: "Incorrect email or password" });
        }

        const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET);

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: "Signin failed: " + error.message });
    }
});

// Create Todo Route
app.post("/todo", auth, async function(req, res) {
    try {
        const userId = req.userId;
        const { title, done } = req.body;

        await TodoModel.create({
            userId,
            title,
            done
        });

        res.json({ message: "Todo created" });
    } catch (error) {
        res.status(500).json({ error: "Failed to create todo: " + error.message });
    }
});

// Get Todos Route
app.get("/todos", auth, async function(req, res) {
    try {
        const userId = req.userId;

        const todos = await TodoModel.find({ userId });

        res.json({ todos });
    } catch (error) {
        res.status(500).json({ error: "Failed to retrieve todos: " + error.message });
    }
});

// Listen on port 3000
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
