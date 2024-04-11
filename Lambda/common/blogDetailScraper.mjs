import * as cheerio from "cheerio";
import axios from "axios";

export async function blogDetailScraper(blog) {
  try {
    const response = await axios.get(blog.link);

    // console.log(response);
    // iframe 태그를 선택합니다.

    const $ = cheerio.load(response.data);
    const iframe = $("iframe");
    var src = iframe.attr("src");
    let result = "";
    if (src && src.includes("/PostView")) {
      src = "https://blog.naver.com" + src;

      let response = await axios.get(src);

      let responseData = await response.data;
      // console.log(responseData);
      let $ = cheerio.load(responseData);
      const elementsWithClass = $(".se-component-content");
      // console.log(elementsWithClass);
      // Iterate over the elements and print their text content or other attributes
      elementsWithClass.each(async (index, element) => {
        // setTimeout(() => console.log("after"), 300);

        const r = $(element).text().replace(/\s+/g, " ").trim();
        if (r.length > 0) {
          // console.log(r);
          result += r + " ";
        }
      });
    }
    blog.content = result;
    return blog;
    // blogs.push({ link, status: response.status, data: response.data });
  } catch (error) {
    console.error("[Blog Detail Get Error]:", error.message);
  }
}
