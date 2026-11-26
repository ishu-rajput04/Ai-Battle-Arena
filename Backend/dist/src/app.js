import express from "express";
import runGraph from "./services/graph.ai.service.js";
import Cors from "cors";
const app = express();
app.use(express.json());
app.use(Cors({
    origin: (origin, callback) => callback(null, true),
    credentials: true,
}));
app.use(express.static("./public"));
// health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
    });
});
app.get("/", async (req, res) => {
    const result = await runGraph("what is the capital of Germany.");
    res.json(result);
});
app.post("/invoke", async (req, res) => {
    const { input } = req.body;
    const result = await runGraph(input);
    res.status(200).json({
        message: "request send successfully.",
        success: true,
        result,
    });
});
export default app;
//# sourceMappingURL=app.js.map