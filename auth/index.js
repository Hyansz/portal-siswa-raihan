const express = require("express");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { generateRandomToken } = require("./randomToken");
const app = express();
app.use(express.json());

const User = mongoose.model("User", {
    id: String,
    nama: String,
    NIS: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    token: String,
    status: { type: String, default: "aktif" },
    role: { type: String, default: "siswa" },
});

app.post("/register", async (req, res) => {
    try {
        const { nama, NIS, password } = req.body;

        if (nama.length < 3 || nama.length > 20) {
            return res
                .status(400)
                .json({ message: "Nama harus memiliki 3-20 karakter." });
        }

        if (NIS.length !== 5) {
            return res
                .status(400)
                .json({ message: "NIS harus memiliki 5 karakter." });
        }

        if (password.length < 6 || password.length > 14) {
            return res
                .status(400)
                .json({ message: "Password harus memiliki 6-14 karakter." });
        }

        const id = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ id, nama, NIS, password: hashedPassword });
        await user.save();

        res.status(201).json({ message: "Pendaftaran berhasil." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan saat mendaftar." });
    }
});

// Login
app.post("/login", async (req, res) => {
    try {
        const { NIS, password } = req.body;
        const user = await User.findOne({ NIS });

        if (
            !user ||
            !(await bcrypt.compare(password, user.password)) ||
            user.status !== "aktif"
        ) {
            return res.status(401).json({ message: "Login gagal." });
        }

        const token = generateRandomToken(20);
        user.token = token;
        await user.save();

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Terjadi kesalahan saat login." });
    }
});

// Cek Token
app.post("/cektoken", async (req, res) => {
    const { token } = req.body;
    const user = await User.findOne({ token });

    if (!user) {
        return res.status(404).json({ message: "Token tidak ditemukan." });
    }

    const userData = {
        id: user.id,
        nama: user.nama,
        NIS: user.NIS,
        status: user.status,
        role: user.role,
    };

    res.json(userData);
});

// Logout
app.post("/logout", async (req, res) => {
    const { token } = req.body;
    const user = await User.findOne({ token });

    if (!user) {
        return res.status(401).json({ message: "Token tidak valid." });
    }

    user.token = "";
    await user.save();

    res.json({ message: "Logout berhasil." });
});

app.listen(3000, () => {
    console.log("Halo cuyy, Server sudah jalan di http://localhost:3000");
});
