// Email template utilities for Global Pay Connect

const BRAND_COLOR = "#3b82f6";
const BRAND_NAME = "Global Pay Connect";

interface EmailLayout {
  title: string;
  preheader?: string;
  content: string;
}

function emailLayout({ title, preheader, content }: EmailLayout): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${preheader ? `<meta name="description" content="${preheader}">` : ''}
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: ${BRAND_COLOR}; padding: 32px 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 32px 24px; color: #1f2937; line-height: 1.6; }
    .button { display: inline-block; background-color: ${BRAND_COLOR}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; margin: 16px 0; }
    .footer { background-color: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
    .amount { font-size: 32px; font-weight: 700; color: ${BRAND_COLOR}; margin: 16px 0; }
    .info-box { background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .info-row { display: flex; justify-content: space-between; margin: 8px 0; }
    .label { color: #6b7280; font-weight: 500; }
    .value { color: #1f2937; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${BRAND_NAME}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Payment Received Email
export function paymentReceivedEmail(data: {
  merchantName: string;
  amount: string;
  currency: string;
  paymentId: string;
  customerEmail?: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const content = `
    <h2>🎉 Payment Received!</h2>
    <p>Great news! You've received a new payment.</p>
    
    <div class="amount">$${data.amount} ${data.currency}</div>
    
    <div class="info-box">
      <div class="info-row">
        <span class="label">Payment ID:</span>
        <span class="value">${data.paymentId}</span>
      </div>
      ${data.customerEmail ? `
      <div class="info-row">
        <span class="label">Customer:</span>
        <span class="value">${data.customerEmail}</span>
      </div>
      ` : ''}
      <div class="info-row">
        <span class="label">Status:</span>
        <span class="value" style="color: #10b981;">Completed</span>
      </div>
    </div>
    
    <p>The funds have been added to your balance and are ready for payout.</p>
    
    <a href="${data.dashboardUrl}" class="button">View in Dashboard</a>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
      Need help? Contact our support team at support@globalpayconnect.com
    </p>
  `;

  return {
    subject: `💰 Payment Received: $${data.amount} ${data.currency}`,
    html: emailLayout({
      title: "Payment Received",
      preheader: `You received $${data.amount} ${data.currency}`,
      content,
    }),
  };
}

// Payout Approved Email
export function payoutApprovedEmail(data: {
  amount: string;
  currency: string;
  payoutId: string;
  destinationAddress: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const content = `
    <h2>✅ Payout Approved</h2>
    <p>Your payout request has been approved and is ready to be executed.</p>
    
    <div class="amount">$${data.amount} ${data.currency}</div>
    
    <div class="info-box">
      <div class="info-row">
        <span class="label">Payout ID:</span>
        <span class="value">${data.payoutId}</span>
      </div>
      <div class="info-row">
        <span class="label">Destination:</span>
        <span class="value">${data.destinationAddress.slice(0, 8)}...${data.destinationAddress.slice(-6)}</span>
      </div>
      <div class="info-row">
        <span class="label">Status:</span>
        <span class="value" style="color: #10b981;">Approved</span>
      </div>
    </div>
    
    <p>Please sign the transaction in your wallet to complete the payout.</p>
    
    <a href="${data.dashboardUrl}" class="button">Sign Transaction</a>
  `;

  return {
    subject: `✅ Payout Approved: $${data.amount} ${data.currency}`,
    html: emailLayout({
      title: "Payout Approved",
      preheader: `Your payout of $${data.amount} ${data.currency} has been approved`,
      content,
    }),
  };
}

// Payout Completed Email
export function payoutCompletedEmail(data: {
  amount: string;
  currency: string;
  payoutId: string;
  txHash: string;
  chain: string;
  explorerUrl: string;
}): { subject: string; html: string } {
  const content = `
    <h2>🚀 Payout Completed</h2>
    <p>Your payout has been successfully processed on the blockchain.</p>
    
    <div class="amount">$${data.amount} ${data.currency}</div>
    
    <div class="info-box">
      <div class="info-row">
        <span class="label">Payout ID:</span>
        <span class="value">${data.payoutId}</span>
      </div>
      <div class="info-row">
        <span class="label">Chain:</span>
        <span class="value">${data.chain}</span>
      </div>
      <div class="info-row">
        <span class="label">Transaction:</span>
        <span class="value">${data.txHash.slice(0, 8)}...${data.txHash.slice(-6)}</span>
      </div>
    </div>
    
    <p>The transaction has been confirmed on the blockchain.</p>
    
    <a href="${data.explorerUrl}" class="button">View on Explorer</a>
  `;

  return {
    subject: `🚀 Payout Completed: $${data.amount} ${data.currency}`,
    html: emailLayout({
      title: "Payout Completed",
      preheader: `Your payout of $${data.amount} ${data.currency} is complete`,
      content,
    }),
  };
}

// Welcome Email
export function welcomeEmail(data: {
  businessName: string;
  dashboardUrl: string;
  docsUrl: string;
}): { subject: string; html: string } {
  const content = `
    <h2>👋 Welcome to ${BRAND_NAME}!</h2>
    <p>Hi ${data.businessName},</p>
    
    <p>Thank you for joining ${BRAND_NAME}! We're excited to help you accept crypto payments and manage payouts seamlessly.</p>
    
    <h3>🚀 Get Started:</h3>
    <ol style="line-height: 2;">
      <li><strong>Complete KYB Verification</strong> - Verify your business to unlock all features</li>
      <li><strong>Create Your First Payment</strong> - Start accepting USDC/USDT payments</li>
      <li><strong>Setup Payouts</strong> - Configure your payout destinations</li>
      <li><strong>Integrate Our API</strong> - Use our SDK for seamless integration</li>
    </ol>
    
    <a href="${data.dashboardUrl}" class="button">Go to Dashboard</a>
    
    <p style="margin-top: 24px;">Need help getting started? Check out our <a href="${data.docsUrl}" style="color: ${BRAND_COLOR};">documentation</a> or contact support.</p>
  `;

  return {
    subject: `Welcome to ${BRAND_NAME}! 🎉`,
    html: emailLayout({
      title: "Welcome",
      preheader: "Get started with crypto payments",
      content,
    }),
  };
}

// Verification Completed Email
export function verificationCompletedEmail(data: {
  businessName: string;
  dashboardUrl: string;
}): { subject: string; html: string } {
  const content = `
    <h2>✅ Verification Complete!</h2>
    <p>Great news, ${data.businessName}!</p>
    
    <p>Your business verification has been completed successfully. You now have full access to all ${BRAND_NAME} features.</p>
    
    <h3>🎉 What's Next:</h3>
    <ul style="line-height: 2;">
      <li>Accept unlimited crypto payments</li>
      <li>Process payouts to your wallet</li>
      <li>Access our full API and SDK</li>
      <li>Get priority support</li>
    </ul>
    
    <a href="${data.dashboardUrl}" class="button">Start Accepting Payments</a>
  `;

  return {
    subject: "✅ Your Business is Verified!",
    html: emailLayout({
      title: "Verification Complete",
      preheader: "Your business verification is complete",
      content,
    }),
  };
}

