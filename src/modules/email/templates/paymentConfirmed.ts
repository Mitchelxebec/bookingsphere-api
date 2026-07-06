interface PaymentConfirmedData {
  guestName: string;
  guestEmail: string;
  reservationId: string;
  propertyName: string;
  propertyLocation: string;
  propertyCity: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: string;
  paymentMethod: string | null;
  proprietorName: string | null;
  proprietorEmail: string | null;
  proprietorPhone: string | null;
}

export const paymentConfirmedTemplate = (data: PaymentConfirmedData): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmed</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f5f7; padding: 20px 0;">
        <tr>
          <td align="center">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              
              <!-- Header Banner -->
              <tr>
                <td style="background-color: #1e3a8a; padding: 40px 30px; text-align: center;">
                  <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Booking Confirmed!</h1>
                  <p style="color: #93c5fd; margin: 10px 0 0 0; font-size: 14px;">Hi ${data.guestName}, your payment was processed successfully.</p>
                </td>
              </tr>

              <!-- Main Content Block -->
              <tr>
                <td style="padding: 30px;">
                  
                  <!-- Booking Reference Number -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; margin-bottom: 25px;">
                    <tr>
                      <td style="padding: 15px; text-align: center;">
                        <span style="font-size: 12px; font-weight: 600; color: #64748b; uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">RESERVATION REFERENCE ID</span>
                        <strong style="font-size: 18px; color: #0f172a; font-family: monospace;">${data.reservationId}</strong>
                      </td>
                    </tr>
                  </table>

                  <!-- Property / Stay Information -->
                  <h2 style="font-size: 16px; color: #0f172a; margin: 0 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Stay Details</h2>
                  <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 700; color: #1e3a8a;">${data.propertyName}</p>
                  <p style="margin: 0 0 20px 0; font-size: 14px; color: #475569;">${data.propertyLocation}, ${data.propertyCity}</p>

                  <!-- Check In & Out Grid -->
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px;">
                    <tr>
                      <td width="48%" style="vertical-align: top; background-color: #f8fafc; padding: 15px; border-radius: 6px;">
                        <strong style="font-size: 11px; color: #64748b; uppercase; display: block; margin-bottom: 4px;">CHECK-IN</strong>
                        <span style="font-size: 14px; font-weight: 600; color: #0f172a;">${data.checkIn}</span>
                      </td>
                      <td width="4%"></td>
                      <td width="48%" style="vertical-align: top; background-color: #f8fafc; padding: 15px; border-radius: 6px;">
                        <strong style="font-size: 11px; color: #64748b; uppercase; display: block; margin-bottom: 4px;">CHECK-OUT</strong>
                        <span style="font-size: 14px; font-weight: 600; color: #0f172a;">${data.checkOut}</span>
                      </td>
                    </tr>
                  </table>

                  <!-- Summary Statistics -->
                  <p style="margin: 0 0 25px 0; font-size: 14px; color: #334155;">
                    Total Duration of Stay: <strong>${data.nights} ${data.nights === 1 ? 'night' : 'nights'}</strong>
                  </p>

                  <!-- Pricing Ledger -->
                  <h2 style="font-size: 16px; color: #0f172a; margin: 0 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Billing Summary</h2>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 15px;">
                    <tr>
                      <td style="padding: 6px 0; font-size: 14px; color: #475569;">Payment Method:</td>
                      <td align="right" style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0f172a;">${data.paymentMethod || 'Paid'}</td>
                    </tr>
                    <tr style="border-top: 1px solid #f1f5f9;">
                      <td style="padding: 12px 0 6px 0; font-size: 16px; font-weight: 700; color: #0f172a;">Total Paid:</td>
                      <td align="right" style="padding: 12px 0 6px 0; font-size: 20px; font-weight: 700; color: #16a34a;">${data.totalPrice}</td>
                    </tr>
                  </table>

                  <!-- Proprietor Info (Conditional Display Handling) -->
                  ${data.proprietorName || data.proprietorEmail || data.proprietorPhone ? `
                  <h2 style="font-size: 16px; color: #0f172a; margin: 25px 0 12px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Host Contact Information</h2>
                  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 6px; padding: 15px;">
                    ${data.proprietorName ? `
                    <tr>
                      <td style="padding: 4px 0; font-size: 14px; color: #475569;"><span style="color: #64748b;">Name:</span> ${data.proprietorName}</td>
                    </tr>` : ''}
                    ${data.proprietorEmail ? `
                    <tr>
                      <td style="padding: 4px 0; font-size: 14px; color: #475569;"><span style="color: #64748b;">Email:</span> <a href="mailto:${data.proprietorEmail}" style="color: #1e3a8a; text-decoration: none;">${data.proprietorEmail}</a></td>
                    </tr>` : ''}
                    ${data.proprietorPhone ? `
                    <tr>
                      <td style="padding: 4px 0; font-size: 14px; color: #475569;"><span style="color: #64748b;">Phone:</span> ${data.proprietorPhone}</td>
                    </tr>` : ''}
                  </table>
                  ` : ''}

                  <!-- Basic Help Disclaimer -->
                  <p style="margin: 30px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.5; text-align: center;">
                    Need assistance with your booking? Please reach out to your host directly using the contact methods provided above. Safe travels!
                  </p>

                </td>
              </tr>

              <!-- Simple Clean Footer -->
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
