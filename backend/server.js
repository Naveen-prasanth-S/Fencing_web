const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const mongoose = require("mongoose");
const path = require("path");
const {
  SUPPORTED_HEIGHTS,
  getRatesByHeight,
  calculateFence,
} = require("./fenceCalculator");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const otpStore = {};
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
];
const allowedOrigins = Array.from(
  new Set([
    ...DEFAULT_ALLOWED_ORIGINS,
    ...String(process.env.CORS_ORIGIN || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ])
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  })
);
app.use(express.json());

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const sanitizeUser = ({ _id, __v, passwordHash, ...safeUser }) => ({
  id: String(_id),
  ...safeUser,
});
const NAME_REGEX = /^[A-Za-z ]{3,50}$/;
const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    role: { type: String, required: true, enum: ["admin", "staff"] },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

userSchema.index({ email: 1, role: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);

const inventorySchema = new mongoose.Schema(
  {
    itemName: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    minLevel: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const InventoryItem = mongoose.model("InventoryItem", inventorySchema);

const sanitizeInventory = ({ _id, __v, ...safeItem }) => ({
  id: String(_id),
  ...safeItem,
});

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, passwordHash) {
  const [salt, storedHash] = String(passwordHash || "").split(":");
  if (!salt || !storedHash) return false;

  const hashBuffer = crypto.scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, "hex");
  if (hashBuffer.length !== storedBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, storedBuffer);
}

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "Backend is running",
    dbState: mongoose.connection.readyState,
  });
});

app.post("/auth/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body || {};
    const trimmedName = String(name || "").trim();
    const normalizedEmail = normalizeEmail(email);
    const selectedRole = role === "staff" ? "staff" : "admin";

    if (!trimmedName || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (!NAME_REGEX.test(trimmedName)) {
      return res.status(400).json({
        success: false,
        message: "Name must be 3-50 letters only",
      });
    }

    if (!GMAIL_REGEX.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Email must be a valid @gmail.com address",
      });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must contain 1 capital, 1 small, 1 number & 1 special character",
      });
    }

    const alreadyExists = await User.findOne(
      { email: normalizedEmail, role: selectedRole },
      { _id: 1 }
    );

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: `${selectedRole} account already exists for this email`,
      });
    }

    const newUser = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      role: selectedRole,
      passwordHash: hashPassword(password),
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: sanitizeUser(newUser.toObject()),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Account already exists for this role and email",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    return res.json({
      success: true,
      message: "Login successful",
      user: sanitizeUser(user.toObject()),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.get("/inventory", async (_req, res) => {
  try {
    const items = await InventoryItem.find().sort({ createdAt: -1 });
    return res.json({
      success: true,
      items: items.map((item) => sanitizeInventory(item.toObject())),
    });
  } catch (_error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
});

app.post("/inventory", async (req, res) => {
  try {
    const { itemName, category, quantity, minLevel } = req.body || {};
    const name = String(itemName || "").trim();
    const cat = String(category || "").trim();
    const qty = Number(quantity);
    const min = Number(minLevel);

    if (!name || !cat || Number.isNaN(qty) || Number.isNaN(min)) {
      return res.status(400).json({
        success: false,
        message: "itemName, category, quantity, and minLevel are required",
      });
    }

    if (qty < 0 || min < 0) {
      return res.status(400).json({
        success: false,
        message: "quantity and minLevel must be 0 or more",
      });
    }

    const newItem = await InventoryItem.create({
      itemName: name,
      category: cat,
      quantity: qty,
      minLevel: min,
    });

    return res.status(201).json({
      success: true,
      item: sanitizeInventory(newItem.toObject()),
    });
  } catch (_error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create inventory item",
    });
  }
});

app.delete("/inventory/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await InventoryItem.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    return res.json({ success: true, message: "Item deleted" });
  } catch (_error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete inventory item",
    });
  }
});

app.put("/inventory/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { itemName, category, quantity, minLevel } = req.body || {};
    const name = String(itemName || "").trim();
    const cat = String(category || "").trim();
    const qty = Number(quantity);
    const min = Number(minLevel);

    if (!name || !cat || Number.isNaN(qty) || Number.isNaN(min)) {
      return res.status(400).json({
        success: false,
        message: "itemName, category, quantity, and minLevel are required",
      });
    }

    if (qty < 0 || min < 0) {
      return res.status(400).json({
        success: false,
        message: "quantity and minLevel must be 0 or more",
      });
    }

    const updated = await InventoryItem.findByIdAndUpdate(
      id,
      {
        itemName: name,
        category: cat,
        quantity: qty,
        minLevel: min,
      },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    return res.json({
      success: true,
      item: sanitizeInventory(updated.toObject()),
    });
  } catch (_error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update inventory item",
    });
  }
});

app.get("/billing/rates/:height", (req, res) => {
  const rates = getRatesByHeight(req.params.height);

  if (!rates) {
    return res.status(404).json({
      success: false,
      message: `Rate not found. Supported heights: ${SUPPORTED_HEIGHTS.join(
        ", "
      )} feet`,
    });
  }

  return res.json({
    success: true,
    rates,
  });
});

app.post("/billing/calculate", (req, res) => {
  const calculation = calculateFence(req.body);

  if (calculation.error) {
    return res.status(calculation.statusCode || 400).json({
      success: false,
      message: calculation.error,
    });
  }

  return res.json({
    success: true,
    ...calculation,
  });
});

app.post("/send-otp", async (req, res) => {
  const email = normalizeEmail(req.body?.email);
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  otpStore[email] = otp;

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
    console.log(`OTP for ${email}: ${otp}`);
    return res.json({
      success: true,
      message: "OTP generated (email disabled in local mode)",
    });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: smtpUser, pass: smtpPass },
  });

  try {
    await transporter.sendMail({
      from: `"OTP Service" <${smtpUser}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
    });
    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

app.post("/verify-otp", (req, res) => {
  const email = normalizeEmail(req.body?.email);
  const otp = String(req.body?.otp || "");

  if (otpStore[email] === otp) {
    delete otpStore[email];
    return res.json({ success: true, message: "OTP verified" });
  }

  return res.status(400).json({ success: false, message: "Invalid OTP" });
});

async function startServer() {
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is missing. Set it in backend/.env");
  }

  await mongoose.connect(MONGO_URI);
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log("MongoDB connected");
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
