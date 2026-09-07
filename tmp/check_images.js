const https = require("https");
const fs = require("fs");

function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      resolve({ url, status: res.statusCode });
    }).on("error", (e) => {
      resolve({ url, status: "ERROR: " + e.message });
    });
  });
}

async function main() {
  const ingContent = fs.readFileSync("src/data/ingredientImages.ts", "utf8");
  const recContent = fs.readFileSync("src/data/recipesDatabase.ts", "utf8");
  
  const regex = /https:\/\/images\.unsplash\.com\/photo-[^'"'`\s]+/g;
  const urls = [...new Set([...(ingContent.match(regex) || []), ...(recContent.match(regex) || [])])];
  
  console.log("Total unique URLs to test:", urls.length);
  for (const u of urls) {
    const res = await checkUrl(u);
    if (res.status !== 200) {
      console.log("FAILED:", res.status, u);
    }
  }
  console.log("Done checking!");
}

main();
