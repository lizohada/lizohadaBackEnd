import { blogScraper } from "./common/blogScraper.js";
import { blogDetailScraper } from "./common/blogDetailScraper.mjs";
import { fs } from "fs";
/**
 * event = {
 *  keyword : "울릉 여행",
 *  count : "30"
 * }
 *
 */

export const handler = async (event, context) => {
  const body = event;

  try {
    // inputData = JSON.parse(body);
    console.log("[User Input]: ", body);
  } catch (error) {
    console.error("[JSON Parsing Error]:", error);
    return { statusCode: 400, body: "Invalid JSON format" };
  }

  if (!body.hasOwnProperty("keyword")) {
    console.error("[Invalid Request]: No content provided");
    return { statusCode: 400, body: "No content provided" };
  }
  let blogs = await blogScraper(body.keyword, body.count);
  // map은 함수 콜을 하고 그 결과를 기다리고 다음 콜한다. 100개 스크랩에 -> 37초
  // blogs = await Promise.all(
  //   blogs.map((blog) => {
  //     return blogDetailScraper(blog);
  //   })
  // );
  // map은 각 함수 콜을 하고 100개 스크랩에 -> 21초
  blogs = await Promise.all(
    blogs.map(async (blog) => {
      return await blogDetailScraper(blog);
    })
  );

  const filePath = "./file.json";

  fs.writeFileSync(filePath, JSON.stringify(blogs, null, 2), "utf-8");
  return {
    statusCode: 200,
    body: JSON.stringify(blogs),
  };
};
