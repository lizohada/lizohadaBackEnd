import express from "express";
import request from "request";
import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import { spawn } from "child_process";
import OpenAI from "openai";
import { sleep } from "openai/core";
import fs from "fs";
// import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

// 네이버 검색 API 예제 - 블로그 검색
var app = express();
dotenv.config();
var client_id = process.env.NAVER_CLIENT_ID;
var client_secret = process.env.NAVER_CLIENT_SECRECT;
app.get("/search/blog", function (req, res) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const regions = [
    "단양군",
    "제천시",
    "충주시",
    "괴산군",
    "음성군",
    "진천군",
    "증평군",
    "청주시",
    "보은군",
    "옥천군",
    "영동군",
  ];
  regions.forEach((region, index) => {
    sleep(5000);
    var api_url =
      "https://openapi.naver.com/v1/search/blog?display=100&query=" +
      encodeURI(region); // JSON 결과
    //   var api_url = 'https://openapi.naver.com/v1/search/blog.xml?query=' + encodeURI(req.query.query); // XML 결과
    console.log("api_url" + api_url);
    var options = {
      url: api_url,
      headers: {
        "X-Naver-Client-Id": client_id,
        "X-Naver-Client-Secret": client_secret,
      },
    };

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
              elementsWithClass.slice(0, 5).each(async (index, element) => {
                setTimeout(() => console.log("after"), 300);
                const r = $(element).text().replace(/\n/g, "");
                const completion = await openai.chat.completions.create({
                  messages: [
                    {
                      role: "user",
                      content:
                        "앞으로 나오는 글에서 지역 여행과 관련된 키워드를 추출해줘 " +
                        r,
                    },
                  ],
                  model: "gpt-3.5-turbo",
                  max_tokens: 1000,
                });
                console.log(completion);
                const gptResponse =
                  completion.choices[0].message.content.split(", ");
                console.log("[GPT Response]: ", gptResponse);
                for (let i = 0; i < gptResponse.length; i++) {
                  const item = gptResponse[i];

                  // item이 지역 키워드
                }

                // You can access other attributes like $(element).attr('attributeName')
              });
              console.log(completion);
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
        res
          .status(500)
          .json({ error: error.message || "Internal Server Error" });
        console.error("Error:", error.message || "Unknown error");
      });
  });

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
});

app.listen(3000, function () {
  console.log(
    "http://127.0.0.1:3000/search/blog?query=검색어 app listening on port 3000!"
  );
});
