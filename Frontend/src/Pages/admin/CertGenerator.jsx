import React, { useState, useRef, useEffect } from 'react';
import Papa from 'papaparse';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import QRCode from 'qrcode';

export default function CertGenerator() {
  const [templateImage, setTemplateImage] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [templateType, setTemplateType] = useState('participation');
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [inputType, setInputType] = useState('csv'); // 'csv' or 'manual'
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualId, setManualId] = useState('');
  
  const [textPosition, setTextPosition] = useState({ x: 400, y: 300 });
  const [qrPosition, setQrPosition] = useState({ x: 50, y: 50 });
  const [credPosition, setCredPosition] = useState({ x: 50, y: 150 });
  
  const [fontFamily, setFontFamily] = useState('Inter');
  const [fontSize, setFontSize] = useState(48);
  const [fontWeight, setFontWeight] = useState('normal');
  const [fontStyle, setFontStyle] = useState('normal');
  const [fontColor, setFontColor] = useState('#000000');
  
  const [qrSize, setQrSize] = useState(100);
  const [credSize, setCredSize] = useState(14);
  const [qrPreviewUrl, setQrPreviewUrl] = useState('');
  const [showCredential, setShowCredential] = useState(true);
  const [placeMode, setPlaceMode] = useState('text');

  const canvasRef = useRef(null);

  const centerElement = (type, axis = 'x') => {
    if (!templateImage) return;
    if (axis === 'x') {
      const centerX = templateImage.width / 2;
      if (type === 'text') setTextPosition(prev => ({ ...prev, x: centerX }));
      if (type === 'qr') setQrPosition(prev => ({ ...prev, x: centerX - qrSize / 2 }));
      if (type === 'cred') setCredPosition(prev => ({ ...prev, x: centerX }));
    } else {
      const centerY = templateImage.height / 2;
      if (type === 'text') setTextPosition(prev => ({ ...prev, y: centerY }));
      if (type === 'qr') setQrPosition(prev => ({ ...prev, y: centerY - qrSize / 2 }));
      if (type === 'cred') setCredPosition(prev => ({ ...prev, y: centerY }));
    }
  };

  // Handle template upload
  const handleTemplateUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setTemplateImage(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Live QR Code Generation for preview
  useEffect(() => {
    const generatePreviewQR = async () => {
      try {
        const url = await QRCode.toDataURL('SAMPLE_VERIFICATION_URL', { width: qrSize, margin: 1 });
        setQrPreviewUrl(url);
      } catch (err) {
        console.error("QR Generation Error", err);
      }
    };
    generatePreviewQR();
  }, [qrSize]);

  // Handle CSV upload
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results.data);
        },
      });
    }
  };

  // Draw canvas for preview
  useEffect(() => {
    if (templateImage && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = templateImage.width;
      canvas.height = templateImage.height;

      ctx.drawImage(templateImage, 0, 0);

      // Draw sample text
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}"`;
      ctx.fillStyle = fontColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const displayName = (inputType === 'manual' && manualName) ? manualName : 'Sample Name';
      ctx.fillText(displayName, textPosition.x, textPosition.y);

      // Draw QR Code
      if (qrPreviewUrl) {
        const qrImg = new Image();
        qrImg.onload = () => {
          ctx.drawImage(qrImg, qrPosition.x, qrPosition.y, qrSize, qrSize);
        };
        qrImg.src = qrPreviewUrl;
      } else {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(qrPosition.x, qrPosition.y, qrSize, qrSize);
      }

      // Draw Credential ID placeholder
      if (showCredential) {
        ctx.fillStyle = fontColor;
        ctx.font = `${credSize}px monospace`;
        ctx.textAlign = 'left';
        ctx.fillText('Cred: SAMPLE-ID-1234', credPosition.x, credPosition.y);
      }
    }
  }, [templateImage, textPosition, qrPosition, credPosition, fontFamily, fontSize, fontWeight, fontStyle, fontColor, qrSize, credSize, qrPreviewUrl, inputType, manualName, showCredential]);

  // Generate for all users
  const handleGenerate = async () => {
    const hasNoData = (inputType === 'csv' && csvData.length === 0) || (inputType === 'manual' && (!manualName || !manualEmail));
    
    if (!templateImage || hasNoData) {
      alert("Please upload a template and provide recipient data (CSV or Manual Entry).");
      return;
    }

    setIsGenerating(true);
    let dataToProcess = csvData;

    if (inputType === 'manual') {
      if (!manualName || !manualEmail) {
        alert("Please provide both name and email for manual entry.");
        setIsGenerating(false);
        return;
      }
      dataToProcess = [{ id: manualId, name: manualName, email: manualEmail }];
    }

    if (dataToProcess.length === 0) {
      alert("No data found. Please upload a CSV or fill manual fields.");
      setIsGenerating(false);
      return;
    }

    const generatedCerts = [];
    const zip = new JSZip();

    try {
      for (const row of dataToProcess) {
        const { id, name, email } = row;
        if (!name || !email) continue;

        const credentialId = id || crypto.randomUUID();

        // Create an offscreen canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = templateImage.width;
        canvas.height = templateImage.height;

        // Draw Template
        ctx.drawImage(templateImage, 0, 0);

        // Draw Text
        ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}"`;
        ctx.fillStyle = fontColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name, textPosition.x, textPosition.y);

        // Draw Credential ID
        if (showCredential) {
          ctx.fillStyle = fontColor;
          ctx.font = `${credSize}px monospace`;
          ctx.textAlign = 'left';
          ctx.fillText(`ID: ${credentialId}`, credPosition.x, credPosition.y);
        }

        // Generate QR Code

        const qrDataUrl = await QRCode.toDataURL(
          `${window.location.origin}/verify/${credentialId}`,
          { width: qrSize, margin: 1 }
        );

        // Draw QR Code
        const qrImage = new Image();
        await new Promise((resolve) => {
          qrImage.onload = resolve;
          qrImage.src = qrDataUrl;
        });
        ctx.drawImage(qrImage, qrPosition.x, qrPosition.y, qrSize, qrSize);

        // Get Base64
        const dataUrl = canvas.toDataURL('image/png');
        
        // Add to Zip
        const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
        zip.file(`${name.replace(/\s+/g, '_')}_Certificate.png`, base64Data, { base64: true });

        // Add to batch for backend
        generatedCerts.push({
          credentialId,
          issuedToName: name,
          issuedToEmail: email,
          imageBase64: dataUrl,
        });
      }

      // Download ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'Certificates.zip');

      // Upload to Backend (Firebase + Email)
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/api/certificate/upload-generated`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          certificates: generatedCerts,
          templateType,
          templateTitle,
          templateDescription,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to upload to server');
      }

      alert("Generation and Email Sending Completed Successfully!");
    } catch (error) {
      console.error(error);
      alert("Error generating certificates: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCanvasClick = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (placeMode === 'text') {
      setTextPosition({ x, y });
    } else if (placeMode === 'qr') {
      setQrPosition({ x, y });
    } else if (placeMode === 'cred') {
      setCredPosition({ x, y });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0d16] text-slate-200 p-8 font-body">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-headline font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f183ff] to-[#ff6c95] mb-8">
          Certificate Generator Canvas
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Panel */}
          <div className="bg-[#1a1625] p-6 rounded-2xl border border-white/10 space-y-6">
            
            <div>
              <label className="block text-sm font-label text-slate-400 mb-2">1. Upload Base Template (Image)</label>
              <input type="file" accept="image/*" onChange={handleTemplateUpload} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-[#f183ff] hover:file:bg-primary/30"/>
            </div>

            <div className="bg-[#0f0d16] p-1 rounded-xl flex mb-4">
              <button 
                onClick={() => setInputType('csv')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${inputType === 'csv' ? 'bg-[#f183ff] text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                CSV Upload
              </button>
              <button 
                onClick={() => setInputType('manual')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${inputType === 'manual' ? 'bg-[#f183ff] text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Manual Entry
              </button>
            </div>

            {inputType === 'csv' ? (
              <div>
                <label className="block text-sm font-label text-slate-400 mb-2">2. Upload CSV (id, name, email)</label>
                <input type="file" accept=".csv" onChange={handleCsvUpload} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-[#f183ff] hover:file:bg-primary/30"/>
                {csvData.length > 0 && <p className="text-xs text-green-400 mt-2">Loaded {csvData.length} records</p>}
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-sm font-label text-slate-400 mb-1">2. Recipient Details</label>
                <input type="text" placeholder="Full Name" value={manualName} onChange={e => setManualName(e.target.value)} className="w-full bg-[#0f0d16] border border-white/10 rounded-xl p-3 text-sm focus:border-[#f183ff] outline-none" />
                <input type="email" placeholder="Email Address" value={manualEmail} onChange={e => setManualEmail(e.target.value)} className="w-full bg-[#0f0d16] border border-white/10 rounded-xl p-3 text-sm focus:border-[#f183ff] outline-none" />
                <input type="text" placeholder="Custom ID (Optional)" value={manualId} onChange={e => setManualId(e.target.value)} className="w-full bg-[#0f0d16] border border-white/10 rounded-xl p-3 text-sm focus:border-[#f183ff] outline-none" />
              </div>
            )}

            <div className="space-y-4">
              <label className="block text-sm font-label text-slate-400">3. Certificate Details</label>
              <input type="text" placeholder="Title (e.g. Hackathon Winner)" value={templateTitle} onChange={e => setTemplateTitle(e.target.value)} className="w-full bg-[#0f0d16] border border-white/10 rounded-xl p-3 text-sm focus:border-[#f183ff] outline-none" />
              <input type="text" placeholder="Description" value={templateDescription} onChange={e => setTemplateDescription(e.target.value)} className="w-full bg-[#0f0d16] border border-white/10 rounded-xl p-3 text-sm focus:border-[#f183ff] outline-none" />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-label text-slate-400">4. Font Styling</label>
              <div className="grid grid-cols-2 gap-4">
                <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="w-full bg-[#0f0d16] border border-white/10 rounded-xl p-3 text-sm focus:border-[#f183ff] outline-none">
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Courier New">Courier New</option>
                </select>
                <input type="number" placeholder="Size" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full bg-[#0f0d16] border border-white/10 rounded-xl p-3 text-sm focus:border-[#f183ff] outline-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setFontWeight(prev => prev === 'bold' ? 'normal' : 'bold')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${fontWeight === 'bold' ? 'bg-[#f183ff] text-white' : 'bg-[#0f0d16] text-slate-400'}`}>Bold</button>
                <button onClick={() => setFontStyle(prev => prev === 'italic' ? 'normal' : 'italic')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${fontStyle === 'italic' ? 'bg-[#f183ff] text-white' : 'bg-[#0f0d16] text-slate-400'}`}>Italic</button>
                <input type="color" value={fontColor} onChange={e => setFontColor(e.target.value)} className="w-12 h-10 bg-transparent rounded cursor-pointer border-none" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-label text-slate-400">5. Placement & Sizing</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setPlaceMode('text')} className={`flex items-center gap-2 text-xs p-2 rounded-lg border transition-all ${placeMode === 'text' ? 'border-[#f183ff] bg-[#f183ff]/10 text-[#f183ff]' : 'border-white/5 bg-[#0f0d16]'}`}>
                   Name
                </button>
                <button onClick={() => setPlaceMode('qr')} className={`flex items-center gap-2 text-xs p-2 rounded-lg border transition-all ${placeMode === 'qr' ? 'border-[#f183ff] bg-[#f183ff]/10 text-[#f183ff]' : 'border-white/5 bg-[#0f0d16]'}`}>
                   QR Code
                </button>
                <button onClick={() => setPlaceMode('cred')} className={`flex items-center gap-2 text-xs p-2 rounded-lg border transition-all ${placeMode === 'cred' ? 'border-[#f183ff] bg-[#f183ff]/10 text-[#f183ff]' : 'border-white/5 bg-[#0f0d16]'}`}>
                   Cred ID
                </button>
                <button onClick={() => setShowCredential(!showCredential)} className={`flex items-center gap-2 text-xs p-2 rounded-lg border transition-all ${showCredential ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-white/5 bg-[#0f0d16]'}`}>
                   {showCredential ? 'Show ID' : 'Hide ID'}
                </button>
              </div>

              {/* Dynamic Sizing Control */}
              <div className="bg-[#0f0d16] p-3 rounded-xl border border-white/5 space-y-3">
                {placeMode === 'qr' && (
                  <div>
                    <div className="flex justify-between mb-1"><span className="text-[10px] text-slate-400">QR Size</span><span className="text-[10px] font-bold">{qrSize}px</span></div>
                    <input type="range" min="50" max="400" value={qrSize} onChange={e => setQrSize(Number(e.target.value))} className="w-full h-1 accent-[#f183ff]" />
                  </div>
                )}
                {placeMode === 'cred' && (
                  <div>
                    <div className="flex justify-between mb-1"><span className="text-[10px] text-slate-400">ID Size</span><span className="text-[10px] font-bold">{credSize}px</span></div>
                    <input type="range" min="8" max="48" value={credSize} onChange={e => setCredSize(Number(e.target.value))} className="w-full h-1 accent-[#f183ff]" />
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => centerElement(placeMode, 'x')} className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold transition-colors">
                    Center X
                  </button>
                  <button onClick={() => centerElement(placeMode, 'y')} className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[10px] font-bold transition-colors">
                    Center Y
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !templateImage || (inputType === 'csv' && csvData.length === 0) || (inputType === 'manual' && !manualName)}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#f183ff] to-[#ff6c95] text-white font-bold disabled:opacity-50 hover:scale-105 transition-transform"
            >
              {isGenerating ? 'Generating...' : 'Generate & Send Emails'}
            </button>
          </div>

          {/* Canvas Area */}
          <div className="lg:col-span-2 bg-[#1a1625] p-6 rounded-2xl border border-white/10 flex flex-col items-center justify-center overflow-auto">
            {!templateImage ? (
              <div className="text-slate-500 text-center">
                <span className="material-symbols-outlined text-4xl mb-2 block">image</span>
                <p>Upload a template to start</p>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="max-w-full h-auto cursor-crosshair border border-white/20 rounded shadow-2xl"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
