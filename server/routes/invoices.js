const express = require("express");
const crypto = require("crypto");

const Invoice = require("../models/Invoice");
const Khata = require("../models/Khata");
const Customer = require("../models/Customer");
const Counter = require("../models/Counter");
const User = require("../models/User");

const {
  requireAuth,
} = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function roundMoney(value) {
  return (
    Math.round(
      Number(value || 0) * 100,
    ) / 100
  );
}

const DISCOUNT_TYPES = [
  "none",
  "percent",
  "fixed",
];

function normalizeDiscountType(value) {
  return DISCOUNT_TYPES.includes(value)
    ? value
    : "none";
}

function calculateDiscountAmount(
  baseAmount,
  type,
  rawValue,
) {
  const base = Math.max(
    0,
    Number(baseAmount) || 0,
  );

  const discountType =
    normalizeDiscountType(type);

  const value = Math.max(
    0,
    Number(rawValue) || 0,
  );

  if (discountType === "percent") {
    return roundMoney(
      (base * Math.min(value, 100)) /
        100,
    );
  }

  if (discountType === "fixed") {
    return roundMoney(
      Math.min(value, base),
    );
  }

  return 0;
}

function calcTotals(
  items,
  adjustments = {},
) {
  let grossSubtotal = 0;
  let itemDiscountTotal = 0;
  let preInvoiceDiscountSubtotal = 0;

  const calculatedItems = items.map(
    (item) => {
      const qty = Math.max(
        0,
        Number(item.qty) || 0,
      );

      const rate = Math.max(
        0,
        Number(item.rate) || 0,
      );

      const gst = Math.max(
        0,
        Number(item.gst) || 0,
      );

      const gross = roundMoney(
        qty * rate,
      );

      const discountType =
        normalizeDiscountType(
          item.discountType,
        );

      const rawDiscountValue =
        Math.max(
          0,
          Number(
            item.discountValue,
          ) || 0,
        );

      const discountAmount =
        calculateDiscountAmount(
          gross,
          discountType,
          rawDiscountValue,
        );

      const discountValue =
        discountType === "none"
          ? 0
          : discountType === "percent"
            ? Math.min(
                rawDiscountValue,
                100,
              )
            : Math.min(
                rawDiscountValue,
                gross,
              );

      const taxableBeforeInvoiceDiscount =
        roundMoney(
          gross - discountAmount,
        );

      grossSubtotal += gross;

      itemDiscountTotal +=
        discountAmount;

      preInvoiceDiscountSubtotal +=
        taxableBeforeInvoiceDiscount;

      return {
        desc: String(
          item.desc || "",
        ).trim(),

        hsnSac: String(
          item.hsnSac || "",
        ).trim(),

        unit:
          String(
            item.unit || "Nos",
          ).trim() || "Nos",

        qty,
        rate,
        gst,

        discountType,
        discountValue,
        discountAmount,

        taxableBeforeInvoiceDiscount,
      };
    },
  );

  grossSubtotal = roundMoney(
    grossSubtotal,
  );

  itemDiscountTotal = roundMoney(
    itemDiscountTotal,
  );

  preInvoiceDiscountSubtotal =
    roundMoney(
      preInvoiceDiscountSubtotal,
    );

  const invoiceDiscountType =
    normalizeDiscountType(
      adjustments.invoiceDiscountType,
    );

  const rawInvoiceDiscountValue =
    Math.max(
      0,
      Number(
        adjustments.invoiceDiscountValue,
      ) || 0,
    );

  const invoiceDiscountValue =
    invoiceDiscountType === "none"
      ? 0
      : invoiceDiscountType ===
          "percent"
        ? Math.min(
            rawInvoiceDiscountValue,
            100,
          )
        : Math.min(
            rawInvoiceDiscountValue,
            preInvoiceDiscountSubtotal,
          );

  const invoiceDiscountAmount =
    calculateDiscountAmount(
      preInvoiceDiscountSubtotal,
      invoiceDiscountType,
      invoiceDiscountValue,
    );

  const subtotal = roundMoney(
    preInvoiceDiscountSubtotal -
      invoiceDiscountAmount,
  );

  const taxableRatio =
    preInvoiceDiscountSubtotal > 0
      ? subtotal /
        preInvoiceDiscountSubtotal
      : 0;

  let cgst = 0;
  let sgst = 0;

  calculatedItems.forEach(
    (item) => {
      const adjustedTaxable =
        item.taxableBeforeInvoiceDiscount *
        taxableRatio;

      cgst +=
        (adjustedTaxable *
          item.gst) /
        200;

      sgst +=
        (adjustedTaxable *
          item.gst) /
        200;
    },
  );

  cgst = roundMoney(cgst);
  sgst = roundMoney(sgst);

  const extraChargeName = String(
    adjustments.extraChargeName ||
      "",
  ).trim();

  const extraChargeAmount =
    roundMoney(
      Math.max(
        0,
        Number(
          adjustments.extraChargeAmount,
        ) || 0,
      ),
    );

  const total = roundMoney(
    subtotal +
      cgst +
      sgst +
      extraChargeAmount,
  );

  return {
    items: calculatedItems.map(
      ({
        taxableBeforeInvoiceDiscount,
        ...item
      }) => item,
    ),

    grossSubtotal,
    itemDiscountTotal,

    invoiceDiscountType,
    invoiceDiscountValue,
    invoiceDiscountAmount,

    subtotal,

    cgst,
    sgst,
    igst: 0,

    extraChargeName,
    extraChargeAmount,

    total,
  };
}

