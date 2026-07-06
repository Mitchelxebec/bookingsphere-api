export interface RefundInitiatedData {
  guestName: string;
  reservationId: string;
  propertyName: string;
  refundAmount: string;
  paymentMethod: string | null;
  paystackReference: string;
  refundInitiatedAt: string;
}

export const refundInitiatedTemplate = (data: RefundInitiatedData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Refund Initiated</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f5f7; padding: 20px 0;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              
              <!-- Header Banner -->
              <tr>
                <td style="background-color: #16a34a; padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Refund Transferred</h1>
                  <p style="color: #bbf7d0; margin: 10px 0 0 0; font-size: 14px;">Hi ${data.guestName}, your cash payback payload has been initiated.</p>
                </td>
              </tr>

              <!-- Main Content Block -->
              <tr>
                <td style="padding: 30px;">
                  
                  <!-- Refund Value Showcase Card -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 20px; text-align: center;">
                        <span style="font-size: 12px; font-weight: 600; color: #16a34a; uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">TOTAL AMOUNT RETURNED</span>
                        <strong style="font-size: 28px; color: #14532d;">${data.refundAmount}</strong>
                      </td>
                    </tr>
                  </table>

                  <!-- Context Metadata Table Details -->
                  <h2 style="font-size: 16px; color: #0f172a; margin: 0 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Transaction Context</h2>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #64748b;" width="40%">Property Name:</td>
                      <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${data.propertyName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Reservation ID:</td>
                      <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a; font-family: monospace;">${data.reservationId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Initiated On:</td>
                      <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${data.refundInitiatedAt}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Payment Destination:</td>
                      <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${data.paymentMethod || "Original Payment Source"}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #64748b;">Paystack Reference:</td>
                      <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #475569; font-family: monospace;">${data.paystackReference}</td>
                    </tr>
                  </table>

                  <!-- Timing Callout Box -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-left: 4px solid #16a34a; border-radius: 0 6px 6px 0; margin-bottom: 15px;">
                    <tr>
                      <td style="padding: 15px;">
                        <strong style="font-size: 14px; color: #0f172a; display: block; margin-bottom: 4px;">When will I see the money?</strong>
                        <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.5;">
                          Paystack network engines clear accounting transactions swiftly. However, standard commercial banking operations usually require <strong>3 to 5 business days</strong> to credit the actual ledger balances of your specific bank card account.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 30px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.5; text-align: center;">
                    Keep the Paystack Reference string recorded safely for verification actions if delays present themselves.
                  </p>

                </td>
              </tr>

              <!-- Footer Block -->
              <tr>
                <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; font-size: 12px; color: #94a3b8;">&copy; ${new Date().getFullYear()} Bookingsphere. All rights reserved.</p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};
