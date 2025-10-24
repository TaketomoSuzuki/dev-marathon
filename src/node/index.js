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

app.get("/customer/:customer_id", async (req, res) => {
  const customer_id = parseInt(req.params.customer_id, 10);
  if (isNaN(customer_id)) {
    return res.status(400).json({ error: "customer_id が不正です" });
  }

  try {
    const result = await pool.query("SELECT * FROM customers WHERE customer_id = $1", [customer_id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: "顧客が見つかりませんでした" });
    }
  } catch (err) {
    console.error("顧客取得エラー:", err); // ← ここでエラー内容を確認できる
    res.status(500).json({ error: "サーバーエラー" });
  }
});


app.delete("/customer/:customer_id", async (req, res) => {
  const customer_id = req.params.customer_id;
  try {
    await pool.query("DELETE FROM customers WHERE customer_id = $1", [customer_id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.post("/update-customer", async (req, res) => {
  const { companyName, industry, contact, location, customer_id } = req.body;
  try {
    await pool.query(
      "UPDATE customers SET company_name = $1, industry = $2, contact = $3 location = $4 WHERE customer_id = $5",
      [companyName, industry, location, contact, customer_id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

app.post('/case', async (req, res) => {
  const { case_name, case_status, expected_revenue, representative, customer_id } = req.body;

  // 入力チェック
  if (!case_name || !case_status || !representative || !customer_id) {
    return res.status(400).json({ success: false, error: '必須項目が不足しています' });
  }

  try {
    // 顧客IDの存在確認（任意：安全性向上のため）
    const customerCheck = await pool.query(
      'SELECT customer_id FROM customers WHERE customer_id = $1',
      [customer_id]
    );
    if (customerCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: '指定された顧客が存在しません' });
    }

    // 案件登録
    const result = await pool.query(
      `INSERT INTO cases (case_name, case_status, expected_revenue, representative, customer_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING case_id`,
      [case_name, case_status, expected_revenue, representative, customer_id]
    );

    res.json({ success: true, case_id: result.rows[0].case_id });
  } catch (err) {
    console.error('案件登録エラー:', err);
    res.status(500).json({ success: false, error: '案件登録に失敗しました' });
  }
});








