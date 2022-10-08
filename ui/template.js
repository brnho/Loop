const serialize = require('serialize-javascript');

function template(data) {
  return `<!DOCTYPE HTML>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Loop</title>
      <link rel="stylesheet" href="/bootstrap/css/bootstrap.min.css">
      <link href="/fontawesome-free-5.12.0-web/css/fontawesome.css" rel="stylesheet">
      <link href="/fontawesome-free-5.12.0-web/css/all.css" rel="stylesheet">
      <link href="/fontawesome-free-5.12.0-web/css/brands.css" rel="stylesheet">
      <style>html {overflow-y: scroll;}</style>
    </head>
    <body>
      <div id="contents"></div>
      <script>window.__INITIAL_DATA__=${serialize(data)}</script>
      <script src="/env.js"></script>
      <script src="/vendor.bundle.js"></script>
      <script src="/securedApp.bundle.js"></script>
    </body>
    </html>
  `;
};

module.exports = template;