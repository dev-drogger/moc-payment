import express from "express";
import got, { HTTPError } from "got";

const router = express.Router();

let cachedToken = null;
let tokenExpiry = null;

const getAccessToken = async () => {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await got.post(
      `${process.env.PAYPAL_BASE_URL}/v1/oauth2/token`,
      {
        form: { grant_type: "client_credentials" },
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_CLIENT_SECRET,
      },
    );
    console.log("Received response from PayPal token endpoint", response.body);
    const data = response.body;
    const newAccessToken = JSON.parse(data);
    cachedToken = newAccessToken.access_token;
    tokenExpiry = Date.now() + (response.body.expires_in - 60) * 1000;
    return cachedToken;
  } catch (error) {
    console.error("Error fetching access token from PayPal", error);
    throw new Error(`PAYPAL_ACCESS_TOKEN_ERROR: ${error.message}`);
  }
};

const checkAuthorization = (req, res, next) => {
  const paymentProxySecret = req.headers["payment-proxy-secret"];

  if (paymentProxySecret !== process.env.PAYMENT_PROXY_SECRET) {
    console.error("Unauthorized access attempt");
    return res.status(401).json({
      type: "UNAUTHORIZED",
      error: "Unauthorized",
    });
  }

  next();
};

const createPayment = async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    console.log("Using access token:", accessToken);

    if (!accessToken) {
      return res.status(500).json({
        type: "PAYPAL_ACCESS_TOKEN_ERR",
        error: "Failed to get access token",
      });
    }

    const response = await got.post(
      `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        json: {
          intent: "CAPTURE",
          purchase_units: [
            {
              name: "Remove Ads",
              description: "Remove ads and enjoy ad-free experience",
              amount: {
                currency_code: "USD",
                value: "6.66",
              },
            },
          ],
          payment_source: {
            paypal: {
              experience_context: {
                payment_method_preference: "IMMEDIATE_PAYMENT_REQUIRED",
                payment_method_selected: "PAYPAL",
                // app_switch_context: {
                //   mobile_web: {
                //     return_url: `${process.env.PAYPAL_REDIRECT_BASE_URL}/completed`,
                //     cancel_url: `${process.env.PAYPAL_REDIRECT_BASE_URL}/canceled`,
                //   },
                // },
                contact_preference: "NO_CONTACT_INFO",
                brand_name: "Mayor of Clash",
                shipping_preference: "NO_SHIPPING",
                locale: "en-US",
                user_action: "PAY_NOW",
                return_url: `${process.env.PAYPAL_REDIRECT_BASE_URL}/completed`,
                cancel_url: `${process.env.PAYPAL_REDIRECT_BASE_URL}/canceled`,
              },
            },
          },
        },
        responseType: "json",
      },
    );

    const orderId = response.body.id;
    return res.status(200).json({ orderId: orderId });
  } catch (error) {
    console.error("Error creating PayPal order", error);
    if (error instanceof HTTPError) {
      return res.status(error.response.statusCode).json({
        type: "PAYPAL_ERROR",
        error: error.response.body,
      });
    }
    res.status(500).json({
      type: "PAYPAL_CREATE_ORDER_ERROR",
      error: `Unexpected error : ${error.message}`,
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return res.status(500).json({
        type: "PAYPAL_ACCESS_TOKEN_ERROR",
        error: "Failed to get access token",
      });
    }

    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        type: "PAYPAL_INVALID_ORDER_ID",
        error: "Invalid order ID",
      });
    }

    const response = await got.post(
      `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        responseType: "json",
      },
    );

    const paymentData = response.body;
    if (paymentData.status !== "COMPLETED") {
      return res.status(400).json({
        type: "PAYPAL_PAYMENT_STATUS_ERROR",
        error: "Payment incomplete or failed",
      });
    }
    return res.status(200).json({ ok: true, message: "paid" });
  } catch (error) {
    console.error("Error capturing PayPal payment", error);
    if (error instanceof HTTPError) {
      return res.status(error.response.statusCode).json({
        type: "PAYPAL_ERROR",
        error: error.response.body,
      });
    }
    res.status(500).json({
      type: "PAYPAL_CAPTURE_PAYMENT_ERROR",
      error: `Unexpected error: ${error.message}`,
    });
  }
};

router.post("/create-payment", checkAuthorization, createPayment);
router.post("/capture-payment/:orderId", checkAuthorization, capturePayment);

export default router;
