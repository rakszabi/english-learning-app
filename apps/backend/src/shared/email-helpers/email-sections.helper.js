function createEmailHeader({
  name = "",
  preheader = "",
  baseColor = process.env.EMAIL_BASE_COLOR || "121212",
  logoSrc = process.env.LOGO_IMG_SRC || "",
  websiteName = process.env.WEBSITE_NAME || "",
} = {}) {
  const safeColor = baseColor.replace(/^#/, "");
  const preheaderText = (preheader || "").replace(/\s+/g, " ").trim();

  return `<!DOCTYPE html>
<html lang="hu">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${websiteName ? `${websiteName} – üzenet` : "Üzenet"}</title>
  <style>
    /* Alap resetek – a legtöbb kliens támogatja */
    html, body { margin:0; padding:0; height:100%; }
    img { border:0; -ms-interpolation-mode:bicubic; display:block; }
    table { border-collapse:collapse; }
    /* Dark mode minimál támogatás (nem minden kliens) */
    @media (prefers-color-scheme: dark) {
      .bg { background:#111 !important; }
      .card { background:#1a1a1a !important; }
      .text { color:#eee !important; }
      .muted { color:#bbb !important; }
    }
  </style>
  <!--[if mso]>
    <style>
      .text { font-family: Arial, sans-serif !important; }
    </style>
  <![endif]-->
</head>
<body class="bg" style="margin:0; padding:0; background:#f6f7f9;">
  <!-- Preheader (láthatatlan a levélben, csak listanézetben) -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; mso-hide:all;">
    ${preheaderText}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7f9;">
    <tr>
      <td align="center" style="padding:24px 12px;">
        <!-- Kártya / Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
          <!-- Felső színes sáv -->
          <tr>
            <td style="height:6px; line-height:6px; background:#${safeColor}; font-size:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background:#ffffff; box-shadow:0 1px 3px rgba(16,24,40,.06);" class="card">
              <!-- Logo -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:20px 24px 8px;">
                    ${
                      logoSrc
                        ? `<img src="${logoSrc}" width="150" alt="${
                            websiteName || "Logo"
                          }" style="width:150px; height:auto;">`
                        : ""
                    }
                  </td>
                </tr>
              </table>

              <!-- Cím -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="left" style="padding:8px 24px 0;">
                    <h1 class="text" style="margin:0; font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:18px; line-height:24px; font-weight:700; color:#1f2937;">
                      Kedves ${name || "Ügyfelünk"}!
                    </h1>
                  </td>
                </tr>
              </table>

              <!-- TARTALOM KEZDETE -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:16px 24px 0;" class="text">
`;
}

function createEmailFooter({
  signature = process.env.EMAIL_SIGNATURE || "",
  baseColor = process.env.EMAIL_BASE_COLOR || "121212",
} = {}) {
  const safeColor = baseColor.replace(/^#/, "");
  return `                  </td>
                </tr>
              </table>
              <!-- TARTALOM VÉGE -->

              <!-- Aláírás -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:24px;" class="text">
                    <p style="margin:0 0 4px 0; font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:14px; line-height:20px; color:#374151;">Üdvözlettel,</p>
                    <p style="margin:0; font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:14px; line-height:20px; color:#111827; font-weight:600;">${signature}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Alsó színes sáv -->
          <tr>
            <td style="height:6px; line-height:6px; background:#${safeColor}; font-size:0;">&nbsp;</td>
          </tr>

          <!-- Lábléc apróbetű -->
          <tr>
            <td align="center" style="padding:16px 8px 0;">
              <p class="muted" style="margin:8px 0 0 0; font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:12px; line-height:16px; color:#9ca3af;">
                Kérjük, ne válaszoljon erre az automatikus üzenetre.
              </p>
              <div style="height:24px; line-height:24px; font-size:0;">&nbsp;</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function createContactDetails({
  name = process.env.CONTACT_INFO_NAME || "",
  email = process.env.CONTACT_INFO_EMAIL || "",
  telephone = process.env.CONTACT_INFO_TELEPHONE || "",
} = {}) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;">
  <tr>
    <td style="padding:0 24px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb; border-radius:8px; background:#ffffff;">
        <tr>
          <td style="padding:16px; font-family:-apple-system, Segoe UI, Roboto, Arial, sans-serif; font-size:14px; line-height:20px; color:#374151;">
            <p style="margin:0 0 8px 0; font-size:14px; line-height:20px; color:#111827; font-weight:500;">
              Kérdés, észrevétel esetén, kérlek keress minket az alábbi elérhetőségek egyikén:
            </p>
            <p style="margin:0; font-size:14px; line-height:20px; color:#374151;">
              ${name ? `${name}<br>` : ""}
              ${
                email
                  ? `<a href="mailto:${email}" style="color:#0A84FF; text-decoration:none;">${email}</a><br>`
                  : ""
              }
              ${
                telephone
                  ? `<a href="tel:${telephone}" style="color:#0A84FF; text-decoration:none;">${telephone}</a>`
                  : ""
              }
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

module.exports = {
  createEmailHeader,
  createEmailFooter,
  createContactDetails,
};
