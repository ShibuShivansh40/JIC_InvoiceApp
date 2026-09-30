export const print = async ({ filePath }) => {
  if (!filePath) return;

  if (filePath.startsWith('data:application/pdf;base64,')) {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = filePath;
    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }, 500);
    };
  } else {
    window.print();
  }
};

export default { print };
