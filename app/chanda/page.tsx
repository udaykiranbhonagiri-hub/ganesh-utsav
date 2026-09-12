"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "@/lib/supabase/client";

const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID ?? "";
const UPI_NAME =
  process.env.NEXT_PUBLIC_UPI_NAME ?? "Ganesh Utsav 2026";

export default function ChandaPage() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const numericAmount = Number(amount);

  const hasValidAmount =
    Number.isFinite(numericAmount) && numericAmount > 0;

  /*
   * QR payment URL.
   *
   * Keep this simple because your existing QR flow is already
   * successfully completing payments.
   */
  const qrUrl = useMemo(() => {
    if (!UPI_ID || !hasValidAmount) {
      return "";
    }

    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: UPI_NAME,
      am: numericAmount.toFixed(2),
      cu: "INR",
    });

    return `upi://pay?${params.toString()}`;
  }, [numericAmount, hasValidAmount]);

  /*
   * Browser-launched UPI intent.
   *
   * Add a unique transaction reference so the intent represents
   * a specific payment attempt.
   *
   * NPCI UPI deep-link specifications define `tr` as a
   * transaction reference ID.
   */
  const intentUrl = useMemo(() => {
    if (!UPI_ID || !hasValidAmount) {
      return "";
    }

    const transactionReference =
      `CHANDA${Date.now()}`.slice(0, 35);

    const params = new URLSearchParams({
      pa: UPI_ID,
      pn: UPI_NAME,
      tr: transactionReference,
      tn: "Ganesh Utsav Chanda",
      am: numericAmount.toFixed(2),
      cu: "INR",
    });

    return `upi://pay?${params.toString()}`;
  }, [numericAmount, hasValidAmount]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const contributionAmount = Number(amount);

      if (!name.trim()) {
        throw new Error("Please enter your name.");
      }

      if (
        !Number.isFinite(contributionAmount) ||
        contributionAmount <= 0
      ) {
        throw new Error("Please enter a valid Chanda amount.");
      }

      if (!utr.trim()) {
        throw new Error(
          "Please enter the UTR / transaction ID."
        );
      }

      const { error: insertError } = await supabase
        .from("chanda_payments")
        .insert({
          contributor_name: name.trim(),
          phone: phone.trim() || null,
          amount: contributionAmount,
          utr_number: utr.trim(),
          payment_method: "upi",
        });

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      setName("");
      setPhone("");
      setAmount("");
      setUtr("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to record your contribution."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-orange-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">

        {/* Back */}
        <Link
          href="/"
          className="text-sm font-medium text-orange-700 hover:underline"
        >
          ← Back to Home
        </Link>

        {/* Main Card */}
        <section className="mt-5 overflow-hidden rounded-3xl bg-white shadow-lg">

          {/* Header */}
          <div className="bg-orange-600 px-6 py-8 text-white">
            <p className="text-sm font-medium uppercase tracking-wider">
              Ganesh Utsav 2026
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Chanda
            </h1>

            <p className="mt-3 text-orange-100">
              Support our hostel Ganesh Utsav celebration.
            </p>
          </div>

          <div className="p-6">

            {/* Amount + QR */}
            <div className="rounded-2xl bg-orange-50 p-5">

              <h2 className="text-xl font-bold text-gray-900">
                Make a Contribution
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Enter the amount, then scan the QR code or open an
                installed UPI app to make your payment.
              </p>

              {/* Amount */}
              <div className="mt-5">
                <label
                  htmlFor="upiAmount"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Chanda Amount
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    ₹
                  </span>

                  <input
                    id="upiAmount"
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setSuccess(false);
                      setError("");
                    }}
                    placeholder="Enter Chanda amount"
                    required
                    className="w-full rounded-xl border border-orange-300 bg-white py-3 pl-10 pr-4 text-gray-900 placeholder:text-gray-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="mt-3 grid grid-cols-5 gap-2">
                  {[50, 100, 200, 500, 1000].map(
                    (value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setAmount(String(value));
                          setSuccess(false);
                          setError("");
                        }}
                        className="rounded-lg border border-orange-300 bg-white px-2 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100"
                      >
                        ₹{value}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* QR */}
              <div className="mt-6">
                <div className="mx-auto flex h-64 w-64 items-center justify-center rounded-2xl border bg-white p-4">
                  {!UPI_ID ? (
                    <p className="px-6 text-center text-sm text-red-600">
                      UPI payments have not been configured yet.
                      Please contact an organizer.
                    </p>
                  ) : qrUrl ? (
                    <QRCodeSVG
                      value={qrUrl}
                      size={220}
                      level="M"
                      includeMargin
                    />
                  ) : (
                    <p className="px-6 text-center text-sm text-gray-500">
                      Enter a valid Chanda amount to generate the
                      payment QR.
                    </p>
                  )}
                </div>
              </div>

              {/* UPI ID */}
              <div className="mt-5 rounded-xl bg-white p-4 text-center">

                <p className="text-sm text-gray-500">
                  UPI ID
                </p>

                <p className="mt-1 break-all text-lg font-bold text-gray-900">
                  {UPI_ID || "UPI ID not configured"}
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  Scan the QR code with your UPI app, complete the
                  payment, then enter your transaction details below.
                </p>

                {/* UPI Intent button */}
                {intentUrl && (
                  <a
                    href={intentUrl}
                    className="mt-4 inline-flex rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white hover:bg-orange-700"
                  >
                    Open UPI app to pay ₹
                    {numericAmount.toFixed(2)}
                  </a>
                )}

                {intentUrl && (
                  <p className="mt-3 text-xs text-gray-500">
                    This opens an installed UPI app using a unique
                    transaction reference for this payment attempt.
                  </p>
                )}

              </div>
            </div>

            {/* Divider */}
            <div className="my-8 border-t" />

            {/* Payment Details */}
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Payment Details
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  After completing the UPI payment, enter your
                  transaction details.
                </p>
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Your Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSuccess(false);
                    setError("");
                  }}
                  placeholder="Enter your name"
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setSuccess(false);
                    setError("");
                  }}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              {/* UTR */}
              <div>
                <label
                  htmlFor="utr"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  UTR / Transaction ID
                </label>

                <input
                  id="utr"
                  type="text"
                  value={utr}
                  onChange={(e) => {
                    setUtr(e.target.value);
                    setSuccess(false);
                    setError("");
                  }}
                  placeholder="Enter payment transaction ID"
                  required
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="rounded-xl bg-green-50 px-4 py-4 text-center text-green-700">
                  <p className="text-lg font-bold">
                    ✓ Chanda Recorded
                  </p>

                  <p className="mt-1 text-sm">
                    Thank you for supporting Ganesh Utsav.
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-orange-600 px-5 py-4 font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Recording..." : "I Have Paid"}
              </button>

            </form>
          </div>
        </section>
      </div>
    </main>
  );
}