export const open = async (options = {}) => {
  const { title, url, filename } = options;

  if (navigator.share && url) {
    try {
      // Convert base64 data url to blob file for native web share
      const fetchRes = await fetch(url);
      const blob = await fetchRes.blob();
      const file = new File([blob], filename || 'Invoice.pdf', { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title || 'Invoice',
        });
        return;
      }
    } catch (err) {
      console.log('Web share with file failed, falling back:', err);
    }
  }

  // Fallback: Trigger direct file download on web
  if (url) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'download.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

export default { open };
