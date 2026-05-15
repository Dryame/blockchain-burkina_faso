import { jsPDF } from 'jspdf';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';

export const downloadIPFSFile = async (cid: string, fileName: string) => {
  try {
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
    const response = await fetch(url);
    const blob = await response.blob();
    saveAs(blob, fileName);
  } catch (err) {
    console.error("IPFS download failed", err);
    window.open(`https://gateway.pinata.cloud/ipfs/${cid}`, '_blank');
  }
};

export const downloadQRCode = async (id: string, size = 400) => {
  const url = `${window.location.origin}/verifier?id=${id}`;
  const qrDataUrl = await QRCode.toDataURL(url, { 
    width: size, 
    margin: 2,
    color: {
      dark: '#1e293b',
      light: '#ffffff'
    }
  });
  saveAs(qrDataUrl, `DiploChain_QR_${id}.png`);
};

export const generateAttestationPDF = async (diploma: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = '#CE1126'; // Burkina Red
  const secondaryColor = '#009E49'; // Burkina Green
  const accentColor = '#FCD116'; // Burkina Yellow

  // Draw Header Border
  doc.setDrawColor(primaryColor);
  doc.setLineWidth(1);
  doc.line(10, 10, 200, 10);
  doc.line(10, 10, 10, 287);
  doc.setDrawColor(secondaryColor);
  doc.line(200, 10, 200, 287);
  doc.line(10, 287, 200, 287);

  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(primaryColor);
  doc.text('DIPLOCHAIN', 105, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor('#64748b');
  doc.text('ATTESTATION DE CERTIFICATION BLOCKCHAIN', 105, 38, { align: 'center' });

  // Main Content Card
  doc.setFillColor('#f8fafc');
  doc.rect(20, 50, 170, 160, 'F');
  
  doc.setTextColor('#1e293b');
  doc.setFontSize(16);
  doc.text('VALIDE', 105, 65, { align: 'center' });
  doc.setDrawColor(secondaryColor);
  doc.line(90, 68, 120, 68);

  // Diploma Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Titulatire :', 30, 85);
  doc.setFont('helvetica', 'normal');
  doc.text(diploma.fullName, 80, 85);

  doc.setFont('helvetica', 'bold');
  doc.text('Diplôme :', 30, 95);
  doc.setFont('helvetica', 'normal');
  doc.text(diploma.title, 80, 95);

  doc.setFont('helvetica', 'bold');
  doc.text('Mention :', 30, 105);
  doc.setFont('helvetica', 'normal');
  doc.text(diploma.mention, 80, 105);

  doc.setFont('helvetica', 'bold');
  doc.text('Année :', 30, 115);
  doc.setFont('helvetica', 'normal');
  doc.text(diploma.year.toString(), 80, 115);

  doc.setFont('helvetica', 'bold');
  doc.text('Établissement :', 30, 125);
  doc.setFont('helvetica', 'normal');
  doc.text(diploma.institutionName, 80, 125);

  doc.setFont('helvetica', 'bold');
  doc.text('ID Unique :', 30, 135);
  doc.setFont('helvetica', 'normal');
  doc.text(diploma.id || diploma.diplomaId, 80, 135);

  // Blockchain proof
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(secondaryColor);
  doc.text('PREUVE IMMUABLE BLOCKCHAIN', 30, 155);
  
  doc.setFont('helvetica', 'normal');
  doc.setTextColor('#64748b');
  doc.setFontSize(8);
  const hash = diploma.ipfsHash || 'N/A';
  doc.text(`Hash IPFS : ${hash}`, 30, 162);
  doc.text(`Timestamp : ${new Date().toLocaleString('fr-FR')}`, 30, 168);
  doc.text(`Réseau : Polygon Amoy Testnet`, 30, 174);

  // QR Code
  const qrUrl = `${window.location.origin}/verifier?id=${diploma.id || diploma.diplomaId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(qrUrl);
  doc.addImage(qrCodeDataUrl, 'PNG', 140, 155, 40, 40);
  
  doc.setFontSize(7);
  doc.text('Scanner pour vérifier', 160, 198, { align: 'center' });

  // Footer
  doc.setFontSize(9);
  doc.setTextColor('#94a3b8');
  doc.text('Ceci est un document officiel généré par DiploChain.', 105, 270, { align: 'center' });
  doc.text('Toute falsification est impossible grâce au registre décentralisé.', 105, 275, { align: 'center' });

  doc.save(`DiploChain_Attestation_${diploma.id || diploma.diplomaId}.pdf`);
};
