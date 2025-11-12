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

        // Validate URL format: must match /product/:id (accept numeric or ObjectId-like strings)
        const match = decodedText.match(/\/product\/([A-Za-z0-9]+)$/);
        if (match) {
          const id = match[1];
          window.location.href = `/product/${id}`;
        } else {
          alert("❌ Invalid QR code format.");
        }
      },
      (error) => {
        console.warn('QR Scan Error:', error);
      }
    );

    return () => {
      const qrElement = document.getElementById('qr-reader');
      if (qrElement) qrElement.innerHTML = '';
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