function slugifyBusinessName(name) {
  const cleaned = (
    name || "BUSINESS"
  )
    .toUpperCase()
    .replace(
      /[^A-Z0-9]/g,
      "",
    );

  return cleaned || "BUSINESS";
}

function todayKey() {
  const d = new Date();

  const yyyy = d.getFullYear();

  const mm = String(
    d.getMonth() + 1,
  ).padStart(2, "0");

  const dd = String(
    d.getDate(),
  ).padStart(2, "0");

  return `${yyyy}${mm}${dd}`;
}

function todayIso() {
  return new Date()
    .toISOString()
    .split("T")[0];
}

async function generateInvoiceNo(
  userId,
  businessName,
) {
  const dateKey = todayKey();

  const counterKey =
    `${userId}:${dateKey}`;

  const counter =
    await Counter.findOneAndUpdate(
      {
        key: counterKey,
      },
      {
        $inc: {
          seq: 1,
        },
      },
      {
        upsert: true,
        new: true,
      },
    );

  const seqStr = String(
    counter.seq,
  ).padStart(3, "0");

  const slug =
    slugifyBusinessName(
      businessName,
    );

  return `${slug}-${dateKey}-${seqStr}`;
}

// ─────────────────────────────────────────────
// PAYMENT HELPERS
// ─────────────────────────────────────────────

function randomDigits(length) {
  let value = "";

  for (
    let i = 0;
    i < length;
    i += 1
  ) {
    value += crypto
      .randomInt(0, 10)
      .toString();
  }

  return value;
}

function getPaymentPrefix(method) {
  switch (method) {
    case "upi":
      return "UPI";

    case "card":
      return "CARD";

    case "bank_transfer":
      return "BANK";

    case "net_banking":
      return "NB";

    case "cash":
      return "CASH";

    case "cheque":
      return "CHQ";

    default:
      return "PAY";
  }
}

function generateSandboxReference(
  method,
) {
  const prefix =
    getPaymentPrefix(method);

  const transactionId =
    `${prefix}-SBX-${randomDigits(
      12,
    )}`;

  const reference =
    `UTR-SBX-${randomDigits(
      12,
    )}`;

  return {
    transactionId,
    reference,
  };
}

function getEffectiveAmountPaid(
  invoice,
) {
  if (
    invoice.amountPaid !== null &&
    invoice.amountPaid !== undefined
  ) {
    return roundMoney(
      invoice.amountPaid,
    );
  }

  // Old fully-paid invoices
  if (
    invoice.status === "paid"
  ) {
    return roundMoney(
      invoice.total,
    );
  }

  return 0;
}

function getPaymentSummary(
  invoice,
) {
  const total = roundMoney(
    invoice.total,
  );

  const amountPaid = Math.min(
    total,
    getEffectiveAmountPaid(
      invoice,
    ),
  );

  const balanceDue = Math.max(
    0,
    roundMoney(
      total - amountPaid,
    ),
  );

  return {
    amountPaid,
    balanceDue,
  };
}

function deriveStatus(
  total,
  amountPaid,
) {
  const safeTotal =
    roundMoney(total);

  const safePaid =
    roundMoney(amountPaid);

  if (
    safeTotal <= 0 ||
    safePaid >= safeTotal
  ) {
    return "paid";
  }

  if (safePaid > 0) {
    return "partial";
  }

  return "udhaar";
}

function serializeInvoice(
  invoice,
) {
  const obj =
    invoice.toObject
      ? invoice.toObject()
      : invoice;

  const summary =
    getPaymentSummary(
      invoice,
    );

  return {
    ...obj,

    amountPaid:
      summary.amountPaid,

    balanceDue:
      summary.balanceDue,
  };
}

