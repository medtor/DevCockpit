import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Globe,
  Wifi,
  User,
  Mail,
  MessageSquare,
  FileText,
  RotateCcw,
  Download,
  Copy,
  Code2,
  Check,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Card } from '../../components/ui/Card';
import { getPlatformAdapters } from '../../core/adapters';
import { useToastStore } from '../../store/useToastStore';

type QrPayloadType = 'url' | 'wifi' | 'vcard' | 'email' | 'sms' | 'text';

const DEFAULT_STYLING = {
  fgColor: '#0f172a',
  bgColor: '#ffffff',
  dimension: 320,
  errorCorrection: 'M' as 'L' | 'M' | 'Q' | 'H',
  quietZone: 2,
};

export const QrGeneratorTool: React.FC = () => {
  const { showToast } = useToastStore();

  // Payload Type
  const [payloadType, setPayloadType] = useState<QrPayloadType>('url');

  // Input states
  // 1. URL
  const [url, setUrl] = useState('https://ai.studio');

  // 2. Wi-Fi
  const [wifiSsid, setWifiSsid] = useState('MyOffice_5G');
  const [wifiPassword, setWifiPassword] = useState('SuperSecretKey123');
  const [wifiEncryption, setWifiEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [wifiHidden, setWifiHidden] = useState(false);
  const [showWifiPassword, setShowWifiPassword] = useState(false);

  // 3. vCard Contact
  const [vcardFirstName, setVcardFirstName] = useState('Alex');
  const [vcardLastName, setVcardLastName] = useState('Dev');
  const [vcardPhone, setVcardPhone] = useState('+1 (555) 019-2834');
  const [vcardEmail, setVcardEmail] = useState('alex.dev@example.com');
  const [vcardOrg, setVcardOrg] = useState('AI Studio Lab');
  const [vcardTitle, setVcardTitle] = useState('Principal Software Engineer');
  const [vcardUrl, setVcardUrl] = useState('https://github.com/developer');

  // 4. Email
  const [emailTo, setEmailTo] = useState('contact@developer.local');
  const [emailSubject, setEmailSubject] = useState('Inquiry from DevDesk QR Code');
  const [emailBody, setEmailBody] = useState('Hello, I am contacting you regarding your project.');

  // 5. SMS
  const [smsPhone, setSmsPhone] = useState('+1 (555) 019-2834');
  const [smsMessage, setSmsMessage] = useState('Hello from DevDesk QR Code!');

  // 6. Plain text
  const [plainText, setPlainText] = useState('Hello world from DevDesk offline desktop tools!');

  // Styling parameters
  const [fgColor, setFgColor] = useState(DEFAULT_STYLING.fgColor);
  const [bgColor, setBgColor] = useState(DEFAULT_STYLING.bgColor);
  const [dimension, setDimension] = useState(DEFAULT_STYLING.dimension);
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>(DEFAULT_STYLING.errorCorrection);
  const [quietZone, setQuietZone] = useState(DEFAULT_STYLING.quietZone);

  // Output states
  const [svgString, setSvgString] = useState<string>('');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copiedType, setCopiedType] = useState<'dataUrl' | 'svgXml' | 'payload' | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Compute final payload string based on active type
  const computedPayload = useMemo(() => {
    switch (payloadType) {
      case 'url':
        return url.trim() || 'https://';
      case 'wifi': {
        const enc = wifiEncryption === 'nopass' ? 'nopass' : wifiEncryption;
        const pass = wifiEncryption === 'nopass' ? '' : wifiPassword;
        return `WIFI:T:${enc};S:${wifiSsid};P:${pass};H:${wifiHidden ? 'true' : 'false'};;`;
      }
      case 'vcard': {
        const fn = `${vcardFirstName} ${vcardLastName}`.trim();
        return [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `N:${vcardLastName};${vcardFirstName};;;`,
          `FN:${fn || 'Contact'}`,
          vcardOrg ? `ORG:${vcardOrg}` : '',
          vcardTitle ? `TITLE:${vcardTitle}` : '',
          vcardPhone ? `TEL;TYPE=CELL:${vcardPhone}` : '',
          vcardEmail ? `EMAIL;TYPE=INTERNET:${vcardEmail}` : '',
          vcardUrl ? `URL:${vcardUrl}` : '',
          'END:VCARD',
        ]
          .filter(Boolean)
          .join('\n');
      }
      case 'email': {
        const params = new URLSearchParams();
        if (emailSubject) params.set('subject', emailSubject);
        if (emailBody) params.set('body', emailBody);
        const query = params.toString();
        return `mailto:${emailTo}${query ? `?${query}` : ''}`;
      }
      case 'sms':
        return `smsto:${smsPhone}:${smsMessage}`;
      case 'text':
      default:
        return plainText || ' ';
    }
  }, [
    payloadType,
    url,
    wifiSsid,
    wifiPassword,
    wifiEncryption,
    wifiHidden,
    vcardFirstName,
    vcardLastName,
    vcardPhone,
    vcardEmail,
    vcardOrg,
    vcardTitle,
    vcardUrl,
    emailTo,
    emailSubject,
    emailBody,
    smsPhone,
    smsMessage,
    plainText,
  ]);

  // Generate QR Code on changes
  useEffect(() => {
    let isCancelled = false;

    const generate = async () => {
      if (!computedPayload) {
        setSvgString('');
        setDataUrl('');
        setGenerationError(null);
        return;
      }

      try {
        const qrOptions = {
          margin: quietZone,
          errorCorrectionLevel: errorCorrection,
          color: {
            dark: fgColor,
            light: bgColor,
          },
          width: dimension,
        };

        const [svg, pngUrl] = await Promise.all([
          QRCode.toString(computedPayload, { ...qrOptions, type: 'svg' }),
          QRCode.toDataURL(computedPayload, qrOptions),
        ]);

        if (!isCancelled) {
          setSvgString(svg);
          setDataUrl(pngUrl);
          setGenerationError(null);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setGenerationError(err?.message || 'Failed to generate QR Code');
        }
      }
    };

    generate();

    return () => {
      isCancelled = true;
    };
  }, [computedPayload, fgColor, bgColor, dimension, errorCorrection, quietZone]);

  const handleResetStyling = () => {
    setFgColor(DEFAULT_STYLING.fgColor);
    setBgColor(DEFAULT_STYLING.bgColor);
    setDimension(DEFAULT_STYLING.dimension);
    setErrorCorrection(DEFAULT_STYLING.errorCorrection);
    setQuietZone(DEFAULT_STYLING.quietZone);
    showToast('info', 'QR styling reset to defaults');
  };

  const handleDownloadPNG = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `qrcode-${payloadType}-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    showToast('success', 'PNG QR Code downloaded');
  };

  const handleDownloadSVG = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `qrcode-${payloadType}-${Date.now()}.svg`;
    link.href = blobUrl;
    link.click();
    URL.revokeObjectURL(blobUrl);
    showToast('success', 'Vector SVG QR Code downloaded');
  };

  const handleCopyDataUrl = async () => {
    if (!dataUrl) return;
    await getPlatformAdapters().clipboard.writeText(dataUrl);
    setCopiedType('dataUrl');
    showToast('success', 'Data URL copied to clipboard');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopySvgXml = async () => {
    if (!svgString) return;
    await getPlatformAdapters().clipboard.writeText(svgString);
    setCopiedType('svgXml');
    showToast('success', 'SVG XML copied to clipboard');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyPayload = async () => {
    if (!computedPayload) return;
    await getPlatformAdapters().clipboard.writeText(computedPayload);
    setCopiedType('payload');
    showToast('success', 'Payload copied to clipboard');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const tabs: { id: QrPayloadType; label: string; icon: React.ReactNode }[] = [
    { id: 'url', label: 'Website URL', icon: <Globe className="h-4 w-4" /> },
    { id: 'wifi', label: 'Wi-Fi Network', icon: <Wifi className="h-4 w-4" /> },
    { id: 'vcard', label: 'Contact (vCard)', icon: <User className="h-4 w-4" /> },
    { id: 'email', label: 'Email', icon: <Mail className="h-4 w-4" /> },
    { id: 'sms', label: 'SMS Text', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'text', label: 'Plain Text', icon: <FileText className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6 text-start">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
            <QrCode className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              QR Generator
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Create customizable vector SVG and high-resolution PNG QR codes for websites, Wi-Fi, vCards, or messages.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleResetStyling}
          className="self-start sm:self-auto text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5 -ms-0.5 me-1.5" />
          Reset Styling
        </Button>
      </div>

      {/* Payload Type Selector Pills */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-x-auto scrollbar-thin">
        {tabs.map((tab) => {
          const isActive = payloadType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPayloadType(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              <span className={isActive ? 'text-emerald-500' : 'text-zinc-400'}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs & Styling */}
        <div className="lg:col-span-7 space-y-6">
          {/* Dynamic Payload Form */}
          <Card className="p-4 sm:p-5 space-y-4">
            {payloadType === 'url' && (
              <div className="space-y-3">
                <Input
                  label="Target Website URL"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://ai.studio"
                  className="font-mono text-xs"
                />
                <p className="text-[11px] text-zinc-500">
                  Include protocol like <code className="text-zinc-700 dark:text-zinc-300">https://</code> for automatic web browser opening when scanned.
                </p>
              </div>
            )}

            {payloadType === 'wifi' && (
              <div className="space-y-3">
                <Input
                  label="Network Name (SSID)"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  placeholder="e.g. Office_5G"
                />

                <div className="relative">
                  <Input
                    label="Password"
                    type={showWifiPassword ? 'text' : 'password'}
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                    placeholder="e.g. SecretPassword123"
                    disabled={wifiEncryption === 'nopass'}
                  />
                  {wifiEncryption !== 'nopass' && (
                    <button
                      type="button"
                      onClick={() => setShowWifiPassword(!showWifiPassword)}
                      className="absolute end-3 top-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showWifiPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <Select
                    label="Encryption / Security"
                    value={wifiEncryption}
                    onChange={(e) => setWifiEncryption(e.target.value as any)}
                    options={[
                      { value: 'WPA', label: 'WPA / WPA2 / WPA3' },
                      { value: 'WEP', label: 'WEP (Legacy)' },
                      { value: 'nopass', label: 'Open / None' },
                    ]}
                  />

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="hidden-wifi-checkbox"
                      checked={wifiHidden}
                      onChange={(e) => setWifiHidden(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500"
                    />
                    <label htmlFor="hidden-wifi-checkbox" className="text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      Hidden Network (SSID not broadcasted)
                    </label>
                  </div>
                </div>
              </div>
            )}

            {payloadType === 'vcard' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="First Name"
                    value={vcardFirstName}
                    onChange={(e) => setVcardFirstName(e.target.value)}
                    placeholder="Alex"
                  />
                  <Input
                    label="Last Name"
                    value={vcardLastName}
                    onChange={(e) => setVcardLastName(e.target.value)}
                    placeholder="Dev"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Phone Number"
                    value={vcardPhone}
                    onChange={(e) => setVcardPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    value={vcardEmail}
                    onChange={(e) => setVcardEmail(e.target.value)}
                    placeholder="alex.dev@example.com"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Organization / Company"
                    value={vcardOrg}
                    onChange={(e) => setVcardOrg(e.target.value)}
                    placeholder="Company name"
                  />
                  <Input
                    label="Job Title"
                    value={vcardTitle}
                    onChange={(e) => setVcardTitle(e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>

                <Input
                  label="Website / Portfolio URL"
                  value={vcardUrl}
                  onChange={(e) => setVcardUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            )}

            {payloadType === 'email' && (
              <div className="space-y-3">
                <Input
                  label="Recipient Email (To)"
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="contact@example.com"
                />
                <Input
                  label="Subject Line"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Subject..."
                />
                <Textarea
                  label="Email Body Message"
                  rows={4}
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Write your email body..."
                />
              </div>
            )}

            {payloadType === 'sms' && (
              <div className="space-y-3">
                <Input
                  label="Recipient Phone Number"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                />
                <Textarea
                  label="SMS Message"
                  rows={4}
                  value={smsMessage}
                  onChange={(e) => setSmsMessage(e.target.value)}
                  placeholder="Write SMS message..."
                />
              </div>
            )}

            {payloadType === 'text' && (
              <div className="space-y-3">
                <Textarea
                  label="Plain Text / Raw Content"
                  rows={6}
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  placeholder="Enter raw text, JSON payload, or instructions..."
                />
              </div>
            )}
          </Card>

          {/* Color & Styling Parameters */}
          <Card className="p-4 sm:p-5 space-y-4">
            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Color & Styling Parameters
              </span>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Foreground Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor.startsWith('#') ? fgColor : '#0f172a'}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-9 w-9 rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer p-0.5 bg-transparent"
                  />
                  <Input
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    placeholder="#0f172a"
                    className="font-mono text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor.startsWith('#') ? bgColor : '#ffffff'}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-9 w-9 rounded-lg border border-zinc-200 dark:border-zinc-800 cursor-pointer p-0.5 bg-transparent"
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    placeholder="#ffffff"
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Dimension, Error Correction, Margin */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <Select
                label="Canvas Dimension"
                value={String(dimension)}
                onChange={(e) => setDimension(Number(e.target.value))}
                options={[
                  { value: '240', label: '240px (Compact)' },
                  { value: '320', label: '320px (Standard)' },
                  { value: '480', label: '480px (Large)' },
                  { value: '640', label: '640px (High-Res)' },
                ]}
              />

              <Select
                label="Error Correction"
                value={errorCorrection}
                onChange={(e) => setErrorCorrection(e.target.value as any)}
                options={[
                  { value: 'L', label: 'Low (7%)' },
                  { value: 'M', label: 'Medium (15%)' },
                  { value: 'Q', label: 'Quartile (25%)' },
                  { value: 'H', label: 'High (30%)' },
                ]}
              />

              <Select
                label="Quiet Zone Margin"
                value={String(quietZone)}
                onChange={(e) => setQuietZone(Number(e.target.value))}
                options={[
                  { value: '0', label: 'None (0px)' },
                  { value: '2', label: 'Small (2px)' },
                  { value: '4', label: 'Standard (4px)' },
                  { value: '8', label: 'Wide (8px)' },
                ]}
              />
            </div>
          </Card>
        </div>

        {/* Right Column: Live Vector Canvas Preview */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 flex flex-col items-center justify-center text-center space-y-4">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Live Vector Canvas Preview
            </span>

            {/* QR Code Container */}
            <div
              className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-center transition-all"
              style={{ backgroundColor: bgColor }}
            >
              {svgString ? (
                <div
                  className="w-full max-w-[280px] aspect-square flex items-center justify-center [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: svgString }}
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center text-zinc-400 text-xs">
                  Generating QR Code...
                </div>
              )}
            </div>

            {generationError && (
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs w-full text-start">
                {generationError}
              </div>
            )}

            {/* Payload preview string */}
            <div className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2 text-start">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Payload:
                </span>
                <span className="text-xs text-zinc-700 dark:text-zinc-300 font-mono truncate block">
                  {computedPayload}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyPayload}
                className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                title="Copy Payload"
              >
                {copiedType === 'payload' ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500 animate-in zoom-in-50 duration-200" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>

            {/* Action Buttons: 2x2 Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <Button
                variant="primary"
                onClick={handleDownloadPNG}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs justify-center"
              >
                <Download className="h-4 w-4 -ms-0.5 me-1.5" />
                Download PNG
              </Button>

              <Button
                variant="primary"
                onClick={handleDownloadSVG}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs justify-center"
              >
                <Download className="h-4 w-4 -ms-0.5 me-1.5" />
                Download SVG
              </Button>

              <Button
                variant="outline"
                onClick={handleCopyDataUrl}
                className={`justify-center text-xs ${copiedType === 'dataUrl' ? 'border-emerald-500 text-emerald-500 font-semibold' : ''}`}
              >
                {copiedType === 'dataUrl' ? (
                  <>
                    <Check className="h-3.5 w-3.5 -ms-0.5 me-1 text-emerald-500 animate-in zoom-in-50 duration-200" />
                    Copied URL!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 -ms-0.5 me-1" />
                    Copy Data URL
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={handleCopySvgXml}
                className={`justify-center text-xs ${copiedType === 'svgXml' ? 'border-emerald-500 text-emerald-500 font-semibold' : ''}`}
              >
                {copiedType === 'svgXml' ? (
                  <>
                    <Check className="h-3.5 w-3.5 -ms-0.5 me-1 text-emerald-500 animate-in zoom-in-50 duration-200" />
                    Copied SVG XML!
                  </>
                ) : (
                  <>
                    <Code2 className="h-3.5 w-3.5 -ms-0.5 me-1" />
                    Copy SVG XML
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
