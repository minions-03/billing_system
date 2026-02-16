"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, FileText, Printer, Search, Filter, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function HistoryPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('ALL'); // ALL, PAID, DUE
    const [paymentAmount, setPaymentAmount] = useState('');
    const [updatingBillId, setUpdatingBillId] = useState(null);

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
        setPaymentAmount('');
        setUpdatingBillId(null);
    };

    const handleUpdatePayment = async (billId) => {
        if (!paymentAmount || isNaN(paymentAmount) || Number(paymentAmount) <= 0) {
            toast.error('Enter a valid amount');
            return;
        }

        setUpdatingBillId(billId);
        try {
            const res = await fetch(`/api/bills/${billId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: paymentAmount })
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Payment updated successfully');
                setPaymentAmount('');
                setUpdatingBillId(null);
                fetchBills(); // Refresh list to update dues/status
            } else {
                toast.error(data.error);
                setUpdatingBillId(null);
            }
        } catch (error) {
            console.error('Failed to update payment', error);
            toast.error('Failed to update payment');
            setUpdatingBillId(null);
        }
    };

    const filteredBills = bills.filter(bill => {
        const matchesSearch = bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (bill.billNumber && String(bill.billNumber).includes(searchTerm)) ||
            (!bill.billNumber && bill._id.slice(-4).includes(searchTerm));

        if (!matchesSearch) return false;

        const isDue = (bill.dueAmount || 0) > 0;
        if (filter === 'PAID') return !isDue;
        if (filter === 'DUE') return isDue;
        return true;
    });

    if (loading) return <div className="p-8 text-center">Loading history...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">History</h1>

                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('ALL')}
                        className={`px-3 py-1 text-sm rounded-md border ${filter === 'ALL' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-700 border-zinc-300'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('PAID')}
                        className={`px-3 py-1 text-sm rounded-md border ${filter === 'PAID' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-zinc-700 border-zinc-300'}`}
                    >
                        Paid
                    </button>
                    <button
                        onClick={() => setFilter('DUE')}
                        className={`px-3 py-1 text-sm rounded-md border ${filter === 'DUE' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-zinc-700 border-zinc-300'}`}
                    >
                        Dues
                    </button>
                </div>

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

                            filteredBills.map((bill) => (
                                <>
                                    <tr key={bill._id} className="border-b transition-colors hover:bg-zinc-100/50 data-[state=selected]:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:data-[state=selected]:bg-zinc-800">
                                        <td className="p-4 align-middle font-medium">#{bill.billNumber ? String(bill.billNumber).padStart(4, '0') : bill._id.slice(-4)}</td>
                                        <td className="p-4 align-middle">{new Date(bill.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 align-middle font-medium">
                                            <div>{bill.customerName}</div>
                                            <div className="text-xs text-zinc-500">{bill.customerPhone}</div>
                                        </td>
                                        <td className="p-4 align-middle">{bill.items.length} items</td>
                                        <td className="p-4 align-middle text-right font-medium">
                                            <div>₹{bill.totalAmount.toFixed(2)}</div>
                                            {(bill.dueAmount || 0) > 0 ? (
                                                <span className="text-xs text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Due: ₹{bill.dueAmount.toFixed(2)}</span>
                                            ) : (
                                                <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Paid</span>
                                            )}
                                        </td>
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
                                                    <div className="mt-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                                        <div className="flex justify-between font-bold mb-2">
                                                            <span>Total Amount</span>
                                                            <span>₹{bill.totalAmount.toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-green-600 mb-2">
                                                            <span>Paid Amount</span>
                                                            <span>₹{(bill.paidAmount || 0).toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-red-600 font-bold mb-4">
                                                            <span>Due Amount</span>
                                                            <span>₹{(bill.dueAmount || 0).toFixed(2)}</span>
                                                        </div>

                                                        {(bill.dueAmount || 0) > 0 && (
                                                            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                                                <div className="text-sm font-semibold mb-2 text-zinc-900 dark:text-zinc-100">Add Payment</div>
                                                                <div className="flex gap-2 items-center bg-zinc-50 dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-800">
                                                                    <input
                                                                        type="number"
                                                                        placeholder="Enter Amount..."
                                                                        className="flex-1 p-2 border rounded text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                                                                        value={paymentAmount}
                                                                        onChange={(e) => setPaymentAmount(e.target.value)}
                                                                    />
                                                                    <button
                                                                        onClick={() => handleUpdatePayment(bill._id)}
                                                                        disabled={updatingBillId === bill._id}
                                                                        className="bg-zinc-900 text-white px-4 py-2 rounded text-sm hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 font-medium shrink-0"
                                                                    >
                                                                        {updatingBillId === bill._id ? 'Updating...' : 'Add Payment'}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        )}
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
