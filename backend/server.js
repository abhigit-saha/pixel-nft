const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const ipfsRouter = require("./routes/ipfs.routes.js");

// Enable CORS for all routes
app.use(cors());

app.use(express.json());
app.use("/ipfs", ipfsRouter);
// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://test:test@cluster0.mic4h.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
