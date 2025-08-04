// src/pages/ScanQR.jsx
import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import './ScanQR.css';

function ScanQR() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('qr-reader', {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(
      (decodedText) => {
        console.log('✅ QR Code Scanned:', decodedText);
        window.location.href = decodedText; // Navigate to product details
      },
      () => {
        // console.warn('QR Scan Error:', error);
      }
    );

    return () => {
      // Cleanup: remove scanner div content to avoid duplication
      const qrElement = document.getElementById('qr-reader');
if (qrElement) {
  qrElement.innerHTML = '';
}

    };
  }, []);

  return (
    <div className="scan-container">
      <h2>📷 Scan Product QR Code</h2>
      <div id="qr-reader"></div>
    </div>
  );
}

export default ScanQR;
