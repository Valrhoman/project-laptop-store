const fs = require("fs");
const http = require("http");
const url = require("url");

const json = fs.readFileSync(`${__dirname}/data/data.json`, "utf-8");
const laptopData = JSON.parse(json);

const replaceTemplate = function (originalHtml, laptop) {
  return originalHtml
    .replaceAll("{%PRODUCTNAME%}", laptop.productName)
    .replaceAll("{%IMAGE%}", laptop.image)
    .replaceAll("{%PRICE%}", laptop.price)
    .replace("{%SCREEN%}", laptop.screen)
    .replaceAll("{%CPU%}", laptop.cpu)
    .replaceAll("{%STORAGE%}", laptop.storage)
    .replaceAll("{%RAM%}", laptop.ram)
    .replaceAll("{%DESCRIPTION%}", laptop.description)
    .replaceAll("{%ID%}", laptop.id);
};

const server = http.createServer((req, res) => {
  const pathName = url.parse(req.url, true).pathname;
  const id = url.parse(req.url, true).query.id;

  // PRODUCTS OVERVIEW
  if (pathName === "/products" || pathName === "/") {
    res.writeHead(200, { "Content-type": "text/html" });

    fs.readFile(
      `${__dirname}/templates/template-overview.html`,
      "utf-8",
      (err, data) => {
        let overviewOutput = data;
        fs.readFile(
          `${__dirname}/templates/template-card.html`,
          "utf-8",
          (err, data) => {
            const cardsOutput = laptopData
              .map((el) => replaceTemplate(data, el))
              .join("");
            overviewOutput = overviewOutput.replace("{%CARDS%}", cardsOutput);
            res.end(overviewOutput);
          }
        );
      }
    );
  }

  // LAPTOP DETAIL
  else if (pathName === "/laptop" && id < laptopData.length) {
    res.writeHead(200, { "Content-type": "text/html" });

    fs.readFile(
      `${__dirname}/templates/template-laptop.html`,
      "utf-8",
      (err, data) => {
        const laptop = laptopData[id];
        const output = replaceTemplate(data, laptop);
        res.end(output);
      }
    );
  }

  // IMAGES
  else if (/\.(jpg|jpeg|png|gif)$/i.test(pathName)) {
    fs.readFile(`${__dirname}/data/img${pathName}`, (err, data) => {
      res.writeHead(200, { "Content-type": "image/jpg" });
      res.end(data);
    });
  }

  // URL NOT FOUND
  else {
    res.writeHead(404, { "Content-type": "text/html" });
    res.end("URL was not found on the server :/");
  }
});

server.listen(1337, "127.0.0.1", () => {
  console.log("Listening for requests now");
});
