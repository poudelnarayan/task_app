import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send("Welcome d to my app!!!!");
})


app.listen(8000, () => {
    console.log("http://localhost:8000");
})