// ─────────────────────────────────────────────
// KHATA SYNC
// ─────────────────────────────────────────────

async function syncInvoiceKhata(
  invoice,
) {
  const {
    balanceDue,
  } = getPaymentSummary(
    invoice,
  );

  const existing =
    await Khata.findOne({
      userId:
        invoice.userId,

      relatedInvoiceId:
        invoice._id,

      type: "udhaar",
    });

  if (balanceDue <= 0) {
    if (existing) {
      await Khata.deleteOne({
        _id: existing._id,
      });
    }

    return;
  }

  if (existing) {
    existing.customerId =
      invoice.customerId || null;

    existing.customerName =
      invoice.customerName;

    existing.amount =
      balanceDue;

    existing.note =
      `Invoice ${invoice.invoiceNo}`;

    existing.date =
      invoice.date;

    await existing.save();

    return;
  }

  await Khata.create({
    userId:
      invoice.userId,

    customerId:
      invoice.customerId || null,

    customerName:
      invoice.customerName,

    amount:
      balanceDue,

    type:
      "udhaar",

    note:
      `Invoice ${invoice.invoiceNo}`,

    date:
      invoice.date,

    relatedInvoiceId:
      invoice._id,
  });
}

// ─────────────────────────────────────────────
// CUSTOMER
// ─────────────────────────────────────────────

async function resolveCustomer(
  userId,
  body,
) {
  if (body.customerId) {
    const customer =
      await Customer.findOne({
        _id:
          body.customerId,

        userId,
      });

    if (customer) {
      return customer._id;
    }
  }

  if (
    !body.customerName?.trim()
  ) {
    return null;
  }

  const customerName =
    body.customerName.trim();

  const existing =
    await Customer.findOne({
      userId,
      name: customerName,
    });

  if (existing) {
    return existing._id;
  }

  const created =
    await Customer.create({
      userId,

      name:
        customerName,

      phone:
        body.customerPhone || "",

      gstin:
        body.customerGstin || "",

      address:
        body.customerAddress || "",
    });

  return created._id;
}

// ─────────────────────────────────────────────
// GET ALL
// ─────────────────────────────────────────────

router.get(
  "/",
  async (req, res) => {
    try {
      const {
        status,
      } = req.query;

      const filter = {
        userId:
          req.user.userId,
      };

      if (
        status &&
        status !== "all"
      ) {
        filter.status =
          status;
      }

      const invoices =
        await Invoice.find(
          filter,
        ).sort({
          createdAt: -1,
        });

      res.json({
        invoices:
          invoices.map(
            serializeInvoice,
          ),
      });
    } catch (err) {
      console.error(
        "Load invoices error:",
        err,
      );

      res.status(500).json({
        error:
          "Could not load invoices",
      });
    }
  },
);

// ─────────────────────────────────────────────
// GET ONE
// ─────────────────────────────────────────────

router.get(
  "/:id",
  async (req, res) => {
    try {
      const invoice =
        await Invoice.findOne({
          _id:
            req.params.id,

          userId:
            req.user.userId,
        });

      if (!invoice) {
        return res
          .status(404)
          .json({
            error:
              "Invoice not found",
          });
      }

      res.json({
        invoice:
          serializeInvoice(
            invoice,
          ),
      });
    } catch (err) {
      console.error(
        "Load invoice error:",
        err,
      );

      res.status(500).json({
        error:
          "Could not load invoice",
      });
    }
  },
);

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

