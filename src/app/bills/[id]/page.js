"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer } from "lucide-react";

export default function InvoicePage() {
    const { id } = useParams();
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBill() {
            try {
                const res = await fetch(`/api/bills/${id}`);
                const data = await res.json();
                if (data.success) setBill(data.data);
            } catch (error) {
                console.error("Failed to fetch bill", error);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchBill();
    }, [id]);

    if (loading) return <div className="p-8 text-center print:hidden">Loading invoice...</div>;
    if (!bill) return <div className="p-8 text-center print:hidden">Bill not found</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white flex justify-center text-black overflow-x-auto">
            <div className="max-w-3xl w-full bg-white shadow-lg p-0 print:shadow-none mb-10 print:mb-0 text-black min-w-[800px]">
                {/* Print Button */}
                <div className="p-4 print:hidden flex justify-end">
                    <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                        <Printer className="w-4 h-4" /> Print Invoice
                    </button>
                </div>

                {bill.customerType === 'WHOLESALER' ? (
                    <WholesalerInvoice bill={bill} />
                ) : (
                    <RetailerInvoice bill={bill} />
                )}
            </div>
        </div>
    );
}

/* ── Retailer: Purchase Bill ── */
function RetailerInvoice({ bill }) {
    return (
        <div className="border border-black m-8 print:m-0 print:border-2 min-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="border-b border-black text-center p-2 relative h-32">
                <div className="absolute top-2 left-2 text-xs font-bold">GST No. - 10BKAPP5036Q1Z2</div>
                <div className="absolute top-2 right-2 text-xs font-bold">Mob. 9939408261</div>
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-bold underline">Purchase Bill</div>
                <h1 className="text-4xl font-black mt-6 tracking-tight uppercase" style={{ fontFamily: 'Times New Roman' }}>MAGADH KRISHI KENDRA</h1>
                <p className="font-bold text-sm mt-1">Near River Side, Sobh</p>
            </div>

            {/* Bill Details */}
            <div className="flex border-b border-black text-sm h-16">
                <div className="w-1/2 p-2">
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-2">
                            <span className="font-bold">No.</span>
                            <span className="text-red-600 font-bold text-xl">{bill.billNumber ? String(bill.billNumber).padStart(4, '0') : bill._id.slice(-4)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="font-bold text-xs">Mob.</span>
                            <span className="border-b border-dotted border-black px-1 font-medium">{bill.customerPhone}</span>
                        </div>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                        <span className="font-bold shrink-0">Name :</span>
                        <span className="border-b border-dotted border-black flex-1">{bill.customerName}</span>
                    </div>
                </div>
                <div className="w-1/2 p-2 border-l border-black">
                    <div className="flex gap-2">
                        <span className="font-bold">Date :</span>
                        <span className="border-b border-dotted border-black flex-1">{new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                        <span className="font-bold shrink-0">Address :</span>
                        <span className="border-b border-dotted border-black flex-1">{bill.customerAddress}</span>
                    </div>
                </div>
            </div>

            {/* Table Header */}
            <div className="flex border-b border-black text-sm font-bold bg-slate-200 print:bg-slate-200">
                <div className="w-[10%] p-1 border-r border-black text-center">S.No.</div>
                <div className="w-[50%] p-1 border-r border-black text-center">Particulars</div>
                <div className="w-[15%] p-1 border-r border-black text-center">Qty(Bags)</div>
                <div className="w-[10%] p-1 border-r border-black text-center">Rate</div>
                <div className="w-[15%] p-1 text-center">Amount</div>
            </div>

            {/* Table Body */}
            <div className="flex-1 flex flex-col relative text-sm">
                <div className="absolute inset-0 flex pointer-events-none">
                    <div className="w-[10%] border-r border-black"></div>
                    <div className="w-[50%] border-r border-black"></div>
                    <div className="w-[15%] border-r border-black"></div>
                    <div className="w-[10%] border-r border-black"></div>
                    <div className="w-[15%]"></div>
                </div>
                {bill.items.map((item, index) => (
                    <div key={index} className="flex z-10 relative">
                        <div className="w-[10%] p-1 text-center">{index + 1}</div>
                        <div className="w-[50%] p-1 pl-2">{item.productName}</div>
                        <div className="w-[15%] p-1 text-center whitespace-nowrap">{item.bagWeight ? `${item.bagWeight}kg × ${item.quantity}` : item.quantity}</div>
                        <div className="w-[10%] p-1 text-center">{item.price}</div>
                        <div className="w-[15%] p-1 text-right pr-2">{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                ))}
            </div>

            {/* Footer Totals */}
            <div className="border-t border-black text-sm">
                <div className="flex border-b border-black">
                    <div className="w-[75%] border-r border-black"></div>
                    <div className="w-[10%] p-1 font-bold border-r border-black text-center">Total</div>
                    <div className="w-[15%] p-1 font-bold text-right pr-2">₹{bill.totalAmount.toFixed(2)}</div>
                </div>
                <div className="flex border-b border-black">
                    <div className="w-[75%] border-r border-black"></div>
                    <div className="w-[10%] p-1 font-bold border-r border-black text-center">Paid</div>
                    <div className="w-[15%] p-1 text-right pr-2 text-green-700 font-bold">₹{(bill.paidAmount || 0).toFixed(2)}</div>
                </div>
                <div className="flex border-b border-black">
                    <div className="w-[75%] border-r border-black"></div>
                    <div className="w-[10%] p-1 font-bold border-r border-black text-center">Due</div>
                    <div className="w-[15%] p-1 text-right pr-2 text-red-700 font-bold">₹{(bill.dueAmount || 0).toFixed(2)}</div>
                </div>
                <div className="flex border-b border-black">
                    <div className="w-[75%] border-r border-black"></div>
                    <div className="w-[10%] p-1 font-bold border-r border-black text-center">G.Total</div>
                    <div className="w-[15%] p-1 font-bold text-right pr-2">₹{bill.totalAmount.toFixed(2)}</div>
                </div>
            </div>

            <div className="h-24 p-2 flex justify-between items-end text-sm">
                <div>
                    <div className="font-bold underline mb-1">E.&.O.E.</div>
                    <div className="text-xs">Goods once sold will not taken back.</div>
                    <div className="font-bold mt-1 text-xs">नोट - बीज बोने से पहले बीज का अंकुरण चेक कर लें।</div>
                </div>
                <div className="text-center mb-4 mr-4">
                    <div className="font-bold font-serif text-lg">Signature</div>
                </div>
            </div>
        </div>
    );
}

/* ── Wholesaler: Tax Invoice ── */
function WholesalerInvoice({ bill }) {
    const subTotal = bill.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const cgst = bill.cgst || 0;
    const sgst = bill.sgst || 0;
    const igst = bill.igst || 0;

    return (
        <div className="border border-black m-8 print:m-0 print:border-2 min-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="border-b-2 border-black text-center p-3 relative">
                <div className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider border border-black px-2 py-0.5">Tax Invoice</div>
                <h1 className="text-2xl font-black tracking-tight uppercase" style={{ fontFamily: 'Times New Roman', color: '#1a237e' }}>MAGADH KRISHAK S.S.S LTD</h1>
                <p className="text-[11px] font-semibold mt-0.5">Sobh, Barachatti, Gaya (Bihar) 824201</p>
                <div className="flex justify-center gap-6 text-[10px] mt-1 font-medium flex-wrap">
                    <span>GSTIN No. 10AABAM8791N1Z7</span>
                    <span>Tin- 10204975017</span>
                    <span>PAN No. BJPD0504L</span>
                    <span>Mob. 9939408261</span>
                </div>
            </div>

            {/* Customer + Bill Meta */}
            <div className="flex border-b border-black text-[11px]">
                <div className="w-[55%] border-r border-black p-2 flex flex-col gap-1">
                    <div className="flex gap-1"><span className="font-bold w-28 shrink-0">Customer&apos;s Name</span><span className="border-b border-dotted border-black flex-1 uppercase font-medium">{bill.customerName}</span></div>
                    <div className="flex gap-1"><span className="font-bold w-28 shrink-0">Address</span><span className="border-b border-dotted border-black flex-1">{bill.customerAddress}</span></div>
                    <div className="flex gap-1"><span className="font-bold w-28 shrink-0">Mobile</span><span className="border-b border-dotted border-black flex-1">{bill.customerPhone}</span></div>
                    <div className="flex gap-1"><span className="font-bold w-28 shrink-0">CST</span><span className="border-b border-dotted border-black flex-1">{bill.customerCst || '—'}</span></div>
                    <div className="flex gap-1"><span className="font-bold w-28 shrink-0">TIN</span><span className="border-b border-dotted border-black flex-1">{bill.customerTin || '—'}</span></div>
                    <div className="flex gap-1"><span className="font-bold w-28 shrink-0">GSTIN ID</span><span className="border-b border-dotted border-black flex-1">{bill.customerGstin || '—'}</span></div>
                </div>
                <div className="w-[45%] p-2 flex flex-col gap-1">
                    <div className="flex gap-1"><span className="font-bold w-28 shrink-0">Book No.</span><span className="border-b border-dotted border-black flex-1">{bill.bookNo || '—'}</span></div>
                    <div className="flex gap-1"><span className="font-bold w-28 shrink-0">Bill No.</span><span className="border-b border-dotted border-black flex-1 text-red-600 font-bold">{bill.billNumber ? String(bill.billNumber).padStart(4, '0') : bill._id.slice(-4)}</span></div>
                    <div className="flex gap-1"><span className="font-bold w-28 shrink-0">Date</span><span className="border-b border-dotted border-black flex-1">{new Date(bill.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span></div>
                    <div className="flex gap-1"><span className="font-bold w-28 shrink-0">Vehicle No.</span><span className="border-b border-dotted border-black flex-1">{bill.vehicleNo || '—'}</span></div>
                    <div className="flex gap-1"><span className="font-bold w-28 shrink-0">Supplier&apos;s ref</span><span className="border-b border-dotted border-black flex-1">{bill.supplierRef || '—'}</span></div>
                </div>
            </div>

            {/* Table Header */}
            <div className="flex border-b border-black text-[11px] font-bold bg-slate-200 print:bg-slate-200">
                <div className="w-[7%] p-1 border-r border-black text-center">S/N</div>
                <div className="w-[40%] p-1 border-r border-black text-center">Item Description</div>
                <div className="w-[15%] p-1 border-r border-black text-center">HSN Code</div>
                <div className="w-[10%] p-1 border-r border-black text-center">QTY</div>
                <div className="w-[13%] p-1 border-r border-black text-center">Rate</div>
                <div className="w-[15%] p-1 text-center">Amount</div>
            </div>

            {/* Table Body */}
            <div className="flex-1 flex flex-col relative text-[11px]">
                <div className="absolute inset-0 flex pointer-events-none">
                    <div className="w-[7%] border-r border-black h-full"></div>
                    <div className="w-[40%] border-r border-black h-full"></div>
                    <div className="w-[15%] border-r border-black h-full"></div>
                    <div className="w-[10%] border-r border-black h-full"></div>
                    <div className="w-[13%] border-r border-black h-full"></div>
                    <div className="w-[15%] h-full"></div>
                </div>
                {bill.items.map((item, index) => (
                    <div key={index} className="flex z-10 relative border-b border-black/10">
                        <div className="w-[7%] p-1 text-center">{index + 1}</div>
                        <div className="w-[40%] p-1 pl-2 font-medium">{item.productName}</div>
                        <div className="w-[15%] p-1 text-center">{bill.hsnCode || '—'}</div>
                        <div className="w-[10%] p-1 text-center whitespace-nowrap">{item.bagWeight ? `${item.bagWeight}kg × ${item.quantity}` : item.quantity}</div>
                        <div className="w-[13%] p-1 text-center">₹{item.price}</div>
                        <div className="w-[15%] p-1 text-right pr-2">₹{(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                ))}
            </div>

            {/* Footer Totals */}
            <div className="border-t border-black text-[11px]">
                <div className="flex border-b border-black">
                    <div className="w-[72%] border-r border-black p-1 text-right font-bold">Total</div>
                    <div className="w-[28%] p-1 text-right pr-2 font-bold">₹{subTotal.toFixed(2)}</div>
                </div>
                <div className="flex border-b border-black">
                    <div className="w-[72%] border-r border-black p-1 text-right font-bold">CGST</div>
                    <div className="w-[28%] p-1 text-right pr-2">₹{cgst.toFixed(2)}</div>
                </div>
                <div className="flex border-b border-black">
                    <div className="w-[72%] border-r border-black p-1 text-right font-bold">SGST</div>
                    <div className="w-[28%] p-1 text-right pr-2">₹{sgst.toFixed(2)}</div>
                </div>
                <div className="flex border-b border-black">
                    <div className="w-[72%] border-r border-black p-1 text-right font-bold">IGST</div>
                    <div className="w-[28%] p-1 text-right pr-2">₹{igst.toFixed(2)}</div>
                </div>
                <div className="flex border-b border-black">
                    <div className="w-[72%] border-r border-black p-1 text-right font-bold">Paid</div>
                    <div className="w-[28%] p-1 text-right pr-2 text-green-700 font-bold">₹{(bill.paidAmount || 0).toFixed(2)}</div>
                </div>
                <div className="flex border-b border-black">
                    <div className="w-[72%] border-r border-black p-1 text-right font-bold text-red-600">Due</div>
                    <div className="w-[28%] p-1 text-right pr-2 font-bold text-red-600">₹{(bill.dueAmount || 0).toFixed(2)}</div>
                </div>
                <div className="flex border-b border-black bg-slate-100 print:bg-slate-100">
                    <div className="w-[72%] border-r border-black p-1 text-right font-bold">Grand Total</div>
                    <div className="w-[28%] p-1 text-right pr-2 font-bold">₹{bill.totalAmount.toFixed(2)}</div>
                </div>
            </div>

            <div className="h-20 p-2 flex justify-between items-end text-[11px]">
                <div>
                    <div className="font-bold underline mb-1">E.&.O.E.</div>
                    <div>Subject to Gaya jurisdiction only.</div>
                </div>
                <div className="text-right">
                    <div className="font-bold font-serif">For MAGADH KRISHAK S.S.S LTD</div>
                    <div className="mt-6 border-t border-black pt-1">Authorised Signatory</div>
                </div>
            </div>
        </div>
    );
}
