const path = require("path");
const cors = require("cors");
const express = require("express");
const axios = require("axios");
const app = express();

const corsOptions = {
  origin: "http://localhost:30003",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(express.json());
// Route to handle test_conn API call
app.get("/test_conn", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:20004/test_conn");
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      console.error("Error calling /add_file:", error);
      res.status(500).json({ error: "Error calling /test_conn" });
    }
  }
});

// Route to handle add_file API call
app.patch("/add_file/:file_name", async (req, res) => {
  try {
    const { file_name } = req.params;
    const response = await axios.patch(`http://localhost:20004/add_file/${file_name}`);
    res.json(response.data);
  } catch (error) {
    console.error("Error calling /add_file:", error);
    res.status(500).json({ error: "Error calling /add_file" });
  }
});

// Route to handle delete_file API call
app.patch("/delete_file/:file_name", async (req, res) => {
  try {
    const { file_name } = req.params;
    const response = await axios.patch(`http://localhost:20004/delete_file/${file_name}`);
    res.json(response.data);
  } catch (error) {
    console.error("Error calling /delete_file:", error);
    res.status(500).json({ error: "Error calling /delete_file" });
  }
});




// add middlewares
app.use(express.static(path.join(__dirname, "..", "build")));
app.use(express.static("public"));
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});

const port = parseInt(process?.argv[2] || 5000);
// start express server on port 5000
app.listen(port, () => {
    console.log(`server started on port ${port}`);
});