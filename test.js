// import http from "http";
// import https from "https";
// import { URL } from "url";

// const config = {
//   paypalClientId: process.env.PAYPAL_CLIENT_ID,
//   paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,
//   paymentProxySecret: process.env.PAYMENT_PROXY_SECRET,
//   paypalBaseUrl: process.env.PAYPAL_BASE_URL,
//   paypalRedirectUrl: process.env.PAYPAL_REDIRECT_URL,
// };

// const getAccessToken = async () => {
//   try {
//     const response = await got.post(
//       `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
//       {
//         form: { grant_type: "client_credentials" },
//         username: process.env.PAYPAL_CLIENT_ID,
//         password: process.env.PAYPAL_CLIENT_SECRET,
//       },
//     );
//     const data = response.body;
//     const newAccessToken = data.access_token;
//     return newAccessToken;
//   } catch (error) {
//     throw new Error(`PAYPAL_ACCESS_TOKEN_ERR: ${error.message}`);
//   }
// };

// const server = http.createServer((req, res) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, OPTIONS",
//   );
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Content-Type, Authorization, payment-proxy-key",
//   );

//   if (req.method === "OPTIONS") {
//     res.writeHead(200);
//     res.end();
//     return;
//   }

//   const paymentProxyAuth = req.headers["payment-proxy-secret"];
//   if (paymentProxyAuth !== config.paymentProxySecret) {
//     res.writeHead(401, { "Content-Type": "text/plain" });
//     res.end("Unauthorized");
//     return;
//   }

//   const endpoint = req.url.substring(1);
//   const targetUrl = config.baseApi + "/" + endpoint;

//   const parsedUrl = new URL(targetUrl);
//   const client = parsedUrl.protocol === "https" ? https : http;

//   const headers = {
//     Accept: "application/json",
//     "User-Agent": "test",
//     Authorization: "",
//   };

//   const allowedHeaders = ["content-type", "content-length"];

//   for (const [key, value] of Object.entries(req.headers)) {
//     if (allowedHeaders.includes(key.toLowerCase())) {
//       headers[key] = value;
//     }
//   }

//   const options = {
//     hostname: parsedUrl.hostname,
//     port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
//     path: parsedUrl.pathname + parsedUrl.search,
//     method: req.method,
//     headers: headers,
//   };

//   const proxyReq = client.request(options, (proxyRes) => {
//     res.writeHead(proxyRes.statusCode, proxyRes.headers);
//     proxyRes.pipe(res);
//   });

//   proxyReq.on("error", (err) => {
//     console.error("Request error:", error);
//     res.writeHead(500, { "Content-Type": "text/plain" });
//     res.end("Internal server error");
//   });

//   req.pipe(proxyReq);
// });

// server.listen(process.env.PORT, () => {
//   console.log("MoC payment proxy is running!!!");
// });
