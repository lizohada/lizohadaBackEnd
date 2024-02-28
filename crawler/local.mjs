import { handler } from "./blogScrapeServer.mjs";
const event = {
  q: "가방",
  startdt: "2024-01-31",
  los: 9,
  minPrice: 10000,
  maxPrice: 999999,
  searchSize: 30,
}; // 테스트하고 싶은 내용으로 변경
const context = {};

handler(event, context)
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
