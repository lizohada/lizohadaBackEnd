import axios from "axios";
import cheerio from "cheerio";
import fs from "fs/promises";

function removeParentheses(str) {
  // 정규식을 사용하여 맨 앞과 맨 뒤의 괄호를 제거합니다.
  return str.replace(/^[\(\)]+|[\(\)]+$/g, "");
}

export const handler = async (event, context) => {
  const body = event;
  console.log("[From Client]: ", body);
  try {
    // inputData = JSON.parse(body);
    console.log("[User Input]: ", body);
  } catch (error) {
    console.error("[JSON Parsing Error]:", error);
    return { statusCode: 400, body: "Invalid JSON format" };
  }

  if (!body.hasOwnProperty("q")) {
    console.error("[Invalid Request]: No content provided");
    return { statusCode: 400, body: "No content provided" };
  }

  // var cupangUrl = `https://www.coupang.com/np/search?component=&q=${encodeURI(
  //   inputData.q
  // )}&channel=user`;
  // let response = await axios({
  //   url: cupangUrl,
  //   method: "get",
  //   timeout: 10000,
  // });

  // var $ = cheerio.load(response.data);

  const parrotResponse = "안녕하세요. 무엇을 도와드릴까요?";
  return {
    statusCode: 200,
    body: JSON.stringify(parrotResponse),
  };
};
