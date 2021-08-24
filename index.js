const express = require("express");
const redis = require("redis");
const fetch = require("node-fetch");

const Redis_port = 6379;
const port = 3002;

const client = redis.createClient(Redis_port);

const app = express();

setResponse = (userName, repos) => {
  return `total ${repos}`;
};

//cache middle

cache = (req, res, next) => {
  const { userName } = req.params;
  client.get(userName, (err, data) => {
    if (err) throw err;
    else if (data !== null) {
      res.json(setResponse(userName, data));
    } else {
      next();
    }
  });
};

//make call to github
const getRepos = async (req, res, nex) => {
  const { userName } = req.params;

  try {
    const response = await fetch(`https://api.github.com/users/${userName}`);
    const repositories = await response.json();

    client.setex(userName, 3600, repositories.public_repos);
    res.json(setResponse(userName, repositories.public_repos));
  } catch (error) {}
};
app.get("/repos/:userName", getRepos);

app.listen(port, () => {
  console.log("express is running on this serve", port);
});
