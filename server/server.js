const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const pool = require("./db");
const bcrypt = require("bcrypt");
const { sendEmail, testConnection } = require("./verifyEmail");


const app = express();

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

const firstAdminExit = async () => {
    const query = "SELECT * FROM users WHERE role=$1";
    const admin = await pool.query(query, ['admin']);
    if (admin.rows.length === 0) {
        return false;
    }
    return true;
};

const createDefaultUser = async () => {
    try {
        const name = process.env.DEFAULT_USER_NAME;
        const email = process.env.DEFAULT_USER_EMAIL;
        const token = jwt.sign({ user_id: name, email: email, name: name}, process.env.USER_LOGIN_SECRETE, { expiresIn: process.env.USER_LOGIN_TIME });
        const role = 'admin';
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(process.env.DEFAULT_USER_PASSWORD, salt);
        const query = "INSERT INTO users (name, email, password_hash, role, token) VALUES ($1, $2, $3, $4, $5)";
        if (await firstAdminExit()) {
            console.log("Admin already exits");
            return;
        }
        await pool.query(query, [name, email, hashedPassword, role, token]);
        console.log("Successfully inserted first user");
    } catch (err) {
        console.error(err.message);
    }
};
createDefaultUser();

const verifyToken = async (token, secret) => {
    try {
        if (!token) {
            return null;
        }
        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length);
        }
        // Use synchronous version to return decoded value directly
        try {
            const decoded = jwt.verify(token, secret);
            return decoded;
        } catch (err) {
            console.error("Token verification failed:", err.message);
            return null;
        }
    } catch (err) {
        console.error("Error verifying token:", err.message);
        return null;
    }
};

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const query = "SELECT * FROM users WHERE email = $1";
        const user = await pool.query(query, [email]);
        
        if (user.rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        if (!await bcrypt.compare(password, user.rows[0].password_hash)) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        // check if the user has a valid token
        let token;
        const varidToken = await verifyToken(user.rows[0].token, process.env.USER_LOGIN_SECRETE);
        if (!varidToken) {
            // If token is invalid or expired, generate a new one
            token = jwt.sign({ user_id: user.rows[0].user_id, email: user.rows[0].email, name: user.rows[0].name}, 
                            process.env.USER_LOGIN_SECRETE, { expiresIn: process.env.USER_LOGIN_TIME });
            // Update the token in the database
            const updateQuery = "UPDATE users SET token = $1 WHERE email = $2 RETURNING *";
            const tokenUpdate = await pool.query(updateQuery, [token, email]);     
            if (tokenUpdate && tokenUpdate.rows.length === 0) {
                return res.status(500).json({ error: "Failed to update token in the database" });
            }
            console.log("Successfully logged in and generated new token");
            return res.json({ token, user: { user_id: user.rows[0].user_id, email: user.rows[0].email, name: user.rows[0].name },
                    message: "Login successful." });
        }
        // If token is valid, return it
        token = user.rows[0].token;
        console.log("You're already logged in...");
        return res.json({ token, user: { user_id: user.rows[0].user_id, email: user.rows[0].email, name: user.rows[0].name },
        message: "You are already logged in." });
    } catch (err) {
        console.error("Error during login:", err.message);
        res.status(500).json({ error: "Internal server" });
    }
});

app.post("/api/register", async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: "Email, password, and name are required" });
        }

        // Check if user already exists in users table
        const userQuery = "SELECT * FROM users WHERE email = $1";
        const existingUser = await pool.query(userQuery, [email]);
        if (existingUser && existingUser.rows.length > 0) {
            return res.status(409).json({ error: "Email already exists" });
        }

        // Check if there is a pending verification for this email
        const pendingUserQuery = "SELECT * FROM pending_verifications WHERE email=$1";
        const pendingUser = await pool.query(pendingUserQuery, [email]);
        if (pendingUser && pendingUser.rows.length > 0) {
            if (pendingUser.rows[0].verified) {
                return res.status(400).json({ error: "Waiting for admin to aprove your registration request..." });
            }
            // Check if the token is still valid
            const verified = jwt.verify(pendingUser.rows[0].token, process.env.EMAIL_TOKEN_SECRET, (err) => !err);
            if (verified) {
                // If token is valid, don't send another email
                return res.status(400).json({ error: "A verification request is already pending for this email. Please check your email and verify your account." });
            } else {
                // If token expired, delete the pending user and allow new registration
                await pool.query("DELETE FROM pending_verifications WHERE email = $1", [email]);
            }
        }

        // If no pending user, create a new one and send verification email
        const token = jwt.sign({ email }, process.env.EMAIL_TOKEN_SECRET, { expiresIn: process.env.EMAIL_TOKEN_TIME });
        const verificationLink = `http://localhost:3000/api/verify-email?token=${token}`;
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        const insertQuery = "INSERT INTO pending_verifications (email, password_hash, name, token) VALUES ($1, $2, $3, $4) RETURNING *";
        const newUser = await pool.query(insertQuery, [email, hashedPassword, name, token]);

        const smtpTest = await testConnection();
        if (!smtpTest) {
            await pool.query("DELETE FROM pending_verifications WHERE email = $1", [email]);
            return res.status(500).json({ error: "SMTP server connection failed. Check your internet conncetion..." });
        }
        const sentEmail = await sendEmail(
            email,
            "Verify your email",
            `Please verify your email by clicking on the following link: ${verificationLink}`,
            `<p>Please verify your email by clicking on the following link: <a href="${verificationLink}">Verify Email</a></p>`
        );
        if (!sentEmail) {
            await pool.query("DELETE FROM pending_verifications WHERE email = $1", [email]);
            return res.status(500).json({ error: "Failed to send verification email" });
        }
        res.status(201).json({ message: "Registration successful. Please check your email to verify your account.", user: { id: newUser.rows[0].id, email: newUser.rows[0].email } });
    } catch (err) {
        console.error("Error during registration:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/api/verify-email", async (req, res) => {
    try {
        const { token } = req.query;
        if (!token) {
            return res.status(400).json({ error: "Token is required" });
        }
        const query = "SELECT * FROM pending_verifications WHERE token=$1";
        const pendingUser = await pool.query(query, [token]);
        if (pendingUser && pendingUser.rows.length === 0) {
            return res.status(404).json({ error: "Verification request not found: Invalid or expired token" });
        }
        if (pendingUser.rows[0].verified) {
            return res.status(400).json({ error: "Email already verified" });
        }
        let decoded = await verifyToken(token, process.env.EMAIL_TOKEN_SECRET);
        if (!decoded) {
            await pool.query("DELETE FROM pending_verifications WHERE token = $1", [token]);
            return res.status(400).json({ error: "Invalid or expired token" });
        } 
        if (await firstAdminExit()) {
            const updateQuery = "UPDATE pending_verifications SET verified = $1 WHERE token = $2 RETURNING *";
            const newUser = await pool.query(updateQuery, [true, token]);
            res.json({ message: "Email verified successfully. Wait for admin to approve your request within 24hrs", 
                user: { id: newUser.rows[0].id, email: newUser.rows[0].email } });
        } else {
            await pool.query("DELETE FROM pending_verifications WHERE token = $1", [token]);
            res.status(500).json({ error: "Internal server error: No admin found" });
        }
        
    } catch (err) {
        console.error("Error during email verification:", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});