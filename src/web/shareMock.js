function dataUriToBlob(dataUri, fallbackMime = 'application/octet-stream') {
  try {
    const parts = dataUri.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : fallbackMime;
    const b64 = parts[1] || '';
    const byteCharacters = atob(b64.replace(/\s/g, ''));
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    return new Blob([new Uint8Array(byteNumbers)], { type: mime });
  } catch (e) {
    console.error('shareMock: dataUriToBlob error:', e);
    return null;
  }
}

export const open = async (options = {}) => {
  const { title, url, filename } = options;
  if (!url) return;

  const defaultExt = filename && filename.endsWith('.csv') ? 'text/csv' : 'application/pdf';
  const defaultName = filename || (defaultExt === 'text/csv' ? 'Report.csv' : 'Invoice.pdf');

  let blob = null;
  let objectUrl = null;

  if (url.startsWith('data:')) {
    blob = dataUriToBlob(url, defaultExt);
    if (blob) {
      objectUrl = URL.createObjectURL(blob);
    }
  } else {
    objectUrl = url;
  }

  // Attempt Web Share API (mobile devices)
  if (navigator.share && blob) {
    try {
      const file = new File([blob], defaultName, { type: blob.type || defaultExt });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title || defaultName,
        });
        if (objectUrl && objectUrl.startsWith('blob:')) URL.revokeObjectURL(objectUrl);
        return;
      }
    } catch (err) {
      // AbortError is user cancellation, don't fallback to download if user simply closed share sheet
      if (err.name === 'AbortError') {
        if (objectUrl && objectUrl.startsWith('blob:')) URL.revokeObjectURL(objectUrl);
        return;
      }
      console.log('Web share failed, proceeding to direct download:', err);
    }
  }

  // Fallback: Direct file download via anchor tag with object URL
  try {
    const a = document.createElement('a');
    a.href = objectUrl || url;
    a.download = defaultName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } finally {
    if (objectUrl && objectUrl.startsWith('blob:')) {
      setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
    }
  }
};

export default { open };
