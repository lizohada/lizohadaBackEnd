import { handler } from "./index.mjs";
const event = {
  keyword: "울릉 여행",
  count: "100",
}; // 테스트하고 싶은 내용으로 변경
const context = {};

handler(event, context)
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
