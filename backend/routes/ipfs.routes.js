// routes/ipfsRoutes.js
const express = require("express");
const router = express.Router();
const IpfsHash = require("../models/ipfsHash.model.js");

// POST route to store a new IPFS hash
router.post("/", async (req, res) => {
  try {
    const { ipfsHash } = req.body;
    //validation
    if (!ipfsHash) {
      return res.status(400).json({ error: "IPFS hash is required" });
    }
    //new ipfshash stored.
    const newHash = new IpfsHash({ ipfsHash });
    await newHash.save();

    res.status(201).json({ message: "IPFS hash stored successfully", newHash });
    console.log("Successfully stored IPFS hash:", ipfsHash);
  } catch (error) {
    res.status(500).json({ error: "Error storing IPFS hash" });
  }
});

// GET route to fetch all IPFS hashes
router.get("/", async (req, res) => {
  try {
    const hashes = await IpfsHash.find({});
    res.status(200).json(hashes);
  } catch (error) {
    res.status(500).json({ error: "Error fetching IPFS hashes" });
  }
});

module.exports = router;
