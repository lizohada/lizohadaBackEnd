import express from "express";
import request from "request";
import dotenv from "dotenv";
import axios from "axios";
import puppeter from "puppeter";

// 네이버 검색 API 예제 - 블로그 검색
var app = express();
dotenv.config();
var client_id = process.env.NAVER_CLIENT_ID;
var client_secret = process.env.NAVER_CLIENT_SECRECT;
app.get("/search/blog", function (req, res) {
  var api_url =
    "https://openapi.naver.com/v1/search/blog?display=100&query=" +
    encodeURI(req.query.query); // JSON 결과
  //   var api_url = 'https://openapi.naver.com/v1/search/blog.xml?query=' + encodeURI(req.query.query); // XML 결과

  var options = {
    url: api_url,
    headers: {
      "X-Naver-Client-Id": client_id,
      "X-Naver-Client-Secret": client_secret,
    },
  };
  function naverSearch(options) {
    return new Promise((resolve, reject) => {
      request.get(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var data = JSON.parse(body);

          // Extract title and link from each item
          const results = data.items.map((item) => {
            return {
              title: item.title,
              link: item.link,
            };
          });

          // Resolve the promise with the results
          resolve(results);
        } else {
          // Reject the promise with an error
          reject(error || new Error("Failed to fetch data from the API"));
        }
      });
    });
  }
  // Use the promise returned by naverSearch
  naverSearch(options)
    .then(async (results) => {
      // Send the results as JSON response
      // Array to store the results of HTTP GET requests
      const blogs = [];
      const browser = await puppeteer.launch({
        headless: false,
        executablePath:
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      });

      async function fetchData(link) {
        try {
          const page = await browser.newPage();
          await page.goto(link);
          console.log(link);
          const response = await axios.get(link);
          console.log(response);
          blogs.push({ link, status: response.status, data: response.data });
        } catch (error) {
          blogs.push({
            link,
            status: error.response ? error.response.status : "Unknown Error",
          });
        }
      }

      // Iterate through each item in the 'data' array and make an HTTP GET request
      results.map(async (item) => await fetchData(item.link));
    })
    .catch((error) => {
      // Handle errors
      res.status(500).json({ error: error.message || "Internal Server Error" });
      console.error("Error:", error.message || "Unknown error");
    });
});

app.listen(3000, function () {
  console.log(
    "http://127.0.0.1:3000/search/blog?query=검색어 app listening on port 3000!"
  );
});
