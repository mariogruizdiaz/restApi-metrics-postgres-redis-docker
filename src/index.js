const promBundle = require("express-prom-bundle");
const express = require("express");
const app = express();
const metricsMiddleware = promBundle({
    includeMethod: true,
    normalizePath: false,
    includePath: true,
    customLabels: {project_name: 'appcues',
    author: "Mario Ruiz Diaz"
    }});

app.use(metricsMiddleware);

app.use("/api/sub", require("./sub_module"));

app.get("/api", (req, res) => {
  res.status(200).send("Api Works.");
});
app.get("/api/fast/", (req, res) => {
  res.status(200).send("Fast response!");
});
app.get("/api/slow", (req, res) => {
  setTimeout(() => {
    res.status(200).send("Slow response...");
  }, 1000);
});

app.get("/api/error", (req, res, next) => {
  try {
    throw new Error("Something broke...");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.get("/api/list/:listId", (req, res, next) => {
  res.status(200).send(`Retrieved list ${req.params.listId}`);
});

const port = 3333;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});