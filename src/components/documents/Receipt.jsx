import React from 'react';
import { formatINR, formatDate } from '../../utils/formatters';
import { MapPin, Phone, Globe } from 'lucide-react';

const STAMP_IMAGE = "./image/signechure.png";

export default function Receipt({ record }) {
  if (!record) return null;

  return (
    <div 
      id="receipt-element"
      className="receipt-landscape bg-white shadow-2xl relative border border-gray-200"
      style={{ width: '297mm', minHeight: '105mm', transformOrigin: 'top left' }}
    >
      {/* Left Sidebar (Teal Section) */}
      <div className="absolute left-0 top-0 bottom-0 w-10 md:w-12 bg-teal-600 flex flex-col items-center justify-start text-white overflow-hidden">
        {/* Logo at top of sidebar */}
        <div className="w-8 h-8 md:w-10 md:h-10 mt-2 bg-white rounded-full overflow-hidden flex-shrink-0 border border-teal-300 p-0.5">
          <img src="./image/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        {/* Rotated text */}
        <div className="flex-1 flex items-center justify-center">
          <div className="rotate-[-90deg] whitespace-nowrap flex items-center gap-6 text-[9px] md:text-[10px] tracking-[0.15em] font-medium opacity-90 uppercase">
            <div className="flex items-center gap-2">
              <MapPin size={12} />
              <span>Markaz Nagar, Kizhuvilam, TVM</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={12} />
              <span>+91 9446448786</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={12} />
              <span>makhdoomiyya.in</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-10 md:ml-12 p-4 md:p-6 pb-2 h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center border-2 border-teal-600 overflow-hidden p-0.5">
               <img src="./image/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-teal-800 tracking-tighter leading-none mb-0.5 uppercase">
                MAKHDOOMIYYA ACADEMY, ATTINGAL
              </h2>
              <p className="text-[8px] md:text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                UNDER QUADISIYYA ISLAMIC COMPLEX, THAZHUTHALA, KOLLAM
              </p>
            </div>
          </div>
          <div className="text-right space-y-1 shrink-0">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">NO:</span>
              <span className="text-xl font-black text-slate-800 font-mono">{record.manualReceiptNo || record.digitalReceiptNo}</span>
            </div>
            <div className="flex items-center gap-2 justify-end mt-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">DATE:</span>
              <span className="text-md font-bold text-gray-800 border-b border-gray-300 min-w-[90px] text-center pb-0.5">
                {formatDate(record.date)}
              </span>
            </div>
          </div>
        </div>

        {/* Body Fields */}
        <div className="flex-grow space-y-2 mt-1">
          <div className="flex items-end gap-4">
            <span className="text-sm font-bold text-gray-700 uppercase whitespace-nowrap">Received with thanks from:</span>
            <div className="flex-grow border-b-2 border-dotted border-gray-400 pb-1 px-4 italic font-serif text-xl text-gray-800 min-h-[32px]">
              {record.payerName}
            </div>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex items-end gap-2 flex-1">
              <span className="text-sm font-bold text-gray-700 uppercase whitespace-nowrap">Address:</span>
              <div className="flex-grow border-b-2 border-dotted border-gray-400 pb-1 px-4 italic font-serif text-lg text-gray-800 min-h-[32px]">
                {record.address}
              </div>
            </div>
            <div className="flex items-end gap-2 flex-1">
              <span className="text-sm font-bold text-gray-700 uppercase whitespace-nowrap">Contact No:</span>
              <div className="flex-grow border-b-2 border-dotted border-gray-400 pb-1 px-4 font-sans font-medium text-lg text-gray-800 min-h-[32px] tracking-wide">
                {record.contactNo}
              </div>
            </div>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex items-end gap-2 flex-1">
              <span className="text-sm font-bold text-gray-700 uppercase whitespace-nowrap">Amount in Words:</span>
              <div className="flex-grow border-b-2 border-dotted border-gray-400 pb-1 px-4 italic font-serif text-lg text-gray-800 min-h-[32px]">
                {record.amountInWords}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-between items-end">
          <div className="relative">
            <div className="flex flex-col border-2 border-teal-700 rounded-md overflow-hidden bg-white" style={{ minWidth: '220px' }}>
              <div className="bg-teal-700 text-teal-50 text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1.5 text-center flex items-center justify-center gap-2">
                Amount Received
              </div>
              <div className="px-6 py-3 flex items-center justify-center gap-1 bg-gradient-to-b from-teal-50/50 to-teal-100/50">
                <span className="text-2xl font-black text-teal-800 opacity-80 mt-1">₹</span>
                <span className="text-3xl font-black text-teal-900 font-mono tracking-tight">
                  {formatINR(record.amount).replace('₹', '').trim()}/-
                </span>
              </div>
            </div>
          </div>

          <div className="text-center relative flex justify-center">
            {/* Stamp Image */}
            <div className="absolute -top-20 -left-8 w-32 h-32 pointer-events-none z-10 opacity-80">
              <img 
                src="./image/stamp.png" 
                alt="Stamp" 
                className="w-full h-full object-contain"
              />
            </div>
            {/* Signature Image */}
            <div className="absolute -top-20 left-4 w-32 h-32 pointer-events-none z-20">
              <img 
                src="./image/signechure.png" 
                alt="Signature" 
                className="w-full h-full object-contain rotate-[12deg] mix-blend-multiply"
              />
            </div>
            <div className="mt-4 border-t-2 border-gray-800 pt-1 w-48 relative z-0">
              <p className="text-[10px] font-bold text-gray-800 uppercase tracking-widest text-center">Receiver's Signature</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -mr-16 -mt-16 opacity-50 pointer-events-none"></div>
    </div>
  );
}
