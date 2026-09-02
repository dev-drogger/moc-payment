module.exports = {
  apps: [
    {
      name: "moc-payment-gateway",
      script: "./server.js",
      instances: 1,
      autorestart: true,
      watch: true,
      env: {
        NODE_ENV: "",
        PAYPAL_CLIENT_ID: "",
        PAYPAL_CLIENT_SECRET: "",
        PAYPAL_BASE_URL: "https://api-m.paypal.com",
        PAYPAL_REDIRECT_BASE_URL: "https://mayorclash.com/payment",
        PAYMENT_PROXY_SECRET: "",
        PORT: 3001,
        ALLOWED_ORIGINS: "https://mayorclash.com",
      },
    },
  ],
};
