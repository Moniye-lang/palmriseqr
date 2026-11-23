import QRCode from 'qrcode';

export interface PassData {
  name: string;
  token: string;
  tableNumber?: string;
  section?: string;
  category?: string;
  isAdditionalGuest?: boolean;
  mainGuestName?: string;
}

/**
 * Loads an image from a URL with crossOrigin support.
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Draws a rounded rectangle path on canvas context.
 */
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Generates a high-resolution, beautifully designed Palmrise PNG pass.
 * Primary color: Crisp White
 * Brand accents: Royal Blue & Crimson Red
 * Canvas resolution: 600px width x 920px height.
 */
export async function generatePassCanvas(data: PassData): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const w = 600;
  const h = 920;
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D canvas context');

  // 1. Base Background: Crisp Premium White
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);

  // Outer subtle border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1, 1, w - 2, h - 2);

  // 2. Top Header Ribbon: Deep Royal Blue
  const headerHeight = 160;
  const headerGrad = ctx.createLinearGradient(0, 0, w, headerHeight);
  headerGrad.addColorStop(0, '#1e3a8a'); // Navy / Deep Royal
  headerGrad.addColorStop(0.6, '#1d4ed8'); // Vivid Royal Blue
  headerGrad.addColorStop(1, '#2563eb');

  ctx.fillStyle = headerGrad;
  ctx.fillRect(0, 0, w, headerHeight);

  // Red accent line directly beneath the blue header
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(0, headerHeight - 6, w, 6);

  // Decorative subtle circle watermark in header
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.beginPath();
  ctx.arc(w - 40, 20, 100, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Palmrise Top Branding text
  ctx.textAlign = 'center';

  // Subtitle badge
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('PALMRISE EVENT MANAGEMENT SYSTEM', w / 2, 45);

  // Main Event Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('PALMRISE EXECUTIVE GALA', w / 2, 80);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = '13px sans-serif';
  ctx.fillText('Annual Innovation & Leadership Summit 2026', w / 2, 105);

  // Red "OFFICIAL ACCESS PASS" Pill in Header
  const pillW = 200;
  const pillH = 26;
  const pillX = (w - pillW) / 2;
  const pillY = 120;
  ctx.fillStyle = '#dc2626';
  roundRect(ctx, pillX, pillY, pillW, pillH, 13);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('OFFICIAL ENTRY PASS', w / 2, pillY + 17);

  // 3. Guest Name & Credentials (y: 180 - 270)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('INVITED GUEST', w / 2, 195);

  // Guest Name
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 26px sans-serif';
  const displayName = data.name.length > 24 ? data.name.substring(0, 24) + '...' : data.name;
  ctx.fillText(displayName, w / 2, 230);

  // Additional guest info or category
  if (data.isAdditionalGuest && data.mainGuestName) {
    ctx.fillStyle = '#dc2626';
    ctx.font = 'italic 12px sans-serif';
    ctx.fillText(`Guest of: ${data.mainGuestName}`, w / 2, 255);
  } else {
    // Badges: Section & Table Number
    const secText = data.section === 'section2' ? 'SECTION 2' : 'SECTION 1';
    const tableText = data.tableNumber ? `TABLE ${data.tableNumber}` : 'VIP ADMISSION';

    // Badge 1: Blue Table Badge
    const badgeW = 140;
    const badgeH = 26;
    const badgeY = 245;
    const badge1X = w / 2 - badgeW - 10;
    const badge2X = w / 2 + 10;

    // Blue Badge (Table)
    ctx.fillStyle = '#eff6ff';
    roundRect(ctx, badge1X, badgeY, badgeW, badgeH, 6);
    ctx.fill();
    ctx.strokeStyle = '#bfdbfe';
    ctx.lineWidth = 1;
    roundRect(ctx, badge1X, badgeY, badgeW, badgeH, 6);
    ctx.stroke();

    ctx.fillStyle = '#1d4ed8';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(tableText, badge1X + badgeW / 2, badgeY + 17);

    // Red Badge (Section / Priority)
    ctx.fillStyle = '#fef2f2';
    roundRect(ctx, badge2X, badgeY, badgeW, badgeH, 6);
    ctx.fill();
    ctx.strokeStyle = '#fecaca';
    ctx.lineWidth = 1;
    roundRect(ctx, badge2X, badgeY, badgeW, badgeH, 6);
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(secText, badge2X + badgeW / 2, badgeY + 17);
  }

  // 4. Ticket Cut / Tear Line with Notches (y: 295)
  const tearY = 295;
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(35, tearY);
  ctx.lineTo(w - 35, tearY);
  ctx.stroke();
  ctx.setLineDash([]); // Reset dash

  // Left notch
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.arc(0, tearY, 18, -Math.PI / 2, Math.PI / 2, false);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, tearY, 18, -Math.PI / 2, Math.PI / 2, false);
  ctx.stroke();

  // Right notch
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.arc(w, tearY, 18, Math.PI / 2, -Math.PI / 2, false);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(w, tearY, 18, Math.PI / 2, -Math.PI / 2, false);
  ctx.stroke();

  // 5. QR Code Section (y: 320 - 580)
  try {
    const qrDataUrl = await QRCode.toDataURL(data.token, {
      width: 260,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
    const qrImg = await loadImage(qrDataUrl);

    // QR Outer Container Box (White with Royal Blue border)
    const qrBoxSize = 220;
    const qrBoxX = (w - qrBoxSize) / 2;
    const qrBoxY = 325;

    ctx.fillStyle = '#ffffff';
    roundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 18);
    ctx.fill();

    // Blue Border
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2.5;
    roundRect(ctx, qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 18);
    ctx.stroke();

    // Red Corner target reticles
    const reticleLen = 16;
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(qrBoxX - 6, qrBoxY + reticleLen);
    ctx.lineTo(qrBoxX - 6, qrBoxY - 6);
    ctx.lineTo(qrBoxX + reticleLen, qrBoxY - 6);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(qrBoxX + qrBoxSize - reticleLen, qrBoxY - 6);
    ctx.lineTo(qrBoxX + qrBoxSize + 6, qrBoxY - 6);
    ctx.lineTo(qrBoxX + qrBoxSize + 6, qrBoxY + reticleLen);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(qrBoxX - 6, qrBoxY + qrBoxSize - reticleLen);
    ctx.lineTo(qrBoxX - 6, qrBoxY + qrBoxSize + 6);
    ctx.lineTo(qrBoxX + reticleLen, qrBoxY + qrBoxSize + 6);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(qrBoxX + qrBoxSize - reticleLen, qrBoxY + qrBoxSize + 6);
    ctx.lineTo(qrBoxX + qrBoxSize + 6, qrBoxY + qrBoxSize + 6);
    ctx.lineTo(qrBoxX + qrBoxSize + 6, qrBoxY + qrBoxSize - reticleLen);
    ctx.stroke();

    // Draw the QR image centered
    ctx.drawImage(qrImg, qrBoxX + 10, qrBoxY + 10, qrBoxSize - 20, qrBoxSize - 20);
  } catch (err) {
    console.error('QR code render error on canvas:', err);
  }

  // Token code text beneath QR
  ctx.textAlign = 'center';
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('PRESENT DIGITAL QR CODE AT VENUE ENTRANCE', w / 2, 575);

  ctx.fillStyle = '#64748b';
  ctx.font = '10px monospace';
  const shortToken = data.token.length > 20 ? `${data.token.substring(0, 8)}...${data.token.substring(data.token.length - 8)}` : data.token;
  ctx.fillText(`AUTH-ID: ${shortToken}`, w / 2, 595);

  // 6. Event Logistics / Venue Block (y: 620 - 830)
  const infoBoxY = 620;
  const infoBoxH = 210;
  ctx.fillStyle = '#f8fafc';
  roundRect(ctx, 35, infoBoxY, w - 70, infoBoxH, 16);
  ctx.fill();

  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1;
  roundRect(ctx, 35, infoBoxY, w - 70, infoBoxH, 16);
  ctx.stroke();

  // Left red accent vertical strip
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.moveTo(35, infoBoxY + 16);
  ctx.arcTo(35, infoBoxY, 51, infoBoxY, 16);
  ctx.lineTo(40, infoBoxY);
  ctx.lineTo(40, infoBoxY + infoBoxH);
  ctx.lineTo(35, infoBoxY + infoBoxH);
  ctx.arcTo(35, infoBoxY + infoBoxH, 35, infoBoxY + infoBoxH - 16, 16);
  ctx.fill();

  ctx.textAlign = 'left';
  let currY = infoBoxY + 30;

  // Row 1: Date & Time
  ctx.fillStyle = '#1d4ed8';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('DATE & TIME', 60, currY);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('Saturday, November 28, 2026  ·  1:00 PM – 8:00 PM', 60, currY + 18);

  // Divider
  currY += 40;
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(60, currY);
  ctx.lineTo(w - 60, currY);
  ctx.stroke();

  // Row 2: Venue / Location
  currY += 20;
  ctx.fillStyle = '#1d4ed8';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('VENUE & LOCATION', 60, currY);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('The Palmrise Grand Pavilion & Ballrooms', 60, currY + 18);
  ctx.fillStyle = '#64748b';
  ctx.font = '11px sans-serif';
  ctx.fillText('Main Executive Concourse, Gate 1 Entrance', 60, currY + 34);

  // Divider
  currY += 50;
  ctx.strokeStyle = '#e2e8f0';
  ctx.beginPath();
  ctx.moveTo(60, currY);
  ctx.lineTo(w - 60, currY);
  ctx.stroke();

  // Row 3: Dress Code & Access
  currY += 20;
  ctx.fillStyle = '#1d4ed8';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('DRESS CODE & ADMISSION', 60, currY);
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('Smart Formal / Executive Evening Wear  ·  Strictly by QR Pass', 60, currY + 18);

  // 7. Footer Security Strip (y: 865)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '9px sans-serif';
  ctx.fillText('PALMRISE EVENT MANAGEMENT SYSTEM  ·  NON-TRANSFERABLE DIGITAL PASS', w / 2, 875);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '8px monospace';
  ctx.fillText('VERIFY INTEGRITY: PASS VALIDATED VIA PALMRISE ACCESS ENGINE', w / 2, 892);

  return canvas;
}

/**
 * Handles cross-platform downloading or sharing of the generated pass.
 */
export async function downloadOrSharePass(
  passData: PassData,
  onOpenModal?: (imageUrl: string) => void
): Promise<void> {
  const fileName = `Palmrise_Pass_${passData.name.replace(/\s+/g, '_')}.png`;
  const canvas = await generatePassCanvas(passData);

  return new Promise((resolve) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        console.error('Failed to convert pass canvas to blob');
        resolve();
        return;
      }

      const file = new File([blob], fileName, { type: 'image/png' });
      const dataUrl = canvas.toDataURL('image/png');

      if (onOpenModal) {
        onOpenModal(dataUrl);
      }

      if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Palmrise Entry Pass - ${passData.name}`,
            text: `Here is the official Palmrise entry pass for ${passData.name}.`,
          });
          resolve();
          return;
        } catch (shareErr: any) {
          if (shareErr.name !== 'AbortError') {
            console.warn('Web Share API error:', shareErr);
          }
        }
      }

      try {
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 15000);
      } catch (err) {
        console.warn('Programmatic download fallback triggered:', err);
      }

      resolve();
    }, 'image/png', 0.95);
  });
}