router.post(
  "/",
  async (req, res) => {
    try {
      const body =
        req.body;

      if (
        !Array.isArray(
          body.items,
        ) ||
        !body.items.length
      ) {
        return res
          .status(400)
          .json({
            error:
              "At least one item is required",
          });
      }

      if (
        !body.customerName?.trim()
      ) {
        return res
          .status(400)
          .json({
            error:
              "Customer name is required",
          });
      }

      const validItems =
        body.items.filter(
          (item) =>
            item.desc?.trim(),
        );

      if (
        !validItems.length
      ) {
        return res
          .status(400)
          .json({
            error:
              "At least one item must have a description",
          });
      }

      const totals =
        calcTotals(
          validItems,
          body,
        );

      const user =
        await User.findById(
          req.user.userId,
        ).select(
          "businessName",
        );

      const invoiceNo =
        await generateInvoiceNo(
          req.user.userId,
          user?.businessName,
        );

      const customerId =
        await resolveCustomer(
          req.user.userId,
          body,
        );

      const requestedStatus =
        [
          "paid",
          "udhaar",
          "partial",
        ].includes(
          body.status,
        )
          ? body.status
          : "paid";

      let amountPaid = 0;

      if (
        requestedStatus ===
        "paid"
      ) {
        amountPaid =
          totals.total;
      }

      const balanceDue =
        roundMoney(
          totals.total -
            amountPaid,
        );

      const invoice =
        await Invoice.create({
          userId:
            req.user.userId,

          customerId,

          customerName:
            body.customerName.trim(),

          customerPhone:
            body.customerPhone || "",

          customerGstin:
            body.customerGstin || "",

          customerAddress:
            body.customerAddress || "",

          invoiceNo,

          docType:
            body.docType ||
            "Tax Invoice",

          date:
            body.date ||
            todayIso(),

          dueDate:
            body.dueDate || "",

          placeOfSupply:
            body.placeOfSupply || "",

          ...totals,

          notes:
            body.notes || "",

          status:
            requestedStatus,

          amountPaid,

          balanceDue,

          payments: [],
        });

      if (
        requestedStatus !==
        "paid"
      ) {
        await syncInvoiceKhata(
          invoice,
        );
      }

      res
        .status(201)
        .json({
          invoice:
            serializeInvoice(
              invoice,
            ),
        });
    } catch (err) {
      console.error(
        "Create invoice error:",
        err,
      );

      res.status(500).json({
        error:
          "Could not create invoice",
      });
    }
  },
);

// ─────────────────────────────────────────────
// RECORD PAYMENT
// ─────────────────────────────────────────────

router.post(
  "/:id/payments",
  async (req, res) => {
    try {
      const invoice =
        await Invoice.findOne({
          _id:
            req.params.id,

          userId:
            req.user.userId,
        });

      if (!invoice) {
        return res
          .status(404)
          .json({
            error:
              "Invoice not found",
          });
      }

      const amount =
        roundMoney(
          req.body.amount,
        );

      if (
        !amount ||
        amount <= 0
      ) {
        return res
          .status(400)
          .json({
            error:
              "Please enter a valid payment amount",
          });
      }

      const allowedMethods = [
        "upi",
        "card",
        "bank_transfer",
        "net_banking",
        "cash",
        "cheque",
        "other",
      ];

      const method =
        allowedMethods.includes(
          req.body.method,
        )
          ? req.body.method
          : "other";

      const allowedStatuses = [
        "success",
        "pending",
        "failed",
      ];

      const paymentStatus =
        allowedStatuses.includes(
          req.body.status,
        )
          ? req.body.status
          : "success";

      const {
        amountPaid:
          currentPaid,

        balanceDue:
          currentBalance,
      } =
        getPaymentSummary(
          invoice,
        );

      if (
        currentBalance <= 0
      ) {
        return res
          .status(400)
          .json({
            error:
              "This invoice is already fully paid",
          });
      }

      if (
        paymentStatus ===
          "success" &&
        amount >
          currentBalance
      ) {
        return res
          .status(400)
          .json({
            error:
              `Payment cannot exceed the remaining balance of ₹${currentBalance.toFixed(
                2,
              )}`,
          });
      }

      const {
        transactionId,
        reference,
      } =
        generateSandboxReference(
          method,
        );

      invoice.payments.push({
        amount,

        method,

        transactionId,

        reference,

        status:
          paymentStatus,

        paymentDate:
          req.body.paymentDate ||
          todayIso(),

        note:
          String(
            req.body.note || "",
          ).trim(),

        bankName:
          String(
            req.body.bankName ||
              "",
          ).trim(),

        maskedAccount:
          String(
            req.body
              .maskedAccount ||
              "",
          ).trim(),

        maskedCard:
          String(
            req.body.maskedCard ||
              "",
          ).trim(),

        mode:
          "sandbox",

        isDemo:
          true,
      });

      if (
        paymentStatus ===
        "success"
      ) {
        const newAmountPaid =
          roundMoney(
            currentPaid +
              amount,
          );

        invoice.amountPaid =
          Math.min(
            invoice.total,
            newAmountPaid,
          );

        invoice.balanceDue =
          Math.max(
            0,
            roundMoney(
              invoice.total -
                invoice.amountPaid,
            ),
          );

        invoice.status =
          deriveStatus(
            invoice.total,
            invoice.amountPaid,
          );
      } else {
        invoice.amountPaid =
          currentPaid;

        invoice.balanceDue =
          currentBalance;
      }

      await invoice.save();

      if (
        paymentStatus ===
        "success"
      ) {
        await syncInvoiceKhata(
          invoice,
        );
      }

      const savedPayment =
        invoice.payments[
          invoice.payments.length -
            1
        ];

      res
        .status(201)
        .json({
          message:
            paymentStatus ===
            "success"
              ? "Sandbox payment recorded successfully"
              : paymentStatus ===
                  "pending"
                ? "Sandbox payment is pending"
                : "Sandbox payment failed",

          payment:
            savedPayment,

          invoice:
            serializeInvoice(
              invoice,
            ),

          sandbox:
            true,
        });
    } catch (err) {
      console.error(
        "Record payment error:",
        err,
      );

      res.status(500).json({
        error:
          "Could not record payment",
      });
    }
  },
);

