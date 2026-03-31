import { EmailState } from '../store/types';
import juice from 'juice';

export function exportHTML(emailState: EmailState) {
  const { blocks, canvasStyle } = emailState;

  // 1. Sort Blocks top-to-bottom, left-to-right
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (a.layout.rowStart === b.layout.rowStart) {
      return a.layout.colStart - b.layout.colStart;
    }
    return a.layout.rowStart - b.layout.rowStart;
  });

  // 2. Group blocks by their rowStart so side-by-side blocks render together
  const rows: Record<number, typeof sortedBlocks> = {};
  sortedBlocks.forEach((block) => {
    const row = block.layout.rowStart;
    if (!rows[row]) rows[row] = [];
    rows[row].push(block);
  });

  const sortedRowStarts = Object.keys(rows).map(Number).sort((a, b) => a - b);
  let tableRows = "";
  let previousRowEnd = 1;

  // 3. Generate the Complex Table Structure
  sortedRowStarts.forEach((rowStart) => {
    // Add vertical spacer if there is a massive gap between rows
    const verticalGap = rowStart - previousRowEnd;
    if (verticalGap > 1) {
      const gapHeight = verticalGap * 10; // approximate row height
      tableRows += `<tr><td height="${gapHeight}" style="line-height:${gapHeight}px; font-size:0;">&nbsp;</td></tr>`;
    }

    // Start a master row container
    tableRows += `<tr><td align="center" width="100%"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; table-layout: fixed;"><tr>`;
    
    let currentCol = 1;
    const blocksInRow = rows[rowStart];

    blocksInRow.forEach((block) => {
      // Create empty horizontal space if the block doesn't start immediately
      if (block.layout.colStart > currentCol) {
        const gapCols = block.layout.colStart - currentCol;
        const gapWidth = (gapCols / 48) * 100;
        tableRows += `<td width="${gapWidth}%" style="font-size:0; line-height:0;">&nbsp;</td>`;
      }

      // Calculate block width percentage
      const blockWidth = (block.layout.colSpan / 48) * 100;
      
      // Extract styling
      const { type, content, style } = block;
      const align = style.textAlign || "left";
      const padding = style.padding || "0px";
      const bgColor = style.backgroundColor || "transparent";
      const color = style.color || "#000000";
      const fontSize = style.fontSize || "16px";

      let innerContent = "";

      // Generate HTML based on block type
      if (type === "text") {
        innerContent = `<div style="color: ${color}; font-size: ${fontSize}; word-break: break-word;">${content.value || "Text Block"}</div>`;
      } 
      else if (type === "image") {
        innerContent = `<img src="${content.url || "https://placehold.co/600x200?text=Image"}" alt="${content.alt || "Image"}" width="100%" style="max-width: 100%; height: auto; display: block; border: 0;" />`;
      } 
      else if (type === "button") {
        innerContent = `
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td align="${align}">
                <table border="0" cellpadding="0" cellspacing="0" style="margin: ${align === 'center' ? '0 auto' : align === 'right' ? '0 0 0 auto' : '0 auto 0 0'};">
                  <tr>
                    <td align="center" bgcolor="${bgColor !== 'transparent' ? bgColor : '#007bff'}" style="border-radius: 4px;">
                      <a href="${content.href || '#'}" target="_blank" style="display: inline-block; padding: 10px 20px; color: ${color !== '#000000' ? color : '#ffffff'}; text-decoration: none; font-size: ${fontSize}; font-weight: bold;">
                        ${content.value || "Button"}
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>`;
      }

      // Inject the block into its calculated table cell
      tableRows += `
        <td width="${blockWidth}%" align="${align}" valign="top" style="padding: ${padding}; background-color: ${type !== 'button' ? bgColor : 'transparent'};">
          ${innerContent}
        </td>
      `;

      currentCol = block.layout.colStart + block.layout.colSpan;
    });

    // Fill any remaining space on the far right of the row
    if (currentCol <= 48) {
      const remainingCols = 48 - currentCol + 1;
      const remainingWidth = (remainingCols / 48) * 100;
      tableRows += `<td width="${remainingWidth}%" style="font-size:0; line-height:0;">&nbsp;</td>`;
    }

    tableRows += `</tr></table></td></tr>`;

    // Track the row span to calculate the next vertical gap
    const maxRowSpan = Math.max(...blocksInRow.map(b => b.layout.rowSpan));
    previousRowEnd = rowStart + maxRowSpan;
  });

  const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: ${canvasStyle.backgroundColor || '#f4f4f4'}; margin: 0; padding: 20px; font-family: sans-serif;">
  <table width="600" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff;">
    ${tableRows}
  </table>
</body>
</html>
  `.trim();

  const inlinedHTML = juice(htmlTemplate);

  // Ask the user where to send it
  const targetEmail = window.prompt("Enter your email address to send this test:");
  
  if (!targetEmail) {
    console.log("Sending cancelled.");
    return;
  }

  console.log(`Blasting email to ${targetEmail}...`);

  // Send the HTML and the email address to your new Next.js API route
  fetch('/api/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      html: inlinedHTML, 
      email: targetEmail 
    }),
  })
  .then(res => res.json())
  .then(data => {
    console.log("Success!", data);
    alert("Email sent! Check your inbox.");
  })
  .catch(err => {
    console.error("Failed to send", err);
    alert("Failed to send email. Check your console.");
  });
}