import {
  describe,
  test,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import mongoose from "mongoose";
import { connectTestDB, clearTestDB, closeTestDB } from "../setup/db.js";

import Khata from "../../modules/khata/models/khata.model.js";
import KhataTransaction from "../../modules/khata/models/khataTransaction.model.js";
import Shop from "../../modules/shop/models/shop.model.js";
import User from "../../modules/auth/models/auth.model.js";

import * as khataService from "../../services/khata/khata.service.js";

let seller;
let buyer;
let otherSeller;
let otherBuyer;
let shop;

beforeAll(async () => {
  await connectTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

beforeEach(async () => {
  await clearTestDB();

  seller = await User.create({
    name: "Seller One",
    email: "seller1@test.com",
    password: "password123",
    role: "seller",
  });

  otherSeller = await User.create({
    name: "Seller Two",
    email: "seller2@test.com",
    password: "password123",
    role: "seller",
  });

  buyer = await User.create({
    name: "Buyer One",
    email: "buyer1@test.com",
    password: "password123",
    role: "buyer",
  });

  otherBuyer = await User.create({
    name: "Buyer Two",
    email: "buyer2@test.com",
    password: "password123",
    role: "buyer",
  });

  shop = await Shop.create({
    shopName: "Test General Store",
    owner: seller._id,
    khataEnabled: true,
  });
});

describe("khata.service — apply / approve / reject flow", () => {
  test("buyer can apply for khata when shop has it enabled", async () => {
    const khata = await khataService.applyForKhata(shop._id, buyer._id, {
      requestNote: "regular customer",
    });

    expect(khata.status).toBe("pending");
    expect(khata.requestNote).toBe("regular customer");
    expect(String(khata.shop)).toBe(String(shop._id));
    expect(String(khata.buyer)).toBe(String(buyer._id));
  });

  test("buyer cannot apply when shop has khata disabled", async () => {
    shop.khataEnabled = false;
    await shop.save();

    await expect(
      khataService.applyForKhata(shop._id, buyer._id, {}),
    ).rejects.toThrow(/does not offer Khata/i);
  });

  test("buyer cannot apply twice while a request is pending", async () => {
    await khataService.applyForKhata(shop._id, buyer._id, {});

    await expect(
      khataService.applyForKhata(shop._id, buyer._id, {}),
    ).rejects.toThrow(/already pending/i);
  });

  test("re-applying after rejection resets status to pending", async () => {
    const first = await khataService.applyForKhata(shop._id, buyer._id, {});
    await khataService.rejectKhata(first._id, seller._id, {
      rejectionReason: "Could not verify identity",
    });

    const reapplied = await khataService.applyForKhata(shop._id, buyer._id, {
      requestNote: "here is my ID proof",
    });

    expect(reapplied.status).toBe("pending");
    expect(reapplied.rejectionReason).toBeUndefined();
    expect(String(reapplied._id)).toBe(String(first._id));
  });

  test("seller can approve a pending request with a credit limit", async () => {
    const khata = await khataService.applyForKhata(shop._id, buyer._id, {});
    const approved = await khataService.approveKhata(khata._id, seller._id, {
      creditLimit: 5000,
    });

    expect(approved.status).toBe("approved");
    expect(approved.creditLimit).toBe(5000);
    expect(approved.approvedAt).toBeInstanceOf(Date);
  });

  test("seller cannot approve a khata that is already approved", async () => {
    const khata = await khataService.applyForKhata(shop._id, buyer._id, {});
    await khataService.approveKhata(khata._id, seller._id, {
      creditLimit: 5000,
    });

    await expect(
      khataService.approveKhata(khata._id, seller._id, { creditLimit: 8000 }),
    ).rejects.toThrow(/already approved/i);
  });

  test("a seller who does not own the shop cannot approve (ownership-over-role)", async () => {
    const khata = await khataService.applyForKhata(shop._id, buyer._id, {});

    await expect(
      khataService.approveKhata(khata._id, otherSeller._id, {
        creditLimit: 1000,
      }),
    ).rejects.toThrow(/not authorized/i);
  });

  test("seller can reject a pending request with a reason", async () => {
    const khata = await khataService.applyForKhata(shop._id, buyer._id, {});
    const rejected = await khataService.rejectKhata(khata._id, seller._id, {
      rejectionReason: "Insufficient information",
    });

    expect(rejected.status).toBe("rejected");
    expect(rejected.rejectionReason).toBe("Insufficient information");
  });

  test("seller cannot reject an already-approved khata (must suspend instead)", async () => {
    const khata = await khataService.applyForKhata(shop._id, buyer._id, {});
    await khataService.approveKhata(khata._id, seller._id, {
      creditLimit: 5000,
    });

    await expect(
      khataService.rejectKhata(khata._id, seller._id, {
        rejectionReason: "changed mind",
      }),
    ).rejects.toThrow(/suspend instead/i);
  });
});

describe("khata.service — suspend / reactivate / credit limit", () => {
  let approvedKhata;

  beforeEach(async () => {
    const khata = await khataService.applyForKhata(shop._id, buyer._id, {});
    approvedKhata = await khataService.approveKhata(khata._id, seller._id, {
      creditLimit: 5000,
    });
  });

  test("seller can suspend an approved khata", async () => {
    const suspended = await khataService.suspendKhata(
      approvedKhata._id,
      seller._id,
      {
        suspendedReason: "Missed last payment",
      },
    );

    expect(suspended.status).toBe("suspended");
    expect(suspended.suspendedReason).toBe("Missed last payment");
  });

  test("cannot suspend a khata that is not approved", async () => {
    const pending = await khataService.applyForKhata(
      shop._id,
      otherBuyer._id,
      {},
    );

    await expect(
      khataService.suspendKhata(pending._id, seller._id, {
        suspendedReason: "test",
      }),
    ).rejects.toThrow(/only approved khata/i);
  });

  test("seller can reactivate a suspended khata", async () => {
    await khataService.suspendKhata(approvedKhata._id, seller._id, {
      suspendedReason: "test",
    });
    const reactivated = await khataService.reactivateKhata(
      approvedKhata._id,
      seller._id,
    );

    expect(reactivated.status).toBe("approved");
    expect(reactivated.suspendedReason).toBeUndefined();
  });

  test("cannot reactivate a khata that is not suspended", async () => {
    await expect(
      khataService.reactivateKhata(approvedKhata._id, seller._id),
    ).rejects.toThrow(/only suspended khata/i);
  });

  test("seller can raise the credit limit", async () => {
    const updated = await khataService.updateCreditLimit(
      approvedKhata._id,
      seller._id,
      {
        creditLimit: 10000,
      },
    );

    expect(updated.creditLimit).toBe(10000);
  });

  test("cannot lower credit limit below current outstanding balance", async () => {
    await khataService.chargeKhataForOrder({
      shopId: shop._id,
      buyerId: buyer._id,
      orderId: new mongoose.Types.ObjectId(),
      amount: 3000,
    });

    await expect(
      khataService.updateCreditLimit(approvedKhata._id, seller._id, {
        creditLimit: 1000,
      }),
    ).rejects.toThrow(/below the current outstanding balance/i);
  });
});

describe("khata.service — order integration (charge / eligibility / reverse)", () => {
  let approvedKhata;

  beforeEach(async () => {
    const khata = await khataService.applyForKhata(shop._id, buyer._id, {});
    approvedKhata = await khataService.approveKhata(khata._id, seller._id, {
      creditLimit: 2000,
    });
  });

  test("canUseKhata returns eligible:true when approved and within limit", async () => {
    const result = await khataService.canUseKhata(shop._id, buyer._id, 1500);
    expect(result.eligible).toBe(true);
    expect(result.availableCredit).toBe(2000);
  });

  test("canUseKhata returns not_approved when no khata exists", async () => {
    const strangerBuyer = await User.create({
      name: "Stranger",
      email: "stranger@test.com",
      password: "password123",
      role: "buyer",
    });

    const result = await khataService.canUseKhata(
      shop._id,
      strangerBuyer._id,
      100,
    );
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("not_approved");
  });

  test("canUseKhata returns insufficient_credit when amount exceeds available", async () => {
    const result = await khataService.canUseKhata(shop._id, buyer._id, 5000);
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("insufficient_credit");
  });

  test("chargeKhataForOrder creates a credit_purchase transaction and updates balance", async () => {
    const orderId = new mongoose.Types.ObjectId();
    const txn = await khataService.chargeKhataForOrder({
      shopId: shop._id,
      buyerId: buyer._id,
      orderId,
      amount: 800,
    });

    expect(txn.type).toBe("credit_purchase");
    expect(txn.amount).toBe(800);
    expect(txn.balanceAfter).toBe(800);
    expect(String(txn.order)).toBe(String(orderId));

    const updated = await Khata.findById(approvedKhata._id);
    expect(updated.outstandingBalance).toBe(800);
  });

  test("chargeKhataForOrder throws when khata is not approved (e.g. suspended)", async () => {
    await khataService.suspendKhata(approvedKhata._id, seller._id, {
      suspendedReason: "test",
    });

    await expect(
      khataService.chargeKhataForOrder({
        shopId: shop._id,
        buyerId: buyer._id,
        orderId: new mongoose.Types.ObjectId(),
        amount: 100,
      }),
    ).rejects.toThrow(/cannot be used for payment/i);
  });

  test("chargeKhataForOrder throws when amount exceeds available credit", async () => {
    await expect(
      khataService.chargeKhataForOrder({
        shopId: shop._id,
        buyerId: buyer._id,
        orderId: new mongoose.Types.ObjectId(),
        amount: 5000,
      }),
    ).rejects.toThrow(/insufficient available credit/i);
  });

  test("chargeKhataForOrder throws when no khata account exists for the shop", async () => {
    const strangerBuyer = await User.create({
      name: "Stranger Two",
      email: "stranger2@test.com",
      password: "password123",
      role: "buyer",
    });

    await expect(
      khataService.chargeKhataForOrder({
        shopId: shop._id,
        buyerId: strangerBuyer._id,
        orderId: new mongoose.Types.ObjectId(),
        amount: 100,
      }),
    ).rejects.toThrow(/no khata account exists/i);
  });

  test("reverseKhataCharge writes a compensating adjustment and restores balance", async () => {
    const orderId = new mongoose.Types.ObjectId();
    await khataService.chargeKhataForOrder({
      shopId: shop._id,
      buyerId: buyer._id,
      orderId,
      amount: 500,
    });

    let khata = await Khata.findById(approvedKhata._id);
    expect(khata.outstandingBalance).toBe(500);

    const reversal = await khataService.reverseKhataCharge({
      shopId: shop._id,
      buyerId: buyer._id,
      orderId,
    });

    expect(reversal.type).toBe("adjustment");
    expect(reversal.amount).toBe(-500);

    khata = await Khata.findById(approvedKhata._id);
    expect(khata.outstandingBalance).toBe(0);
  });

  test("reverseKhataCharge is a no-op (does not double-reverse) if called twice", async () => {
    const orderId = new mongoose.Types.ObjectId();
    await khataService.chargeKhataForOrder({
      shopId: shop._id,
      buyerId: buyer._id,
      orderId,
      amount: 500,
    });

    await khataService.reverseKhataCharge({
      shopId: shop._id,
      buyerId: buyer._id,
      orderId,
    });
    await khataService.reverseKhataCharge({
      shopId: shop._id,
      buyerId: buyer._id,
      orderId,
    });

    const khata = await Khata.findById(approvedKhata._id);
    expect(khata.outstandingBalance).toBe(0); // not -500

    const adjustments = await KhataTransaction.find({
      khata: approvedKhata._id,
      order: orderId,
      type: "adjustment",
    });
    expect(adjustments).toHaveLength(1);
  });

  test("reverseKhataCharge is a no-op when no matching charge exists", async () => {
    const result = await khataService.reverseKhataCharge({
      shopId: shop._id,
      buyerId: buyer._id,
      orderId: new mongoose.Types.ObjectId(),
    });
    expect(result).toBeUndefined();

    const khata = await Khata.findById(approvedKhata._id);
    expect(khata.outstandingBalance).toBe(0);
  });

  test("balance never goes negative — a payment larger than the balance is rejected", async () => {
    await khataService.chargeKhataForOrder({
      shopId: shop._id,
      buyerId: buyer._id,
      orderId: new mongoose.Types.ObjectId(),
      amount: 300,
    });

    await expect(
      khataService.recordPayment(approvedKhata._id, seller._id, {
        amount: 1000,
      }),
    ).rejects.toThrow(/exceeds outstanding balance/i);
  });
});

describe("khata.service — payments, statements, month close", () => {
  let approvedKhata;

  beforeEach(async () => {
    const khata = await khataService.applyForKhata(shop._id, buyer._id, {});
    approvedKhata = await khataService.approveKhata(khata._id, seller._id, {
      creditLimit: 5000,
    });
  });

  test("recordPayment creates a negative-amount transaction and reduces balance", async () => {
    await khataService.chargeKhataForOrder({
      shopId: shop._id,
      buyerId: buyer._id,
      orderId: new mongoose.Types.ObjectId(),
      amount: 1000,
    });

    const payment = await khataService.recordPayment(
      approvedKhata._id,
      seller._id,
      {
        amount: 400,
        note: "cash payment",
      },
    );

    expect(payment.type).toBe("payment");
    expect(payment.amount).toBe(-400);
    expect(payment.balanceAfter).toBe(600);

    const khata = await Khata.findById(approvedKhata._id);
    expect(khata.outstandingBalance).toBe(600);
  });

  test("getTransactionHistory returns entries newest-first, seller can view", async () => {
    await khataService.chargeKhataForOrder({
      shopId: shop._id,
      buyerId: buyer._id,
      orderId: new mongoose.Types.ObjectId(),
      amount: 200,
    });
    await khataService.recordPayment(approvedKhata._id, seller._id, {
      amount: 50,
    });

    const history = await khataService.getTransactionHistory(
      approvedKhata._id,
      seller._id,
      true,
    );

    expect(history).toHaveLength(2);
    expect(history[0].type).toBe("payment"); // most recent first
  });

  test("getTransactionHistory rejects a buyer who is not the khata owner", async () => {
    const strangerBuyer = await User.create({
      name: "Stranger Three",
      email: "stranger3@test.com",
      password: "password123",
      role: "buyer",
    });

    await expect(
      khataService.getTransactionHistory(
        approvedKhata._id,
        strangerBuyer._id,
        false,
      ),
    ).rejects.toThrow(/not authorized/i);
  });

  test("closeMonth creates a settlement snapshot and marks transactions settled without deleting them", async () => {
    const month = new Date().toISOString().slice(0, 7);

    await khataService.chargeKhataForOrder({
      shopId: shop._id,
      buyerId: buyer._id,
      orderId: new mongoose.Types.ObjectId(),
      amount: 1000,
    });
    await khataService.recordPayment(approvedKhata._id, seller._id, {
      amount: 300,
    });

    const settlement = await khataService.closeMonth(
      approvedKhata._id,
      seller._id,
      {
        statementMonth: month,
      },
    );

    expect(settlement.statementMonth).toBe(month);
    expect(settlement.totalCredits).toBe(1000);
    expect(settlement.totalPayments).toBe(300);
    expect(settlement.closingBalance).toBe(700);

    // History rule: transactions must NEVER be deleted on settlement
    const txns = await KhataTransaction.find({ khata: approvedKhata._id });
    expect(txns).toHaveLength(2);
    expect(txns.every((t) => t.settledAt instanceof Date)).toBe(true);
  });

  test("closeMonth cannot be called twice for the same month", async () => {
    const month = new Date().toISOString().slice(0, 7);
    await khataService.closeMonth(approvedKhata._id, seller._id, {
      statementMonth: month,
    });

    await expect(
      khataService.closeMonth(approvedKhata._id, seller._id, {
        statementMonth: month,
      }),
    ).rejects.toThrow(/already closed/i);
  });
});

describe("khata.service — shop-specific isolation", () => {
  test("a buyer approved at Shop A has no khata record at Shop B", async () => {
    const shopB = await Shop.create({
      shopName: "Shop B",
      owner: otherSeller._id,
      khataEnabled: true,
    });

    const khataA = await khataService.applyForKhata(shop._id, buyer._id, {});
    await khataService.approveKhata(khataA._id, seller._id, {
      creditLimit: 3000,
    });

    const statusAtShopB = await khataService.getShopKhataStatus(
      shopB._id,
      buyer._id,
    );

    expect(statusAtShopB.khata).toBeNull();
    expect(statusAtShopB.khataEnabled).toBe(true);
  });

  test("getMyKhatas only returns khatas belonging to that buyer, across shops", async () => {
    const shopB = await Shop.create({
      shopName: "Shop B",
      owner: otherSeller._id,
      khataEnabled: true,
    });

    await khataService.applyForKhata(shop._id, buyer._id, {});
    await khataService.applyForKhata(shopB._id, buyer._id, {});

    const mine = await khataService.getMyKhatas(buyer._id);
    expect(mine).toHaveLength(2);
  });
});
