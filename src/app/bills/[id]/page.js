"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Printer } from "lucide-react";

export default function InvoicePage() {
    const { id } = useParams();
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchBill() {
            try {
                const res = await fetch(`/api/bills?id=${id}`);
                // Since our API currently returns all bills, we need to filter or update API. 
                // For now, let's fetch all and find. Optimal way is to update API to get by ID, 
                // but to minimize backend changes as per user "do it" instruction speed, we'll fetch list.
                // Wait, I created a product by ID route but not bill by ID.
                // Let's just fetch all and filter client side for now to be safe and fast.
                const data = await res.json();
                if (data.success) {
                    const found = data.data.find((b) => b._id === id);
                    setBill(found);
                }
            } catch (error) {
                console.error("Failed to fetch bill", error);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchBill();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="p-8 text-center print:hidden">Loading invoice...</div>;
    if (!bill) return <div className="p-8 text-center print:hidden">Bill not found</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8 print:p-0 print:bg-white flex justify-center text-black">
            <div className="max-w-3xl w-full bg-white shadow-lg p-0 print:shadow-none mb-10 print:mb-0 text-black">
                {/* Print Button */}
                <div className="p-4 print:hidden flex justify-end">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        <Printer className="w-4 h-4" /> Print Invoice
                    </button>
                </div>

                {/* Invoice Content */}
                <div className="border border-black m-8 print:m-0 print:border-2 min-h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="border-b border-black text-center p-2 relative h-32">
                        <div className="absolute top-2 left-2 text-xs font-bold text-black">GST No. - 10BKAPP5036Q1Z2</div>
                        <div className="absolute top-2 right-2 text-xs font-bold text-black">Mob. 9939408261</div>
                        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-bold underline text-black">Purchase Bill</div>

                        <h1 className="text-4xl font-black text-black mt-6 tracking-tight uppercase" style={{ fontFamily: 'Times New Roman' }}>MAGADH KRISHI KENDRA</h1>
                        <p className="font-bold text-black">Near River Side, Sobh</p>
                    </div>

                    {/* Bill Details */}
                    <div className="flex border-b border-black text-sm relative h-16 text-black">
                        <div className="w-1/2 p-2 relative">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">No.</span>
                                    <span className="text-red-600 font-bold text-xl">
                                        {bill.billNumber ? String(bill.billNumber).padStart(4, '0') : bill._id.slice(-4)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-xs">Mob.</span>
                                    <span className="border-b border-dotted border-black px-1 font-medium">{bill.customerPhone}</span>
                                </div>
                            </div>
                            <div className="mt-1 flex gap-2">
                                <span className="font-bold">Name :</span>
                                <span className="border-b border-dotted border-black flex-1 text-black">{bill.customerName}</span>
                            </div>
                        </div>
                        <div className="w-1/2 p-2 border-l border-black relative">
                            <div className="flex gap-2">
                                <span className="font-bold">Date :</span>
                                <span className="border-b border-dotted border-black flex-1">{new Date(bill.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-1 flex gap-2">
                                <span className="font-bold">Address :</span>
                                <span className="border-b border-dotted border-black flex-1 relative top-1">{bill.customerAddress}</span>
                            </div>
                        </div>
                    </div>

                    {/* Table Header */}
                    <div className="flex border-b border-black text-sm font-bold bg-slate-200 print:bg-slate-200 text-black">
                        <div className="w-[10%] p-1 border-r border-black text-center">S.No.</div>
                        <div className="w-[50%] p-1 border-r border-black text-center">Particulars</div>
                        <div className="w-[15%] p-1 border-r border-black text-center">Qty.</div>
                        <div className="w-[10%] p-1 border-r border-black text-center">Rate</div>
                        <div className="w-[15%] p-1 text-center">Amount</div>
                    </div>

                    {/* Table Body - Fill remaining space */}
                    <div className="flex-1 flex flex-col relative text-sm">
                        {/* Vertical Lines Background */}
                        <div className="absolute inset-0 flex pointer-events-none">
                            <div className="w-[10%] border-r border-black"></div>
                            <div className="w-[50%] border-r border-black"></div>
                            <div className="w-[15%] border-r border-black"></div>
                            <div className="w-[10%] border-r border-black"></div>
                            <div className="w-[15%]"></div>
                        </div>

                        {/* Items */}
                        {bill.items.map((item, index) => (
                            <div key={index} className="flex z-10 relative">
                                <div className="w-[10%] p-1 text-center">{index + 1}</div>
                                <div className="w-[50%] p-1 pl-2">{item.productName}</div>
                                <div className="w-[15%] p-1 text-center">{item.quantity}</div>
                                <div className="w-[10%] p-1 text-center">{item.price}</div>
                                <div className="w-[15%] p-1 text-right pr-2">{(item.price * item.quantity).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Totals */}
                    <div className="border-t border-black text-sm">
                        <div className="flex border-b border-black">
                            <div className="flex-1"></div> {/* Spacer to align with columns? No, design shows specific layout */}

                            {/* Aligning with columns approximately */}
                            <div className="w-[75%] border-r border-black"></div>
                            <div className="w-[10%] p-1 font-bold border-r border-black text-center">Total</div>
                            <div className="w-[15%] p-1 font-bold text-right pr-2">₹{bill.totalAmount.toFixed(2)}</div>
                        </div>
                        <div className="flex border-b border-black">
                            <div className="w-[75%] border-r border-black text-right pr-2 font-bold"></div>
                            <div className="w-[10%] p-1 font-bold border-r border-black text-center">Paid</div>
                            <div className="w-[15%] p-1 text-right pr-2 text-green-700 font-bold">₹{(bill.paidAmount || 0).toFixed(2)}</div>
                        </div>
                        <div className="flex border-b border-black">
                            <div className="w-[75%] border-r border-black text-right pr-2 font-bold"></div>
                            <div className="w-[10%] p-1 font-bold border-r border-black text-center">Due</div>
                            <div className="w-[15%] p-1 text-right pr-2 text-red-700 font-bold">₹{(bill.dueAmount || 0).toFixed(2)}</div>
                        </div>
                        <div className="flex border-b border-black">
                            <div className="w-[75%] border-r border-black text-right pr-2 font-bold"></div>
                            <div className="w-[10%] p-1 font-bold border-r border-black text-center">G.Total</div>
                            <div className="w-[15%] p-1 font-bold text-right pr-2">₹{bill.totalAmount.toFixed(2)}</div>
                        </div>
                    </div>

                    {/* Footer Terms */}
                    <div className="h-24 p-2 flex justify-between items-end relative text-sm">
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
            </div>
        </div>
    );
}
