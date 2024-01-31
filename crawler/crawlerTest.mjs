import express from "express";
import request from "request";
import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";

// 네이버 검색 API 예제 - 블로그 검색
var app = express();
dotenv.config();
var client_id = process.env.NAVER_CLIENT_ID;
var client_secret = process.env.NAVER_CLIENT_SECRECT;
app.get("/search/blog", function (req, res) {
  var api_url =
    "https://openapi.naver.com/v1/search/blog?display=1&query=" +
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

      async function fetchData(link) {
        try {
          const response = await axios.get(link);

          // console.log(response);
          // iframe 태그를 선택합니다.

          const $ = cheerio.load(response.data);
          const iframe = $("iframe");
          var src = iframe.attr("src");

          if (src && src.includes("/PostView")) {
            src = "https://blog.naver.com" + src;

            let response = await axios.get(src);
            // console.log(response);
            let contentType = response.headers["content-type"];

            let charset = contentType.includes("charset=")
              ? contentType.split("charset=")[1]
              : "UTF-8";

            let responseData = await response.data;
            // console.log(responseData);
            let $ = cheerio.load(responseData);
            const elementsWithClass = $(".se-component-content");
            // Iterate over the elements and print their text content or other attributes
            elementsWithClass.each((index, element) => {
              console.log($(element).text());
              // You can access other attributes like $(element).attr('attributeName')
            });
          }
          // blogs.push({ link, status: response.status, data: response.data });
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
