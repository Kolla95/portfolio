require("dotenv").config();

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;;
const BASE_URL = "https://connect.squareupsandbox.com/v2";
const LOCATION_ID = process.env.SQUARE_LOCATION_ID;
const SQUARE_VERSION = "2026-01-22";

function getHeaders() {
  return {
    "Square-Version": SQUARE_VERSION,
    "Authorization": `Bearer ${SQUARE_ACCESS_TOKEN}`,
    "Content-Type": "application/json"
  };
}

async function fetchInventoryCounts(variationIds) {
  if (!variationIds.length) return {};

  const response = await fetch(`${BASE_URL}/inventory/counts/batch-retrieve`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      catalog_object_ids: variationIds,
      location_ids: [LOCATION_ID],
      states: ["IN_STOCK"]
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Inventory API error: ${JSON.stringify(data)}`);
  }

  const countsByVariationId = {};

  for (const count of data.counts || []) {
    const variationId = count.catalog_object_id;
    const quantity = Number(count.quantity || 0);

    if (!countsByVariationId[variationId]) {
      countsByVariationId[variationId] = 0;
    }

    countsByVariationId[variationId] += quantity;
  }

  return countsByVariationId;
}

function mapSquareItem(item, inventoryByVariationId) {
  const variationObject = item.item_data?.variations?.[0];
  const variationData = variationObject?.item_variation_data;
  const variationId = variationObject?.id;

  const inventory =
    variationId && inventoryByVariationId[variationId] !== undefined
      ? inventoryByVariationId[variationId]
      : 0;

  const name = item.item_data?.name || "Untitled Product";

  let image = "/images/leather-bag.jpg";

  if (name.includes("Leather Crossbody Bag")) {
    image = "/images/leather-bag.jpg";
  } else if (name.includes("Mini Snap Wallet")) {
    image = "/images/mini-snap-wallet.jpg";
  } else if (name.includes("Handmade Key Holder")) {
    image = "/images/handmade-key-holder.jpg";
  } else if (name.includes("Classic Weekender")) {
    image = "/images/classic-weekender.jpg";
  } else if (name.includes("Canvas Market Tote")) {
    image = "/images/canvas-market-tote.jpg";
  } else if (name.includes("Leather Journal Cover")) {
    image = "/images/leather-journal-cover.jpg";
  } else if (name.includes("Slim Card Holder")) {
    image = "/images/slim-card-holder.jpg";
  } else if (name.includes("Travel Pouch")) {
    image = "/images/travel-pouch.jpg";
  } else if (name.includes("Wallet")) {
    image = "/images/wallet.jpg";
  }

  return {
    id: item.id,
    variationId: variationId || "",
    name,
    price: variationData?.price_money?.amount
      ? variationData.price_money.amount / 100
      : 0,
    inventory,
    category: item.item_data?.category_name || "Square Item",
    image,
    featured: inventory > 0
  };
}

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/products", async (req, res) => {
  try {
    const catalogResponse = await fetch(`${BASE_URL}/catalog/list?types=ITEM`, {
      method: "GET",
      headers: getHeaders()
    });

    const catalogData = await catalogResponse.json();

    if (!catalogResponse.ok) {
      console.error("Square catalog error:", catalogData);
      return res.status(catalogResponse.status).json(catalogData);
    }

    const items = (catalogData.objects || []).filter(obj => obj.type === "ITEM");

    const variationIds = items
      .map(item => item.item_data?.variations?.[0]?.id)
      .filter(Boolean);

    const inventoryByVariationId = await fetchInventoryCounts(variationIds);
    const formatted = items.map(item => mapSquareItem(item, inventoryByVariationId));

    res.json(formatted);
  } catch (error) {
    console.error("Square fetch error:", error);
    res.status(500).json({ error: "Failed to fetch products from Square" });
  }
});

app.get("/api/seed-products", async (req, res) => {
  try {
    const body = {
      idempotency_key: `seed-${Date.now()}`,
      batches: [
        {
          objects: [
            {
              type: "ITEM",
              id: "#bag",
              item_data: {
                name: "Leather Crossbody Bag",
                category_name: "Bags",
                variations: [
                  {
                    type: "ITEM_VARIATION",
                    id: "#bag-var",
                    item_variation_data: {
                      name: "Regular",
                      pricing_type: "FIXED_PRICING",
                      price_money: {
                        amount: 8600,
                        currency: "USD"
                      }
                    }
                  }
                ]
              }
            },
            {
              type: "ITEM",
              id: "#wallet",
              item_data: {
                name: "Mini Snap Wallet",
                category_name: "Wallets",
                variations: [
                  {
                    type: "ITEM_VARIATION",
                    id: "#wallet-var",
                    item_variation_data: {
                      name: "Regular",
                      pricing_type: "FIXED_PRICING",
                      price_money: {
                        amount: 3400,
                        currency: "USD"
                      }
                    }
                  }
                ]
              }
            },
            {
              type: "ITEM",
              id: "#keyholder",
              item_data: {
                name: "Handmade Key Holder",
                category_name: "Accessories",
                variations: [
                  {
                    type: "ITEM_VARIATION",
                    id: "#keyholder-var",
                    item_variation_data: {
                      name: "Regular",
                      pricing_type: "FIXED_PRICING",
                      price_money: {
                        amount: 1800,
                        currency: "USD"
                      }
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    const response = await fetch(`${BASE_URL}/catalog/batch-upsert`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Seed products error:", data);
      return res.status(response.status).json(data);
    }

    res.status(response.status).json(data);
  } catch (error) {
    console.error("Seed error:", error);
    res.status(500).json({ error: "Failed to seed products" });
  }
});

app.get("/api/seed-inventory", async (req, res) => {
  try {
    // First get products so we know the live variation IDs
    const catalogResponse = await fetch(`${BASE_URL}/catalog/list?types=ITEM`, {
      method: "GET",
      headers: getHeaders()
    });

    const catalogData = await catalogResponse.json();

    if (!catalogResponse.ok) {
      console.error("Catalog fetch for inventory seeding failed:", catalogData);
      return res.status(catalogResponse.status).json(catalogData);
    }

    const items = (catalogData.objects || []).filter(obj => obj.type === "ITEM");

    const changes = [];

    for (const item of items) {
      const name = item.item_data?.name || "";
      const variationId = item.item_data?.variations?.[0]?.id;

      if (!variationId) continue;

      let quantity = 0;

      if (name.includes("Leather Crossbody Bag")) quantity = 1;
      else if (name.includes("Mini Snap Wallet")) quantity = 3;
      else if (name.includes("Handmade Key Holder")) quantity = 8;

      if (quantity > 0) {
        changes.push({
          type: "PHYSICAL_COUNT",
         physical_count: {
         catalog_object_id: variationId,
         location_id: LOCATION_ID,
         state: "IN_STOCK",
         quantity: String(quantity),
         occurred_at: new Date().toISOString()
            }
        });
      }
    }

    if (!changes.length) {
      return res.status(400).json({ error: "No matching products found to seed inventory." });
    }

    const response = await fetch(`${BASE_URL}/inventory/changes/batch-create`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        idempotency_key: `inventory-${Date.now()}`,
        changes
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Seed inventory error:", data);
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error("Inventory seed error:", error);
    res.status(500).json({ error: "Failed to seed inventory" });
  }
});

app.post("/api/create-checkout", async (req, res) => {
  try {
    const cart = req.body.cart || [];

    if (!cart.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const lineItems = cart.map(item => ({
      name: item.name,
      quantity: String(item.quantity),
      base_price_money: {
        amount: Math.round(Number(item.price) * 100),
        currency: "USD"
      }
    }));

    const body = {
      idempotency_key: `checkout-${Date.now()}`,
      order: {
        location_id: LOCATION_ID,
        line_items: lineItems
      },
      checkout_options: {
        redirect_url: "https://willow-oak-mockup.onrender.com"
      }
    };

    const response = await fetch(`${BASE_URL}/online-checkout/payment-links`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log("Checkout response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("Checkout creation failed:", data);
      return res.status(response.status).json(data);
    }

    res.json({
      url: data.payment_link?.url
    });
  } catch (error) {
    console.error("Checkout route error:", error);
    res.status(500).json({ error: "Failed to create checkout" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});