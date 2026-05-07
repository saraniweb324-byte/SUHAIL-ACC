import React, { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useReceiptNo } from '../hooks/useReceiptNo';
import { useForm } from '../hooks/useForm';
import { INCOME_CATEGORIES, DONATION_CATEGORIES } from '../constants/categories';
import { validators } from '../utils/validators';
import { newId } from '../utils/uuid';
import { todayISO, formatINR, formatDate } from '../utils/formatters';
import { amountToWords } from '../utils/amountToWords';
import { exportTablePDF } from '../utils/exportPDF';
import { exportToExcel } from '../utils/exportExcel';
import toast from 'react-hot-toast';

import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Receipt from '../components/documents/Receipt';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Income() {
  const { income, addIncome, deleteRecord, totalIncome } = useTransactions();
  const { incrementReceiptNo } = useReceiptNo();
  
  const [deleteId, setDeleteId] = useState(null);
  const [previewRecord, setPreviewRecord] = useState(null);
  const [whatsappPromptRecord, setWhatsappPromptRecord] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleWhatsAppShare = (record) => {
    if (!record || !record.contactNo) return;
    const cleanPhone = record.contactNo.replace(/\D/g, '');
    const message = `🕌 *MAKHDOOMIYYA ACADEMY*\n_Under Quadisiyya Islamic Complex, Kollam_\n━━━━━━━━━━━━━━━━━━━━\n\n🙏 *Assalamu Alaikum Wa Rahmatullahi Wa Barakatuh*\n\nWe gratefully acknowledge your generous contribution.\n\n📋 *RECEIPT DETAILS*\n▸ *Receipt No :* ${record.manualReceiptNo || record.digitalReceiptNo}\n▸ *Date       :* ${formatDate(record.date)}\n▸ *Name       :* ${record.payerName}\n▸ *Amount     :* ${formatINR(record.amount)}\n\n━━━━━━━━━━━━━━━━━━━━\n_May Allah accept your contribution and reward you abundantly._\n\n🤲 *Jazakallah Khair*\n_Makhdoomiyya Academy_`;
    const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const form = useForm({
    initialValues: {
      date: todayISO(),
      category: '',
      payerName: '',
      address: '',
      contactNo: '',
      manualReceiptNo: '',
      amount: '',
      amountInWords: '',
    },
    validate: validators.income,
    onSubmit: (values) => {
      const isDonation = DONATION_CATEGORIES.includes(values.category);
      const nextNo = incrementReceiptNo();
      
      const record = {
        ...values,
        id: newId(),
        type: 'income',
        donationType: isDonation ? 'Donation' : values.category,
        digitalReceiptNo: nextNo,
        amount: Number(values.amount),
        created_at: new Date().toISOString()
      };
      
      addIncome(record);
      form.resetForm();
      toast.success(`Income added — Receipt #${nextNo}`);
      setPreviewRecord(record);

      if (record.contactNo) {
        const cleanPhone = record.contactNo.replace(/\D/g, '');
        if (cleanPhone.length >= 10) {
          setWhatsappPromptRecord(record);
        }
      }
    }
  });

  const handleAmountChange = (e) => {
    const val = e.target.value;
    form.handleChange(e);
    if (!isNaN(val) && val !== '') {
      form.setValues(prev => ({ ...prev, amountInWords: amountToWords(Number(val)) }));
    } else {
      form.setValues(prev => ({ ...prev, amountInWords: '' }));
    }
  };

  const handleDownloadReceiptPDF = async (record) => {
    setTimeout(async () => {
      const el = document.getElementById('receipt-element');
      if (el) {
        toast.loading('Generating PDF...', { id: 'pdf' });
        try {
          const canvas = await html2canvas(el, { scale: 2 });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save(`receipt-${record.digitalReceiptNo}.pdf`);
          toast.success('Downloaded!', { id: 'pdf' });
        } catch (e) {
          toast.error('Failed to generate PDF', { id: 'pdf' });
        }
      }
    }, 100);
  };

  const handleShareJPG = (record) => {
    const el = document.getElementById('receipt-element');
    if (!el) return;

    toast.loading('Preparing image...', { id: 'share' });

    // Wait 300ms so React fully renders the latest DOM before capture
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(el, {
          scale: 3,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 0,
        });

        // Convert to JPG blob
        const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
        const res = await fetch(jpgDataUrl);
        const blob = await res.blob();
        const fileName = `receipt-${record.manualReceiptNo || record.digitalReceiptNo}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });

        // Try native share (mobile / supported browsers)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          toast.dismiss('share');
          await navigator.share({
            title: 'Makhdoomiyya Academy Receipt',
            text: `Receipt #${record.manualReceiptNo || record.digitalReceiptNo} for ${record.payerName}`,
            files: [file]
          });
        } else {
          // Fallback: direct download on desktop
          const link = document.createElement('a');
          link.href = jpgDataUrl;
          link.download = fileName;
          link.click();
          toast.success('Receipt saved as JPG!', { id: 'share' });
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to export receipt as image.', { id: 'share' });
      }
    }, 300);
  };

  const columns = [
    { key: 'date', label: 'Date', render: r => formatDate(r.date) },
    { key: 'digitalReceiptNo', label: 'Receipt No' },
    { key: 'category', label: 'Category' },
    { key: 'donationType', label: 'Donation Type' },
    { key: 'payerName', label: 'Payer Name' },
    { key: 'amount', label: 'Amount', render: r => <span className="font-semibold text-primary">{formatINR(r.amount)}</span> },
    { 
      key: 'actions', 
      label: 'Actions', 
      render: (r) => (
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setPreviewRecord(r)} className="px-2 py-1 text-xs">
            Receipt
          </Button>
          <Button variant="danger" onClick={() => setDeleteId(r.id)} className="px-2 py-1 text-xs">
            Delete
          </Button>
        </div>
      ) 
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text">Income (Varav)</h1>
        <p className="text-muted text-sm mt-1">Record and manage all incoming funds</p>
      </div>

      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-gray-50">
          <h2 className="text-base font-semibold text-text">Add New Income</h2>
        </div>
        <form onSubmit={form.handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <Input label="Date" name="date" type="date" required value={form.values.date} onChange={form.handleChange} error={form.errors.date} />
            <div className="flex flex-col gap-1">
              <Input 
                label="Category" 
                name="category" 
                list="income-categories" 
                required 
                value={form.values.category} 
                onChange={form.handleChange} 
                error={form.errors.category} 
              />
              <datalist id="income-categories">
                {INCOME_CATEGORIES.map(cat => <option key={cat} value={cat} />)}
              </datalist>
            </div>
            <Input label="Manual Receipt No" name="manualReceiptNo" value={form.values.manualReceiptNo} onChange={form.handleChange} />
            
            <Input label="Payer Name" name="payerName" required value={form.values.payerName} onChange={form.handleChange} error={form.errors.payerName} />
            <Input label="Address" name="address" value={form.values.address} onChange={form.handleChange} />
            <Input label="Contact No" name="contactNo" value={form.values.contactNo} onChange={form.handleChange} />
            
            <Input label="Amount (₹)" name="amount" type="number" min="1" required value={form.values.amount} onChange={handleAmountChange} error={form.errors.amount} />
            <div className="lg:col-span-2">
              <Input label="Amount in Words" name="amountInWords" value={form.values.amountInWords} onChange={form.handleChange} />
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-border">
            <Button type="button" variant="ghost" onClick={form.resetForm} className="mr-3">Clear</Button>
            <Button type="submit" variant="primary">Save Income</Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row justify-between items-center bg-gray-50 gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold text-text">Income Records</h2>
            <div className="bg-primary-light text-primary-dark px-3 py-1 rounded-full text-sm font-semibold">
              Total: {formatINR(totalIncome)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={async () => {
              if (income.length === 0) return toast.error('No data to export');
              setIsExporting(true);
              toast.loading('Generating Excel...', { id: 'excel' });
              exportToExcel(income, [
                 { key: 'date', label: 'Date' },
                 { key: 'digitalReceiptNo', label: 'Receipt No' },
                 { key: 'category', label: 'Category' },
                 { key: 'payerName', label: 'Payer Name' },
                 { key: 'amount', label: 'Amount' }
              ], `income-report-${todayISO()}.xlsx`);
              toast.success('Downloaded!', { id: 'excel' });
              setIsExporting(false);
            }}>
              Download Excel
            </Button>
          </div>
        </div>
        
        {income.length > 0 ? (
          <Table columns={columns} data={income} className="border-0 rounded-none shadow-none" />
        ) : (
          <EmptyState icon={null} title="No income recorded" description="Add your first income record above." />
        )}
      </div>

      <Modal 
        isOpen={!!deleteId} 
        title="Delete Income Record?" 
        message="Are you sure you want to delete this record? This cannot be undone and the receipt number will not be reused."
        confirmVariant="danger"
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          deleteRecord(deleteId, 'income');
          setDeleteId(null);
          toast.success('Record deleted');
        }}
      />

      <Modal 
        isOpen={!!whatsappPromptRecord} 
        title="Send Receipt via WhatsApp?" 
        message={`Would you like to send the receipt details to ${whatsappPromptRecord?.payerName} at ${whatsappPromptRecord?.contactNo}?`}
        confirmVariant="primary"
        confirmLabel="Send Message"
        cancelLabel="Skip"
        onCancel={() => setWhatsappPromptRecord(null)}
        onConfirm={() => {
          handleWhatsAppShare(whatsappPromptRecord);
          setWhatsappPromptRecord(null);
        }}
      />

      {/* Receipt Preview Modal */}
      {previewRecord && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 transition-opacity" onClick={() => setPreviewRecord(null)} />
          <div className="bg-gray-200 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden z-10 flex flex-col">
            <div className="p-4 bg-white border-b flex justify-between items-center shrink-0 no-print">
              <h3 className="font-semibold">Receipt Preview</h3>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setPreviewRecord(null)}>Close</Button>
                {previewRecord.contactNo && (
                  <Button variant="primary" onClick={() => handleWhatsAppShare(previewRecord)}>WhatsApp</Button>
                )}
                <Button variant="secondary" onClick={() => handleShareJPG(previewRecord)}>📷 Share as JPG</Button>
                <Button variant="secondary" onClick={() => window.print()}>Print</Button>

                <Button variant="primary" onClick={() => handleDownloadReceiptPDF(previewRecord)}>Download PDF</Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-gray-200 print-content" id="receipt-preview-content">
              <div className="receipt-scroll-container">
                <div className="receipt-wrapper">
                  <Receipt record={previewRecord} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
