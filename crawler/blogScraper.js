// const puppeteer = require("puppeteer-core");
// const { executablePath } = require("puppeteer");
// const headers = require("./cupangHeader.js");
// const { createKeywordURL } = require("./utils.js");
require("dotenv").config();
const axios = require("axios");

var client_id = process.env.NAVER_CLIENT_ID;
var client_secret = process.env.NAVER_CLIENT_SECRECT;

async function blogScraper(keyword, count) {
  try {
    var api_url = `https://openapi.naver.com/v1/search/blog?display=${count}&sort=date&query=\"${encodeURIComponent(
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
    let result = [];

    if (blogsResponse.status == 200) {
      result = blogsResponse.data.items.map(function (item) {
        console.log({
          title: item.title,
          link: item.link,
          postdate: item.postdate,
        });
        return {
          title: item.title,
          link: item.link,
          postdate: item.postdate,
        };
      });
    }
    return result;
  } catch (error) {
    console.error("[Blog Get Error]:", error);
  }
}

// 모듈로 내보내기
module.exports = {
  blogScraper,
};
