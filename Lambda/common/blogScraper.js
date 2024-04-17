require("dotenv").config();
const axios = require("axios");

var client_id = process.env.NAVER_CLIENT_ID;
var client_secret = process.env.NAVER_CLIENT_SECRECT;

async function blogScraper(keyword, count, recentPostDate) {
  try {
    let result = [];
    let start = 1;
    const display = 10;
    while (result.length < count) {
      console.log("현재 display : " + display + " 현재 start " + start);
      var api_url = `https://openapi.naver.com/v1/search/blog?display=${display}&start=${start}&sort=date&query=\"${encodeURIComponent(
        keyword
      )}\"`;

      let blogsResponse = await axios({
        url: api_url,
        method: "get",
        timeout: 10000,
        headers: {
          "X-Naver-Client-Id": client_id,
          "X-Naver-Client-Secret": client_secret,
        },
      });
      if (blogsResponse.status == 200) {
        // start부터 display 만큼 블로그 아이템을 가져오기
        const data = await blogsResponse.data.items.map(function (item) {
          return {
            keyword: keyword,
            title: item.title,
            link: item.link,
            postdate: item.postdate,
          };
        });
        const initalLength = result.length;
        // console.log("초기 길이 ", initalLength);
        for (i = 0; i < data.length; i++) {
          // console.log(result < count);
          if (result < count && data[i].postdate > recentPostDate) {
            result.push(data[i]);
          }
        }
        if (initalLength == result.length) {
          // console.log("더 이상 업데이트하지 않습니다.");
          break;
        }
      }
      start += display;
    }
    // console.log("스크랩 목표 포스팅 개수 : " + result.length);
    return result;
  } catch (error) {
    console.error("[Blog Get Error]:", error);
  }
}

// 모듈로 내보내기
module.exports = {
  blogScraper,
};
