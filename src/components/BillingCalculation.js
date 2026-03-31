import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { calculateBilling, getBillingRates } from "../services/billingApi";
import companyLogo from "../assets/athanuramman-logo.png";
import "./inventory/InventoryPages.css";
import "./BillingCalculation.css";

const HEIGHT_OPTIONS = [4, 5, 6];

const COMPANY_PROFILE = {
  documentLabel: "Tax Invoice",
  copyLabel: "Original for Recipient",
  name: "Athanuramman Fencings",
  headOffice:
    "17/295, Othakadai, Trichy Road, Vellakovil, Tiruppur (DT) - 638111.",
  branch:
    "337, Covai Road, Kangeyam, Tiruppur (DT) - 638701, Tamil Nadu.",
  mobile: "9442620912",
  gstin: "33CBXPK0027R1Z3",
};

const INITIAL_FORM = {
  noOfFeet: "",
  stonePerFeet: "",
  supportStonePerFeet: "",
  noOfBarbedWireLines: "",
  height: "4",
};

function toInputDate(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getFinancialYearLabel(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 3 ? year : year - 1;
  const endYear = startYear + 1;
  return `${String(startYear).slice(-2)}-${String(endYear).slice(-2)}`;
}

function createDefaultInvoiceFields() {
  const today = new Date();
  const invoiceDate = toInputDate(today);

  return {
    invoiceNo: `AF/SL/${getFinancialYearLabel(invoiceDate)}/001`,
    invoiceDate,
    dueDate: toInputDate(addDays(today, 30)),
    billTo: "CASH INVOICE",
    shipTo: "CASH INVOICE",
    vehicleNo: "",
    placeOfSupply: "Tamil Nadu",
    receivedAmount: "0",
    taxRate: "18",
  };
}

function roundToTwo(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function formatCurrency(value) {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function formatNumber(value, maximumFractionDigits = 2) {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits,
  }).format(Number(value));
}

function formatInvoiceDate(value) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("en-GB").format(
    new Date(`${value}T00:00:00`)
  );
}

const SMALL_NUMBERS = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertBelowThousand(number) {
  const value = Number(number);
  const words = [];

  if (value >= 100) {
    words.push(`${SMALL_NUMBERS[Math.floor(value / 100)]} Hundred`);
  }

  const remainder = value % 100;

  if (remainder >= 20) {
    words.push(TENS[Math.floor(remainder / 10)]);
    if (remainder % 10) {
      words.push(SMALL_NUMBERS[remainder % 10]);
    }
  } else if (remainder > 0 || words.length === 0) {
    words.push(SMALL_NUMBERS[remainder]);
  }

  return words.join(" ").trim();
}

function convertNumberToWords(number) {
  const value = Math.max(0, Math.floor(Number(number) || 0));

  if (value === 0) {
    return SMALL_NUMBERS[0];
  }

  const parts = [];
  let remainder = value;
  const segments = [
    { size: 10000000, label: "Crore" },
    { size: 100000, label: "Lakh" },
    { size: 1000, label: "Thousand" },
  ];

  segments.forEach(({ size, label }) => {
    if (remainder >= size) {
      parts.push(`${convertBelowThousand(Math.floor(remainder / size))} ${label}`);
      remainder %= size;
    }
  });

  if (remainder > 0) {
    parts.push(convertBelowThousand(remainder));
  }

  return parts.join(" ").trim();
}