// ─────────────────────────────────────────────
// EDIT
// ─────────────────────────────────────────────

router.put(
  "/:id",
  async (req, res) => {
    try {
      const body =
        req.body;

      const invoice =
        await Invoice.findOne({
          _id:
            req.params.id,

          userId:
            req.user.userId,
        });

      if (!invoice) {
        return res
          .status(404)
          .json({
            error:
              "Invoice not found",
          });
      }

      if (
        !Array.isArray(
          body.items,
        ) ||
        !body.items.length
      ) {
        return res
          .status(400)
          .json({
            error:
              "At least one item is required",
          });
      }

      const validItems =
        body.items.filter(
          (item) =>
            item.desc?.trim(),
        );

      if (
        !validItems.length
      ) {
        return res
          .status(400)
          .json({
            error:
              "At least one item must have a description",
          });
      }

      if (
        !body.customerName?.trim()
      ) {
        return res
          .status(400)
          .json({
            error:
              "Customer name is required",
          });
      }

      const oldSummary =
        getPaymentSummary(
          invoice,
        );

      const totals =
        calcTotals(
          validItems,
          body,
        );

      const customerId =
        await resolveCustomer(
          req.user.userId,
          body,
        );

      invoice.customerId =
        customerId;

      invoice.customerName =
        body.customerName.trim();

      invoice.customerPhone =
        body.customerPhone || "";

      invoice.customerGstin =
        body.customerGstin || "";

      invoice.customerAddress =
        body.customerAddress || "";

      invoice.docType =
        body.docType ||
        invoice.docType;

      invoice.date =
        body.date ||
        invoice.date;

      invoice.dueDate =
        body.dueDate || "";

      invoice.placeOfSupply =
        body.placeOfSupply || "";

      invoice.items =
        totals.items;

      invoice.grossSubtotal =
        totals.grossSubtotal;

      invoice.itemDiscountTotal =
        totals.itemDiscountTotal;

      invoice.invoiceDiscountType =
        totals.invoiceDiscountType;

      invoice.invoiceDiscountValue =
        totals.invoiceDiscountValue;

      invoice.invoiceDiscountAmount =
        totals.invoiceDiscountAmount;

      invoice.subtotal =
        totals.subtotal;

      invoice.cgst =
        totals.cgst;

      invoice.sgst =
        totals.sgst;

      invoice.igst =
        totals.igst;

      invoice.extraChargeName =
        totals.extraChargeName;

      invoice.extraChargeAmount =
        totals.extraChargeAmount;

      invoice.total =
        totals.total;

      invoice.notes =
        body.notes || "";

      // Keep already-recorded payments
      invoice.amountPaid =
        Math.min(
          totals.total,
          oldSummary.amountPaid,
        );

      invoice.balanceDue =
        Math.max(
          0,
          roundMoney(
            totals.total -
              invoice.amountPaid,
          ),
        );

      invoice.status =
        deriveStatus(
          totals.total,
          invoice.amountPaid,
        );

      await invoice.save();

      await syncInvoiceKhata(
        invoice,
      );

      res.json({
        message:
          "Invoice updated successfully",

        invoice:
          serializeInvoice(
            invoice,
          ),
      });
    } catch (err) {
      console.error(
        "Update invoice error:",
        err,
      );

      res.status(500).json({
        error:
          "Could not update invoice",
      });
    }
  },
);

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

router.delete(
  "/:id",
  async (req, res) => {
    try {
      const invoice =
        await Invoice.findOneAndDelete(
          {
            _id:
              req.params.id,

            userId:
              req.user.userId,
          },
        );

      if (!invoice) {
        return res
          .status(404)
          .json({
            error:
              "Invoice not found",
          });
      }

      // Remove only Khata rows that belong
      // directly to this invoice.
      await Khata.deleteMany({
        userId:
          req.user.userId,

        relatedInvoiceId:
          invoice._id,
      });

      res.json({
        success: true,
      });
    } catch (err) {
      console.error(
        "Delete invoice error:",
        err,
      );

      res.status(500).json({
        error:
          "Could not delete invoice",
      });
    }
  },
);

module.exports = router;