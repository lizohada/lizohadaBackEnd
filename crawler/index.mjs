import { blogScraper } from "./blogScraper.js";
import { blogDetailScraper } from "./blogDetailScraper.mjs";

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
  blogs = await Promise.all(
    blogs.map(async (blog) => {
      return await blogDetailScraper(blog);
    })
  );
  return {
    statusCode: 200,
    body: JSON.stringify(blogs),
  };
};
