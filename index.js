require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlParser = require('url');

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// ✅ 模擬資料庫存儲短連結
let urlDatabase = {};
let shortUrlCounter = 1;

// ✅ 驗證 URL 格式
function isValidUrl(url) {
  const urlRegex = /^(http|https):\/\/[^ "]+$/;
  return urlRegex.test(url);
}

// ✅ POST: 創建短連結
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  // 驗證 URL 格式
  if (!isValidUrl(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // 使用 dns 檢查主機名是否有效
  const hostname = urlParser.parse(originalUrl).hostname;
  dns.lookup(hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // 儲存 URL 到模擬資料庫
    const shortUrl = shortUrlCounter++;
    urlDatabase[shortUrl] = originalUrl;

    res.json({
      original_url: originalUrl,
      short_url: shortUrl
    });
  });
});

// ✅ GET: 重定向短連結
app.get('/api/shorturl/:short_url', (req, res) => {
  const shortUrl = req.params.short_url;

  if (!urlDatabase[shortUrl]) {
    return res.json({ error: 'No short URL found for the given input' });
  }

  res.redirect(urlDatabase[shortUrl]);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
