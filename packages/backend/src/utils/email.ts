import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Email] SMTP not configured — skipping email to: ${to} | Subject: ${subject}`)
    return
  }
  await transporter.sendMail({
    from: `"DAX Store" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  })
}

export function buildOrderConfirmationEmail(order: any, items: any[]) {
  const itemsHtml = items.map(i => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9">${i.titleSnapshot}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:center">${i.size}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:center">${i.qty}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:bold">$${Number(i.salePriceSnapshot ?? i.priceSnapshot).toFixed(2)}</td>
    </tr>
  `).join('')

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#0f172a">
      <div style="background:#0f172a;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
        <p style="color:white;font-size:28px;font-weight:900;margin:0">DA<span style="color:#e63946">X</span></p>
        <p style="color:#94a3b8;font-size:12px;margin:4px 0 0">Men's Clothing — Tripoli, Lebanon</p>
      </div>
      <h2 style="font-size:20px;font-weight:900;margin:0 0 8px">🎉 Order Confirmed!</h2>
      <p style="color:#64748b;margin:0 0 20px">Hi <strong>${order.customerName}</strong>, your order has been placed successfully.</p>
      <div style="background:#f8fafc;border-radius:8px;padding:12px 16px;margin-bottom:20px">
        <p style="margin:0;font-size:14px">Order <strong>#${order.id}</strong> &nbsp;|&nbsp; ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <thead>
          <tr style="background:#f1f5f9">
            <th style="padding:10px 8px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#64748b">Product</th>
            <th style="padding:10px 8px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#64748b">Size</th>
            <th style="padding:10px 8px;text-align:center;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#64748b">Qty</th>
            <th style="padding:10px 8px;text-align:right;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:#64748b">Price</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      <div style="border-top:2px solid #0f172a;padding:12px 0;text-align:right;margin-bottom:20px">
        <span style="font-size:18px;font-weight:900">Total: $${Number(order.total).toFixed(2)}</span>
      </div>
      <div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px;font-size:14px">
        <p style="margin:0 0 8px"><strong>Payment:</strong> ${order.paymentMethod} &nbsp;|&nbsp; Status: <span style="color:${order.paymentStatus === 'PAID' ? '#16a34a' : '#d97706'}">${order.paymentStatus}</span></p>
        <p style="margin:0 0 8px"><strong>Delivery to:</strong> ${order.customerAddress}${order.customerCity ? ', ' + order.customerCity : ''}</p>
        <p style="margin:0"><strong>Phone:</strong> ${order.customerPhone}</p>
      </div>
      <p style="font-size:13px;color:#94a3b8;text-align:center">Thank you for shopping with DAX! Questions? WhatsApp us at +96170474719</p>
    </div>
  `
}

export function buildPasswordResetEmail(name: string, resetUrl: string) {
  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;padding:24px;color:#0f172a">
      <div style="background:#0f172a;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
        <p style="color:white;font-size:28px;font-weight:900;margin:0">DA<span style="color:#e63946">X</span></p>
      </div>
      <h2 style="font-size:20px;font-weight:900">Reset Your Password</h2>
      <p style="color:#64748b">Hi <strong>${name}</strong>, we received a request to reset your password.</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${resetUrl}" style="background:#e63946;color:white;padding:14px 36px;border-radius:50px;text-decoration:none;font-weight:900;font-size:15px;display:inline-block">
          Reset Password
        </a>
      </div>
      <p style="font-size:13px;color:#94a3b8">This link expires in 1 hour. If you didn't request a reset, ignore this email.</p>
      <p style="font-size:12px;color:#cbd5e1;word-break:break-all">Or copy: ${resetUrl}</p>
    </div>
  `
}
