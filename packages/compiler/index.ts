// [CORE] Rendering Logic
export const compileToEmailHtml = (blocks: any[]) => {
  const body = blocks.map(block => {
    if (block.type === 'TEXT') {
      return `<tr><td style="color: ${block.color}; font-family: sans-serif;">${block.content}</td></tr>`;
    }
    if (block.type === 'BUTTON') {
      return `<tr><td><a href="${block.url}" style="background: blue; color: white; padding: 10px; text-decoration: none;">${block.content}</a></td></tr>`;
    }
    return '';
  }).join('');

  return `<!DOCTYPE html><html><body><table width="100%">${body}</table></body></html>`;
};
