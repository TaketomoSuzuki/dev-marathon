const express = require("express");
const app = express();
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = 5225;

const cors = require("cors");
app.use(cors());

// ✅ dotenv を使って環境ごとの .env を読み込む
const dotenv = require("dotenv");
const envPath =
  process.env.NODE_ENV === "production"
    ? "/app/taketomo_suzuki/.env.production"
    : process.env.NODE_ENV === "staging"
    ? "/app/taketomo_suzuki/.env.staging"
    : ".env";
dotenv.config({ path: envPath });

// ✅ PostgreSQL接続情報を .env から取得
const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/customers", async (req, res) => {
  try {
    const customerData = await pool.query("SELECT * FROM customers");
    res.send(customerData.rows);
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.post("/add-customer", async (req, res) => {
  try {
    const { companyName, industry, contact, location } = req.body;
    const newCustomer = await pool.query(
      "INSERT INTO customers (company_name, industry, contact, location) VALUES ($1, $2, $3, $4) RETURNING *",
      [companyName, industry, contact, location]
    );
    res.json({ success: true, customer: newCustomer.rows[0] });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

app.get("/customer/:contact", async (req, res) => {
  const contact = req.params.contact;
  try {
    const result = await pool.query("SELECT * FROM customers WHERE contact = $1", [contact]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "顧客が見つかりませんでした" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

app.delete("/customer/:contact", async (req, res) => {
  const contact = req.params.contact;
  try {
    await pool.query("DELETE FROM customers WHERE contact = $1", [contact]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.post("/update-customer", async (req, res) => {
  const { companyName, industry, contact, location } = req.body;
  try {
    await pool.query(
      "UPDATE customers SET company_name = $1, industry = $2, location = $3 WHERE contact = $4",
      [companyName, industry, location, contact]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});




