import { Cl } from "@stacks/transactions";
import { beforeEach, describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("Simple Donation Contract", () => {
  beforeEach(() => {
    simnet.setEpoch("2.4");
  });

  it("should initialize with correct default values", () => {
    const stats = simnet.callReadOnlyFn(
      "donation",
      "get-pool-stats",
      [],
      deployer
    );

    expect(stats.result).toBeOk(
      Cl.tuple({
        "total-donations": Cl.uint(0),
        "total-withdrawn": Cl.uint(0),
        "current-balance": Cl.uint(0),
        "total-donors": Cl.uint(0),
        "min-donation": Cl.uint(100000) // 0.1 STX
      })
    );
  });

  it("should allow users to donate", () => {
    const donationAmount = 1000000; // 1 STX

    const { result } = simnet.callPublicFn(
      "donation",
      "donate",
      [Cl.uint(donationAmount)],
      wallet1
    );

    expect(result).toBeOk(Cl.uint(donationAmount));

    // Check user donation
    const userDonation = simnet.callReadOnlyFn(
      "donation",
      "get-user-donation",
      [Cl.principal(wallet1)],
      deployer
    );

    expect(userDonation.result).toBe(Cl.uint(donationAmount));
  });

  it("should reject donations below minimum", () => {
    const smallAmount = 50000; // 0.05 STX (below 0.1 STX minimum)

    const { result } = simnet.callPublicFn(
      "donation",
      "donate",
      [Cl.uint(smallAmount)],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(101)); // ERR_INSUFFICIENT_AMOUNT
  });

  it("should reject zero donations", () => {
    const { result } = simnet.callPublicFn(
      "donation",
      "donate",
      [Cl.uint(0)],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(105)); // ERR_ZERO_AMOUNT
  });

  it("should track multiple donors correctly", () => {
    // First donor
    simnet.callPublicFn(
      "donation",
      "donate",
      [Cl.uint(1000000)],
      wallet1
    );

    // Second donor
    simnet.callPublicFn(
      "donation",
      "donate",
      [Cl.uint(2000000)],
      wallet2
    );

    // Check total donors
    const totalDonors = simnet.callReadOnlyFn(
      "donation",
      "get-total-donors",
      [],
      deployer
    );

    expect(totalDonors.result).toBe(Cl.uint(2));

    // Check total donations
    const totalDonations = simnet.callReadOnlyFn(
      "donation",
      "get-total-donations",
      [],
      deployer
    );

    expect(totalDonations.result).toBe(Cl.uint(3000000));
  });

  it("should allow admin to withdraw funds", () => {
    // First, add some donations
    simnet.callPublicFn(
      "donation",
      "donate",
      [Cl.uint(5000000)],
      wallet1
    );

    // Admin withdraws
    const withdrawAmount = 2000000;
    const { result } = simnet.callPublicFn(
      "donation",
      "withdraw",
      [
        Cl.uint(withdrawAmount),
        Cl.principal(wallet2),
        Cl.stringAscii("Charity for education")
      ],
      deployer
    );

    expect(result).toBeOk(Cl.uint(withdrawAmount));

    // Check total withdrawn
    const totalWithdrawn = simnet.callReadOnlyFn(
      "donation",
      "get-total-withdrawn",
      [],
      deployer
    );

    expect(totalWithdrawn.result).toBe(Cl.uint(withdrawAmount));
  });

  it("should not allow non-admin to withdraw", () => {
    // Add donation first
    simnet.callPublicFn(
      "donation",
      "donate",
      [Cl.uint(1000000)],
      wallet1
    );

    // Non-admin tries to withdraw
    const { result } = simnet.callPublicFn(
      "donation",
      "withdraw",
      [
        Cl.uint(500000),
        Cl.principal(wallet2),
        Cl.stringAscii("Unauthorized withdrawal")
      ],
      wallet1
    );

    expect(result).toBeErr(Cl.uint(100)); // ERR_NOT_AUTHORIZED
  });

  it("should not allow withdrawal more than balance", () => {
    // Add small donation
    simnet.callPublicFn(
      "donation",
      "donate",
      [Cl.uint(1000000)],
      wallet1
    );

    // Try to withdraw more than available
    const { result } = simnet.callPublicFn(
      "donation",
      "withdraw",
      [
        Cl.uint(2000000),
        Cl.principal(wallet2),
        Cl.stringAscii("Over withdrawal")
      ],
      deployer
    );

    expect(result).toBeErr(Cl.uint(102)); // ERR_INSUFFICIENT_BALANCE
  });

  it("should allow admin to set minimum donation", () => {
    const newMin = 200000; // 0.2 STX

    const { result } = simnet.callPublicFn(
      "donation",
      "set-min-donation",
      [Cl.uint(newMin)],
      deployer
    );

    expect(result).toBeOk(Cl.uint(newMin));

    // Check new minimum
    const minDonation = simnet.callReadOnlyFn(
      "donation",
      "get-min-donation",
      [],
      deployer
    );

    expect(minDonation.result).toBe(Cl.uint(newMin));
  });

  it("should track donation history", () => {
    // Make a donation
    simnet.callPublicFn(
      "donation",
      "donate",
      [Cl.uint(1000000)],
      wallet1
    );

    // Check donation history
    const history = simnet.callReadOnlyFn(
      "donation",
      "get-donation-history",
      [Cl.uint(0)],
      deployer
    );

    expect(history.result).toBeSome(
      Cl.tuple({
        donor: Cl.principal(wallet1),
        amount: Cl.uint(1000000),
        timestamp: Cl.uint(1) // block height
      })
    );
  });

  it("should handle multiple donations from same user", () => {
    // First donation
    simnet.callPublicFn(
      "donation",
      "donate",
      [Cl.uint(1000000)],
      wallet1
    );

    // Second donation from same user
    simnet.callPublicFn(
      "donation",
      "donate",
      [Cl.uint(500000)],
      wallet1
    );

    // Check user's total donation
    const userDonation = simnet.callReadOnlyFn(
      "donation",
      "get-user-donation",
      [Cl.principal(wallet1)],
      deployer
    );

    expect(userDonation.result).toBe(Cl.uint(1500000));

    // Should still count as only 1 donor
    const totalDonors = simnet.callReadOnlyFn(
      "donation",
      "get-total-donors",
      [],
      deployer
    );

    expect(totalDonors.result).toBe(Cl.uint(1));
  });
});
