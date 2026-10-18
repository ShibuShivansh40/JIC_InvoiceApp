function dataUriToBlob(dataUri) {
  try {
    const parts = dataUri.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
    const b64 = parts[1] || '';
    const byteCharacters = atob(b64.replace(/\s/g, ''));
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([new Uint8Array(byteNumbers)], { type: mime });
  } catch (e) {
    console.error('dataUriToBlob error:', e);
    return null;
  }
}

export const print = async ({ filePath }) => {
  if (!filePath) return;

  let blobUrl = null;
  let shouldRevoke = false;

  if (filePath.startsWith('data:')) {
    const blob = dataUriToBlob(filePath);
    if (blob) {
      blobUrl = URL.createObjectURL(blob);
      shouldRevoke = true;
    }
  } else if (filePath.startsWith('blob:') || filePath.startsWith('http')) {
    blobUrl = filePath;
  }

  // On mobile browsers, opening in new tab is the only reliable way to view/print PDFs
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile && blobUrl) {
    window.open(blobUrl, '_blank');
    return;
  }

  if (blobUrl) {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = blobUrl;
      document.body.appendChild(iframe);

      const triggerPrint = () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
        } catch (err) {
          console.warn('Iframe print failed, falling back to window.open:', err);
          window.open(blobUrl, '_blank');
        } finally {
          setTimeout(() => {
            if (iframe.parentNode) document.body.removeChild(iframe);
            if (shouldRevoke) URL.revokeObjectURL(blobUrl);
          }, 3000);
        }
      };

      iframe.onload = () => {
        setTimeout(triggerPrint, 300);
      };

      // Fallback timeout in case iframe onload does not fire for PDF plugin
      setTimeout(triggerPrint, 1500);
      return;
    } catch (e) {
      console.warn('Print frame initialization error:', e);
      window.open(blobUrl, '_blank');
      return;
    }
  }

  window.print();
};

export default { print };
