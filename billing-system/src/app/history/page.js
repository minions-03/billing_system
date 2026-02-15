"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, FileText, Printer, Search } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBills();
    }, []);

    const fetchBills = async () => {
        try {
            const res = await fetch('/api/bills');
            const data = await res.json();
            if (data.success) {
                setBills(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch bills', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    if (loading) return <div className="p-8 text-center">Loading history...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">History</h1>
                <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-zinc-500" />
                    <input
                        placeholder="Search name or bill no..."
                        className="pl-8 h-9 w-full rounded-md border border-zinc-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:focus-visible:ring-zinc-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <table className="w-full caption-bottom text-sm text-left">
                    <thead className="[&_tr]:border-b bg-zinc-50 dark:bg-zinc-900">
                        <tr className="border-b transition-colors data-[state=selected]:bg-zinc-100 dark:data-[state=selected]:bg-zinc-800">
                            <th className="h-12 px-4 align-middle font-medium text-zinc-500 dark:text-zinc-400">Bill No.</th>
                            <th className="h-12 px-4 align-middle font-medium text-zinc-500 dark:text-zinc-400">Date</th>
                            <th className="h-12 px-4 align-middle font-medium text-zinc-500 dark:text-zinc-400">Customer</th>
                            <th className="h-12 px-4 align-middle font-medium text-zinc-500 dark:text-zinc-400">Items</th>
                            <th className="h-12 px-4 align-middle font-medium text-zinc-500 dark:text-zinc-400 text-right">Total</th>
                            <th className="h-12 px-4 align-middle font-medium text-zinc-500 dark:text-zinc-400 text-center">Details</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0 bg-white dark:bg-zinc-950">
                        {bills.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-4 text-center text-zinc-500">No history found.</td>
                            </tr>
                        ) : (
                            bills.filter(bill =>
                                bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                (bill.billNumber && String(bill.billNumber).includes(searchTerm)) ||
                                (!bill.billNumber && bill._id.slice(-4).includes(searchTerm))
                            ).map((bill) => (
                                <>
                                    <tr key={bill._id} className="border-b transition-colors hover:bg-zinc-100/50 data-[state=selected]:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:data-[state=selected]:bg-zinc-800">
                                        <td className="p-4 align-middle font-medium">#{bill.billNumber ? String(bill.billNumber).padStart(4, '0') : bill._id.slice(-4)}</td>
                                        <td className="p-4 align-middle">{new Date(bill.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 align-middle font-medium">
                                            <div>{bill.customerName}</div>
                                            <div className="text-xs text-zinc-500">{bill.customerPhone}</div>
                                        </td>
                                        <td className="p-4 align-middle">{bill.items.length} items</td>
                                        <td className="p-4 align-middle text-right font-medium">₹{bill.totalAmount.toFixed(2)}</td>
                                        <td className="p-4 align-middle text-center">
                                            <div className="flex justify-center gap-2">
                                                <Link href={`/bills/${bill._id}`} target="_blank" className="p-2 hover:bg-zinc-100 rounded-md dark:hover:bg-zinc-800 text-zinc-500">
                                                    <Printer className="w-4 h-4" />
                                                </Link>
                                                <button onClick={() => toggleExpand(bill._id)} className="p-2 hover:bg-zinc-100 rounded-md dark:hover:bg-zinc-800 text-zinc-500">
                                                    {expandedId === bill._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedId === bill._id && (
                                        <tr className="bg-zinc-50 dark:bg-zinc-900/50">
                                            <td colSpan={5} className="p-4">
                                                <div className="text-sm rounded-md border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                                                    <h4 className="font-semibold mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Bill Details</h4>
                                                    <ul className="space-y-1">
                                                        {bill.items.map((item, idx) => (
                                                            <li key={idx} className="flex justify-between text-zinc-600 dark:text-zinc-400">
                                                                <span>{item.productName || 'Unknown Product'} (x{item.quantity})</span>
                                                                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                    <div className="mt-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between font-bold">
                                                        <span>Total Paid</span>
                                                        <span>₹{bill.totalAmount.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
