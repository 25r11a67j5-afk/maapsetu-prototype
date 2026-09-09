const express = require("express");
const cors = require("cors");
require("dotenv").config();

const supabase = require("./config/supabase");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "MAAPSETU backend is running"
    });
});

app.get("/api/test-db", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("profiles")
            .select("id")
            .limit(1);

        if (error) {
            console.error("Supabase error:", error);

            return res.status(500).json({
                success: false,
                message: "Database connection failed",
                error: error.message
            });
        }

        res.json({
            success: true,
            message: "MAAPSETU backend is connected to Supabase",
            data: data
        });

    } catch (error) {
        console.error("Server error:", error);

        res.status(500).json({
            success: false,
            message: "Unexpected server error"
        });
    }
});

app.listen(PORT, () => {
    console.log(`MAAPSETU backend running on port ${PORT}`);
});