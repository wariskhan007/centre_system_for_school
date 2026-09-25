/**
 * Robust cross-browser, iframe-resilient document printing & export utility
 */

export function printDocument(elementId: string, docTitle: string = 'Document'): void {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  // 1. Tag the document and element with active print classes
  document.body.classList.add('is-printing-active');
  element.classList.add('print-target-element');

  // Remove previous print clones if any
  const existingClone = document.getElementById('direct-print-standalone-container');
  if (existingClone) {
    existingClone.remove();
  }

  // Create a dedicated standalone container attached directly to <body> for absolute print isolation
  const printContainer = document.createElement('div');
  printContainer.id = 'direct-print-standalone-container';
  printContainer.innerHTML = element.outerHTML;
  document.body.appendChild(printContainer);

  const cleanup = () => {
    document.body.classList.remove('is-printing-active');
    element.classList.remove('print-target-element');
    printContainer.remove();
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);

  // Trigger browser print
  try {
    window.focus();
    window.print();
  } catch (err) {
    console.warn('Native window.print failed, attempting blob fallback:', err);
    openPrintInNewTab(elementId, docTitle);
  }

  // Safety fallback cleanup in case afterprint does not fire
  setTimeout(cleanup, 2500);
}

/**
 * Opens a clean, dedicated print view in a new tab/window using an HTML blob.
 * This bypasses all iframe sandbox restrictions (e.g. within AI Studio dev environment).
 */
export function openPrintInNewTab(elementId: string, docTitle: string = 'Document'): void {
  const element = document.getElementById(elementId);
  if (!element) {
    window.print();
    return;
  }

  // Collect all existing stylesheets from parent page
  const styleSheets = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((s) => s.outerHTML)
    .join('\n');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${docTitle}</title>
  ${styleSheets}
  <style>
    @page {
      size: auto;
      margin: 8mm;
    }
    body {
      background: #ffffff !important;
      color: #0f172a !important;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 16px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .no-print {
      display: none !important;
    }
    .print-actions-bar {
      position: sticky;
      top: 0;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 20px;
      margin: -16px -16px 20px -16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1000;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      font-family: ui-sans-serif, system-ui, sans-serif;
    }
    .print-actions-bar button {
      background: #047857;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }
    .print-actions-bar button:hover {
      background: #065f46;
    }
    @media print {
      .print-actions-bar {
        display: none !important;
      }
      body {
        padding: 0 !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-actions-bar no-print">
    <div>
      <strong style="font-size: 14px;">${docTitle}</strong>
      <span style="font-size: 11px; opacity: 0.8; margin-left: 10px;">Ready for printing or PDF export</span>
    </div>
    <div style="display: flex; gap: 8px;">
      <button onclick="window.print()">Print / Save as PDF</button>
      <button onclick="window.close()" style="background: #334155;">Close Tab</button>
    </div>
  </div>
  <div class="print-document-wrapper" style="display: flex; justify-content: center; align-items: center;">
    ${element.outerHTML}
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.focus();
        window.print();
      }, 350);
    };
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const printWindow = window.open(blobUrl, '_blank');

  if (!printWindow) {
    // If popup blocker intervened, fallback to direct download or window.print
    downloadPrintableAsHtml(elementId, docTitle);
  }
}

/**
 * Downloads the printable element as a complete, self-contained standalone HTML file
 */
export function downloadPrintableAsHtml(
  elementId: string,
  docTitle: string = 'Document',
  filename?: string
): void {
  const element = document.getElementById(elementId);
  if (!element) return;

  const styleSheets = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((s) => s.outerHTML)
    .join('\n');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${docTitle}</title>
  ${styleSheets}
  <style>
    body {
      background: #ffffff;
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    @media print {
      body {
        padding: 0;
      }
    }
  </style>
</head>
<body>
  ${element.outerHTML}
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename || docTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