function BillingCalculation() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [invoiceForm, setInvoiceForm] = useState(createDefaultInvoiceFields);
  const [rates, setRates] = useState(null);
  const [result, setResult] = useState(null);
  const [loadingRates, setLoadingRates] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const rawUser = sessionStorage.getItem("authUser");
    if (!rawUser) return;

    try {
      setAuthUser(JSON.parse(rawUser));
    } catch (_error) {
      sessionStorage.removeItem("authUser");
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadRates() {
      setLoadingRates(true);

      try {
        const nextRates = await getBillingRates(form.height);
        if (ignore) return;
        setRates(nextRates);
      } catch (loadError) {
        if (ignore) return;
        setRates(null);
        setError(loadError.message || "Failed to load billing rates");
      } finally {
        if (!ignore) {
          setLoadingRates(false);
        }
      }
    }

    loadRates();

    return () => {
      ignore = true;
    };
  }, [form.height]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setResult(null);
    setError("");
  };

  const handleInvoiceChange = (event) => {
    const { name, value } = event.target;

    setInvoiceForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setCalculating(true);
    setError("");

    try {
      const data = await calculateBilling({
        noOfFeet: Number(form.noOfFeet),
        stonePerFeet: Number(form.stonePerFeet),
        supportStonePerFeet: Number(form.supportStonePerFeet),
        noOfBarbedWireLines: Number(form.noOfBarbedWireLines),
        height: Number(form.height),
      });

      setRates(data.rates);
      setResult(data.calculations);
    } catch (calculateError) {
      setError(calculateError.message || "Failed to calculate billing");
    } finally {
      setCalculating(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("authUser");
    setAuthUser(null);
    navigate("/login");
  };

  const handlePrint = () => {
    window.print();
  };

  const formComplete =
    form.noOfFeet &&
    form.stonePerFeet &&
    form.supportStonePerFeet &&
    form.noOfBarbedWireLines &&
    form.height;

  const taxRate = Number(invoiceForm.taxRate || 0);
  const cgstRate = taxRate / 2;
  const sgstRate = taxRate / 2;
  const taxableAmount = roundToTwo(result?.totalAmount || 0);
  const cgstAmount = roundToTwo((taxableAmount * cgstRate) / 100);
  const sgstAmount = roundToTwo((taxableAmount * sgstRate) / 100);
  const grandTotal = roundToTwo(taxableAmount + cgstAmount + sgstAmount);
  const receivedAmount = roundToTwo(invoiceForm.receivedAmount || 0);

  const invoiceItems = result
    ? [
        {
          description: "Chainlink Fence Materials",
          hsn: "721720",
          qtyValue: Number(form.noOfFeet),
          qtyUnit: "FT",
          rate: rates?.feetRate || 0,
          baseAmount: result.feetAmount,
        },
        {
          description: "Stone Pillar Materials",
          hsn: "--",
          qtyValue: Number(result.noOfStone),
          qtyUnit: "NOS",
          rate: rates?.stoneRate || 0,
          baseAmount: result.stoneAmount,
        },
        {
          description: "Support Stone Materials",
          hsn: "--",
          qtyValue: Number(result.supportStone),
          qtyUnit: "NOS",
          rate: rates?.supportStoneRate || 0,
          baseAmount: result.supportStoneAmount,
        },
        {
          description: "Barbed Wire Fencing Material",
          hsn: "731300",
          qtyValue: Number(form.noOfFeet) * Number(form.noOfBarbedWireLines),
          qtyUnit: "RUN",
          rate: 5,
          baseAmount: result.barbedWireAmount,
        },
        {
          description: "Labour / Installation Charges",
          hsn: "--",
          qtyValue: Number(result.labour),
          qtyUnit: "FT",
          rate: rates?.labourRate || 0,
          baseAmount: result.labourAmount,
        },
      ]
    : [];

  const subtotalQuantity = result
    ? formatNumber(
        invoiceItems.reduce((sum, item) => sum + (Number(item.qtyValue) || 0), 0)
      )
    : "--";

  const amountInWords = result
    ? `${convertNumberToWords(Math.round(grandTotal))} Rupees Only`
    : "--";

  return (
    <div className="stock-shell">
      <header className="topbar navbar navbar-expand-lg">
        <div className="container-xl">
          <span className="brand navbar-brand mb-0">FencingMS</span>
          <button
            className="navbar-toggler bg-light"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#billingNavbar"
            aria-controls="billingNavbar"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <nav className="collapse navbar-collapse" id="billingNavbar">
            <div className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              <Link to="/" className="nav-link">Home</Link>
              <NavLink to="/stock/dashboard" className="nav-link">Inventory</NavLink>
              <NavLink to="/billing" className="nav-link">Costing</NavLink>
              <Link to="/gps" className="nav-link">GPS</Link>
              {authUser && (
                <div className="profile-nav ms-lg-2 mt-2 mt-lg-0">
                  <div className="avatar">
                    {String(authUser?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="profile-text">
                    <strong>{authUser?.name || "User"}</strong>
                    <span>{authUser?.role || "staff"}</span>
                  </div>
                  <button type="button" className="logout-btn" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <section className="billing-page">
        <div className="container-xl billing-shell">
          <div className="billing-hero">
            <div className="billing-hero-copy">
              <span className="billing-eyebrow">Billing Workspace</span>
              <h1>Fence Cost Calculator</h1>
              <p>
                Calculate the fencing bill, then turn the result into a
                printable company invoice using the format from the sample PDF.
              </p>
            </div>

            <Link to="/stock/dashboard" className="billing-back-link">
              Back to inventory
            </Link>
          </div>

          <div className="billing-stat-grid">
            <article className="billing-stat-card">
              <span>Selected Height</span>
              <strong>{form.height} ft</strong>
            </article>
            <article className="billing-stat-card">
              <span>Feet Rate</span>
              <strong>
                {loadingRates ? "Loading..." : formatCurrency(rates?.feetRate)}
              </strong>
            </article>
            <article className="billing-stat-card">
              <span>Stone Rate</span>
              <strong>
                {loadingRates ? "Loading..." : formatCurrency(rates?.stoneRate)}
              </strong>
            </article>
            <article className="billing-stat-card accent">
              <span>Taxable Amount</span>
              <strong>{formatCurrency(result?.totalAmount)}</strong>
            </article>
          </div>

          <div className="billing-layout">
            <form className="billing-panel" onSubmit={handleSubmit}>
              <div className="billing-panel-head">
                <div>
                  <h2>Calculation Sheet</h2>
                  <p>
                    Enter the project values and calculate the fence billing
                    details before generating the invoice printout.
                  </p>
                </div>
                <span className="billing-badge">Height options: 4, 5, 6 ft</span>
              </div>

              <div className="billing-table-wrap">
                <table className="billing-table">
                  <thead>
                    <tr>
                      <th>Particulars</th>
                      <th>No of Fields</th>
                      <th>Rate</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="billing-label">No Of Feet</td>
                      <td className="billing-input-cell">
                        <input
                          className="billing-input"
                          type="number"
                          min="0"
                          step="any"
                          name="noOfFeet"
                          value={form.noOfFeet}
                          onChange={handleChange}
                          placeholder="Enter feet"
                        />
                      </td>
                      <td>{loadingRates ? "Loading..." : formatCurrency(rates?.feetRate)}</td>
                      <td>{formatCurrency(result?.feetAmount)}</td>
                    </tr>

                    <tr>
                      <td className="billing-label">Stone Per Feet</td>
                      <td className="billing-input-cell">
                        <input
                          className="billing-input"
                          type="number"
                          min="0"
                          step="any"
                          name="stonePerFeet"
                          value={form.stonePerFeet}
                          onChange={handleChange}
                          placeholder="Spacing value"
                        />
                      </td>
                      <td>--</td>
                      <td>--</td>
                    </tr>

                    <tr>
                      <td className="billing-label">Support Stone Per Feet</td>
                      <td className="billing-input-cell">
                        <input
                          className="billing-input"
                          type="number"
                          min="0"
                          step="any"
                          name="supportStonePerFeet"
                          value={form.supportStonePerFeet}
                          onChange={handleChange}
                          placeholder="Support spacing"
                        />
                      </td>
                      <td>--</td>
                      <td>--</td>
                    </tr>

                    <tr>
                      <td className="billing-label">No Of Stone</td>
                      <td className="billing-output-cell emphasis">
                        {formatNumber(result?.noOfStone)}
                      </td>
                      <td>{loadingRates ? "Loading..." : formatCurrency(rates?.stoneRate)}</td>
                      <td>{formatCurrency(result?.stoneAmount)}</td>
                    </tr>

                    <tr>
                      <td className="billing-label">Support Stone</td>
                      <td className="billing-output-cell emphasis">
                        {formatNumber(result?.supportStone)}
                      </td>
                      <td>
                        {loadingRates
                          ? "Loading..."
                          : formatCurrency(rates?.supportStoneRate)}
                      </td>
                      <td>{formatCurrency(result?.supportStoneAmount)}</td>
                    </tr>

                    <tr>
                      <td className="billing-label">No Of Barbed Wire Lines</td>
                      <td className="billing-input-cell">
                        <input
                          className="billing-input"
                          type="number"
                          min="0"
                          step="any"
                          name="noOfBarbedWireLines"
                          value={form.noOfBarbedWireLines}
                          onChange={handleChange}
                          placeholder="Wire line count"
                        />
                      </td>
                      <td>{formatCurrency(result?.barbedWireRate)}</td>
                      <td>{formatCurrency(result?.barbedWireAmount)}</td>
                    </tr>

                    <tr>
                      <td className="billing-label">Barbed Wire Weight</td>
                      <td className="billing-output-cell">
                        {formatNumber(result?.barbedWireWeight, 0)}
                      </td>
                      <td>--</td>
                      <td>--</td>
                    </tr>

                    <tr>
                      <td className="billing-label">Kattu Kambi</td>
                      <td className="billing-output-cell">
                        {formatNumber(result?.kattuKambi)}
                      </td>
                      <td>--</td>
                      <td>--</td>
                    </tr>

                    <tr>
                      <td className="billing-label">Labour</td>
                      <td className="billing-output-cell">
                        {formatNumber(result?.labour)}
                      </td>
                      <td>{loadingRates ? "Loading..." : formatCurrency(rates?.labourRate)}</td>
                      <td>{formatCurrency(result?.labourAmount)}</td>
                    </tr>

                    <tr className="billing-total-row">
                      <td className="billing-input-cell">
                        <select
                          className="billing-select"
                          name="height"
                          value={form.height}
                          onChange={handleChange}
                        >
                          {HEIGHT_OPTIONS.map((height) => (
                            <option key={height} value={height}>
                              Height {height} ft
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="billing-total-label" colSpan="2">
                        TAXABLE AMOUNT
                      </td>
                      <td className="billing-total-value">
                        {formatCurrency(result?.totalAmount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="billing-actions">
                <p className="billing-note">
                  {result
                    ? "Invoice preview below is ready for print after you review the company fields."
                    : "Rates load automatically based on height."}
                </p>
                <button
                  type="submit"
                  className="billing-button"
                  disabled={!formComplete || calculating || loadingRates}
                >
                  {calculating ? "Calculating..." : "Calculate billing"}
                </button>
              </div>
            </form>

            <aside className="billing-sidebar">
              {error ? (
                <div className="billing-message error">{error}</div>
              ) : (
                <div className="billing-message info">
                  The calculator total is used as the taxable amount, and the
                  printable invoice applies GST using the company-format layout.
                </div>
              )}

              <section className="billing-side-card">
                <h3>Current Rate Card</h3>
                <div className="billing-rate-list">
                  <div className="billing-rate-item">
                    <span>Feet Rate</span>
                    <strong>{formatCurrency(rates?.feetRate)}</strong>
                  </div>
                  <div className="billing-rate-item">
                    <span>Stone Rate</span>
                    <strong>{formatCurrency(rates?.stoneRate)}</strong>
                  </div>
                  <div className="billing-rate-item">
                    <span>Support Stone Rate</span>
                    <strong>{formatCurrency(rates?.supportStoneRate)}</strong>
                  </div>
                  <div className="billing-rate-item">
                    <span>Labour Rate</span>
                    <strong>{formatCurrency(rates?.labourRate)}</strong>
                  </div>
                </div>
              </section>

              <section className="billing-side-card">
                <h3>Quick Outputs</h3>
                <div className="billing-mini-grid">
                  <article className="billing-mini-card">
                    <span>No Of Stone</span>
                    <strong>{formatNumber(result?.noOfStone)}</strong>
                  </article>
                  <article className="billing-mini-card">
                    <span>Support Stone</span>
                    <strong>{formatNumber(result?.supportStone)}</strong>
                  </article>
                  <article className="billing-mini-card">
                    <span>Wire Weight</span>
                    <strong>{formatNumber(result?.barbedWireWeight, 0)}</strong>
                  </article>
                  <article className="billing-mini-card">
                    <span>Kattu Kambi</span>
                    <strong>{formatNumber(result?.kattuKambi)}</strong>
                  </article>
                </div>
              </section>

              <section className="billing-side-card">
                <h3>Tax Summary</h3>
                <div className="billing-rate-list">
                  <div className="billing-rate-item">
                    <span>Taxable Amount</span>
                    <strong>{formatCurrency(taxableAmount)}</strong>
                  </div>
                  <div className="billing-rate-item">
                    <span>CGST @{formatNumber(cgstRate, 2)}%</span>
                    <strong>{formatCurrency(cgstAmount)}</strong>
                  </div>
                  <div className="billing-rate-item">
                    <span>SGST @{formatNumber(sgstRate, 2)}%</span>
                    <strong>{formatCurrency(sgstAmount)}</strong>
                  </div>
                  <div className="billing-rate-item">
                    <span>Grand Total</span>
                    <strong>{formatCurrency(grandTotal)}</strong>
                  </div>
                </div>
              </section>
            </aside>
          </div>

          {result && (
            <section className="billing-print-section">
              <div className="billing-print-toolbar">
                <div>
                  <span className="billing-eyebrow billing-print-eyebrow">
                    Company Print Format
                  </span>
                  <h2>Printable Invoice</h2>
                  <p>
                    Review the fields below, then print the sheet in the same
                    company-style format as the sample invoice.
                  </p>
                </div>
                <button
                  type="button"
                  className="billing-button billing-print-button"
                  onClick={handlePrint}
                >
                  Print Invoice
                </button>
              </div>

              <div className="billing-print-layout">
                <section className="billing-print-editor">
                  <h3>Invoice Details</h3>
                  <div className="billing-editor-grid">
                    <label className="billing-editor-field">
                      <span>Invoice No.</span>
                      <input
                        type="text"
                        name="invoiceNo"
                        value={invoiceForm.invoiceNo}
                        onChange={handleInvoiceChange}
                      />
                    </label>

                    <label className="billing-editor-field">
                      <span>Invoice Date</span>
                      <input
                        type="date"
                        name="invoiceDate"
                        value={invoiceForm.invoiceDate}
                        onChange={handleInvoiceChange}
                      />
                    </label>

                    <label className="billing-editor-field">
                      <span>Due Date</span>
                      <input
                        type="date"
                        name="dueDate"
                        value={invoiceForm.dueDate}
                        onChange={handleInvoiceChange}
                      />
                    </label>

                    <label className="billing-editor-field">
                      <span>Vehicle No.</span>
                      <input
                        type="text"
                        name="vehicleNo"
                        value={invoiceForm.vehicleNo}
                        onChange={handleInvoiceChange}
                        placeholder="TN 00AB0000"
                      />
                    </label>

                    <label className="billing-editor-field">
                      <span>Place of Supply</span>
                      <input
                        type="text"
                        name="placeOfSupply"
                        value={invoiceForm.placeOfSupply}
                        onChange={handleInvoiceChange}
                      />
                    </label>

                    <label className="billing-editor-field">
                      <span>GST Rate (%)</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="taxRate"
                        value={invoiceForm.taxRate}
                        onChange={handleInvoiceChange}
                      />
                    </label>

                    <label className="billing-editor-field">
                      <span>Received Amount</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        name="receivedAmount"
                        value={invoiceForm.receivedAmount}
                        onChange={handleInvoiceChange}
                      />
                    </label>

                    <label className="billing-editor-field full-span">
                      <span>Bill To</span>
                      <textarea
                        rows="3"
                        name="billTo"
                        value={invoiceForm.billTo}
                        onChange={handleInvoiceChange}
                      />
                    </label>

                    <label className="billing-editor-field full-span">
                      <span>Ship To</span>
                      <textarea
                        rows="3"
                        name="shipTo"
                        value={invoiceForm.shipTo}
                        onChange={handleInvoiceChange}
                      />
                    </label>
                  </div>
                </section>

                <div className="invoice-print-area">
                  <article className="invoice-sheet">
                    <div className="invoice-flags">
                      <span className="invoice-flag-primary">
                        {COMPANY_PROFILE.documentLabel.toUpperCase()}
                      </span>
                      <span className="invoice-flag-copy">
                        {COMPANY_PROFILE.copyLabel.toUpperCase()}
                      </span>
                    </div>

                    <header className="invoice-header">
                      <div className="invoice-logo-wrap">
                        <img
                          src={companyLogo}
                          alt={`${COMPANY_PROFILE.name} logo`}
                          className="invoice-logo"
                        />
                      </div>
                      <div className="invoice-header-copy">
                        <h2>{COMPANY_PROFILE.name}</h2>
                        <p>HEAD OFFICE : {COMPANY_PROFILE.headOffice}</p>
                        <p>BRANCH : {COMPANY_PROFILE.branch}</p>
                        <div className="invoice-contact-row">
                          <span>Mobile: {COMPANY_PROFILE.mobile}</span>
                          <span>GSTIN: {COMPANY_PROFILE.gstin}</span>
                        </div>
                      </div>
                    </header>

                    <section className="invoice-info-band">
                      <div className="invoice-info-grid invoice-info-grid-top">
                        <div className="invoice-info-item">
                          <span>Invoice No.:</span>
                          <strong>{invoiceForm.invoiceNo || "--"}</strong>
                        </div>
                        <div className="invoice-info-item">
                          <span>Invoice Date:</span>
                          <strong>{formatInvoiceDate(invoiceForm.invoiceDate)}</strong>
                        </div>
                        <div className="invoice-info-item align-right">
                          <span>Due Date:</span>
                          <strong>{formatInvoiceDate(invoiceForm.dueDate)}</strong>
                        </div>
                      </div>

                      <div className="invoice-info-grid invoice-info-grid-bottom">
                        <div className="invoice-party-compact">
                          <span className="invoice-mini-label">Bill To</span>
                          <strong>{invoiceForm.billTo || "CASH INVOICE"}</strong>
                        </div>
                        <div className="invoice-party-compact">
                          <span className="invoice-mini-label">Ship To</span>
                          <strong>{invoiceForm.shipTo || "CASH INVOICE"}</strong>
                        </div>
                        <div className="invoice-party-compact align-right">
                          <span className="invoice-mini-label">Vehicle No.</span>
                          <strong>{invoiceForm.vehicleNo || "--"}</strong>
                        </div>
                      </div>

                      <div className="invoice-place-row">
                        <span>Place of Supply: {invoiceForm.placeOfSupply || "--"}</span>
                      </div>
                    </section>

                    <div className="invoice-blue-rule" />

                    <table className="invoice-table invoice-table-clean">
                      <thead>
                        <tr>
                          <th>Items</th>
                          <th>HSN</th>
                          <th>Qty.</th>
                          <th>Rate</th>
                          <th>Tax</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceItems.map((item) => {
                          const lineTaxAmount = roundToTwo(
                            (item.baseAmount * taxRate) / 100
                          );
                          const lineTotalAmount = roundToTwo(
                            item.baseAmount + lineTaxAmount
                          );

                          return (
                            <tr key={item.description}>
                              <td className="invoice-item-label">
                                {item.description}
                              </td>
                              <td>{item.hsn}</td>
                              <td>{`${formatNumber(item.qtyValue)} ${item.qtyUnit}`}</td>
                              <td>{formatNumber(item.rate)}</td>
                              <td className="invoice-tax-cell">
                                {formatCurrency(lineTaxAmount)}
                                <span>({formatNumber(taxRate, 2)}%)</span>
                              </td>
                              <td>{formatCurrency(lineTotalAmount)}</td>
                            </tr>
                          );
                        })}

                        <tr className="invoice-subtotal-row">
                          <td>Subtotal</td>
                          <td />
                          <td>{subtotalQuantity}</td>
                          <td />
                          <td>{formatCurrency(cgstAmount + sgstAmount)}</td>
                          <td>{formatCurrency(grandTotal)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="invoice-blue-rule bottom" />

                    <section className="invoice-bottom">
                      <div className="invoice-notes invoice-notes-plain">
                        <h3>Terms and Conditions</h3>
                        <p>
                          Stone post fixing and fence installation will be
                          completed using the agreed material specification.
                        </p>
                        <p>
                          Materials are billed as per measured quantity and site
                          requirement at a fair rate.
                        </p>
                      </div>

                      <div className="invoice-summary invoice-summary-plain">
                        <div className="invoice-summary-row">
                          <span>Taxable Amount</span>
                          <strong>{formatCurrency(taxableAmount)}</strong>
                        </div>
                        <div className="invoice-summary-row">
                          <span>CGST @{formatNumber(cgstRate, 2)}%</span>
                          <strong>{formatCurrency(cgstAmount)}</strong>
                        </div>
                        <div className="invoice-summary-row">
                          <span>SGST @{formatNumber(sgstRate, 2)}%</span>
                          <strong>{formatCurrency(sgstAmount)}</strong>
                        </div>
                        <div className="invoice-summary-row total">
                          <span>Total Amount</span>
                          <strong>{formatCurrency(grandTotal)}</strong>
                        </div>
                        <div className="invoice-summary-row received">
                          <span>Received Amount</span>
                          <strong>{formatCurrency(receivedAmount)}</strong>
                        </div>
                      </div>
                    </section>

                    <section className="invoice-footer-band">
                      <div className="invoice-words invoice-words-inline">
                        <span>Total Amount (in words)</span>
                        <strong>{amountInWords}</strong>
                      </div>

                      <div className="invoice-signatory-wrap">
                        <div className="invoice-sign-box" />
                        <div className="invoice-signatory">
                          <span>Authorised Signatory For</span>
                          <strong>{COMPANY_PROFILE.name}</strong>
                        </div>
                      </div>
                    </section>
                  </article>
                </div>
              </div>
            </section>
          )}
        </div>
      </section>

      <footer id="contact" className="footer">
        <div className="container-xl">
          <div className="row g-3 align-items-start">
            <div className="col-lg-5">
              <h3 className="footer-title">FencingMS</h3>
              <p className="footer-text mb-2">
                Professional fencing solutions for homes, commercial spaces, and
                industrial sites.
              </p>
              <p className="footer-text mb-0">
                Address: 24/7 Industrial Road, Coimbatore, Tamil Nadu 641021
              </p>
            </div>
            <div className="col-lg-4">
              <h4 className="footer-subtitle">Contact</h4>
              <p className="footer-text mb-1">Phone: +91 98765 43210</p>
              <p className="footer-text mb-1">Email: support@fencingms.local</p>
              <p className="footer-text mb-0">Working Hours: Mon - Sat, 9:00 AM - 6:00 PM</p>
            </div>
            <div className="col-lg-3">
              <h4 className="footer-subtitle">Follow Us</h4>
              <div className="social-links">
                <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
                <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
                <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer">WhatsApp</a>
              </div>
            </div>
          </div>
          <hr className="footer-line" />
          <p className="footer-copy mb-0">© {new Date().getFullYear()} FencingMS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default BillingCalculation;
