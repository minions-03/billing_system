"use client";

import { useState, useEffect, useCallback } from 'react';
import {
    Wallet, Plus, Trash2, Search, ChevronLeft, ChevronRight,
    CreditCard, Landmark, Banknote, Smartphone, RefreshCcw,
    Pencil, Check, X, Clock
} from 'lucide-react';
import { toast } from 'sonner';

const PAYMENT_MODES = ['ONLINE', 'UPI', 'NEFT', 'RTGS', 'CHEQUE', 'CASH'];

const MODE_STYLES = {
    ONLINE: { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: CreditCard },
    UPI: { bg: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Smartphone },
    NEFT: { bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Landmark },
    RTGS: { bg: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400', icon: Landmark },
    CHEQUE: { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: Banknote },
    CASH: { bg: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: Banknote },
};

const emptyForm = {
    companyName: '',
    amount: '',
    paymentMode: 'ONLINE',
    referenceNo: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
    isBlankCheque: false,
};

const LIMIT = 10;

export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [submitting, setSubmitting] = useState(false);

    // Search: separate input state vs committed search term (Enter key)
    const [searchInput, setSearchInput] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [modeFilter, setModeFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [deletingId, setDeletingId] = useState(null);

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    // Global stats from API
    const [pendingCount, setPendingCount] = useState(0);
    const [allTimeTotal, setAllTimeTotal] = useState(0);
    const [thisMonthTotal, setThisMonthTotal] = useState(0);

    // Inline edit state
    const [editRow, setEditRow] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);

    const fetchPayments = useCallback(async (pg = page) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pg,
                limit: LIMIT,
                search: searchTerm,
                modeFilter,
                statusFilter,
            });
            const res = await fetch(`/api/payments?${params}`);
            const data = await res.json();
            if (data.success) {
                setPayments(data.data);
                setTotalPages(data.totalPages);
                setTotal(data.total);
                setPendingCount(data.pendingCount);
                setAllTimeTotal(data.allTimeTotal);
                setThisMonthTotal(data.thisMonthTotal);
            }
        } catch { toast.error('Failed to load payments'); }
        finally { setLoading(false); }
    }, [page, searchTerm, modeFilter, statusFilter]);

    // Re-fetch whenever page, searchTerm, or filters change
    useEffect(() => { fetchPayments(page); }, [page, searchTerm, modeFilter, statusFilter]);

    // Reset to page 1 when filter changes
    const handleModeFilter = (m) => { setModeFilter(m); setPage(1); };
    const handleStatusFilter = (s) => { setStatusFilter(s); setPage(1); };

    // Search triggers on Enter
    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') { setSearchTerm(searchInput); setPage(1); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.companyName.trim()) { toast.error('Enter company name'); return; }
        if (!form.isBlankCheque && (!form.amount || Number(form.amount) <= 0)) {
            toast.error('Enter a valid amount'); return;
        }
        setSubmitting(true);
        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyName: form.companyName,
                    amount: form.isBlankCheque ? 0 : Number(form.amount),
                    paymentMode: form.paymentMode,
                    referenceNo: form.referenceNo,
                    date: form.date,
                    note: form.note,
                    status: form.isBlankCheque ? 'PENDING' : 'COMPLETED',
                }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success(form.isBlankCheque ? 'Blank cheque recorded (Pending)' : 'Payment recorded!');
                setForm(emptyForm);
                setShowForm(false);
                setPage(1);
                fetchPayments(1);
            } else toast.error(data.error);
        } catch { toast.error('Failed to save payment'); }
        finally { setSubmitting(false); }
    };

    const startEdit = (p) => {
        setEditRow({ id: p._id, amount: p.amount === 0 ? '' : String(p.amount), referenceNo: p.referenceNo || '' });
    };

    const saveEdit = async () => {
        if (!editRow.amount || Number(editRow.amount) <= 0) { toast.error('Enter a valid amount'); return; }
        setSavingEdit(true);
        try {
            const res = await fetch(`/api/payments?id=${editRow.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: Number(editRow.amount), referenceNo: editRow.referenceNo }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Amount updated — marked as Completed!');
                setEditRow(null);
                fetchPayments(page);
            } else toast.error(data.error);
        } catch { toast.error('Failed to update'); }
        finally { setSavingEdit(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this payment record?')) return;
        setDeletingId(id);
        try {
            const res = await fetch(`/api/payments?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Deleted');
                // Go back a page if this was the last item on the page
                const newPage = payments.length === 1 && page > 1 ? page - 1 : page;
                setPage(newPage);
                fetchPayments(newPage);
            } else toast.error(data.error);
        } catch { toast.error('Failed to delete'); }
        finally { setDeletingId(null); }
    };

    // Auto-toggle blank cheque off if mode is not CHEQUE
    const handleModeChange = (mode) => {
        setForm(prev => ({ ...prev, paymentMode: mode, isBlankCheque: mode !== 'CHEQUE' ? false : prev.isBlankCheque }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Wallet className="w-8 h-8 text-emerald-600" /> Payment Ledger
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">Track money sent to companies via online, cheque, UPI, etc.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow"
                >
                    <Plus className="w-4 h-4" /> Add Payment
                </button>
            </div>

            {/* Add Payment Form */}
            {showForm && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6">
                    <h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 mb-4">Record New Payment</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Company Name */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Company Name *</label>
                            <input
                                className="border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g. Bayer CropScience"
                                value={form.companyName}
                                onChange={e => setForm({ ...form, companyName: e.target.value })}
                            />
                        </div>

                        {/* Payment Mode */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Payment Mode *</label>
                            <select
                                className="border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={form.paymentMode}
                                onChange={e => handleModeChange(e.target.value)}
                            >
                                {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>

                        {/* Amount */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                                Amount (₹) {form.isBlankCheque ? '— Blank Cheque' : '*'}
                            </label>
                            <input
                                type="number"
                                className="border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed"
                                placeholder={form.isBlankCheque ? 'Will be updated later' : 'e.g. 25000'}
                                value={form.isBlankCheque ? '' : form.amount}
                                disabled={form.isBlankCheque}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                            />
                            {form.paymentMode === 'CHEQUE' && (
                                <label className="flex items-center gap-2 mt-1 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded accent-amber-500"
                                        checked={form.isBlankCheque}
                                        onChange={e => setForm({ ...form, isBlankCheque: e.target.checked, amount: e.target.checked ? '' : form.amount })}
                                    />
                                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Blank Cheque (amount unknown, fill later)</span>
                                </label>
                            )}
                        </div>

                        {/* Cheque No / Reference No */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Cheque No./ Reference No.</label>
                            <input
                                className="border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Transaction ID / Cheque No."
                                value={form.referenceNo}
                                onChange={e => setForm({ ...form, referenceNo: e.target.value })}
                            />
                        </div>

                        {/* Date */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Date *</label>
                            <input
                                type="date"
                                className="border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                            />
                        </div>

                        {/* Note */}
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Note</label>
                            <input
                                className="border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-sm bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="Optional note..."
                                value={form.note}
                                onChange={e => setForm({ ...form, note: e.target.value })}
                            />
                        </div>

                        {/* Actions */}
                        <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-2 items-center">
                            {form.isBlankCheque && (
                                <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-full px-3 py-1">
                                    <Clock className="w-3 h-3" /> Will be saved as <strong>Pending</strong> — update amount later
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={submitting}
                                className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium text-sm"
                            >
                                {submitting ? 'Saving...' : form.isBlankCheque ? 'Save Blank Cheque' : 'Save Payment'}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setForm(emptyForm); }}
                                className="px-6 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 flex items-center gap-4 shadow-sm">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-lg shrink-0">
                        <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <div className="text-xs text-zinc-500">Blank Cheques (Pending)</div>
                        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 flex items-center gap-4 shadow-sm">
                    <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-lg shrink-0">
                        <Wallet className="w-6 h-6 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div>
                        <div className="text-xs text-zinc-500">Total Entries</div>
                        <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{total}</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 flex items-center gap-4 shadow-sm">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg shrink-0">
                        <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <div className="text-xs text-zinc-500">This Month</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{thisMonthTotal.toLocaleString('en-IN')}</div>
                    </div>
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5 flex items-center gap-4 shadow-sm">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-lg shrink-0">
                        <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <div className="text-xs text-zinc-500">All Time Total</div>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            ₹{allTimeTotal.toLocaleString('en-IN')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters + Search */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
                {/* Search — Enter to search */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                    <input
                        placeholder="Search company, ref, note… (Enter)"
                        className="pl-9 h-9 w-full rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        value={searchInput}
                        onChange={e => {
                            const val = e.target.value;
                            setSearchInput(val);
                            if (val === '') { setSearchTerm(''); setPage(1); }
                        }}
                        onKeyDown={handleSearchKeyDown}
                    />
                </div>

                {/* Mode filter */}
                <div className="flex gap-2 flex-wrap">
                    {['ALL', ...PAYMENT_MODES].map(m => (
                        <button
                            key={m}
                            onClick={() => handleModeFilter(m)}
                            className={`px-3 py-1 text-xs rounded-md border font-medium transition-colors ${modeFilter === m
                                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900'
                                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                {/* Status filter */}
                <div className="flex gap-2">
                    {['ALL', 'COMPLETED', 'PENDING'].map(s => (
                        <button
                            key={s}
                            onClick={() => handleStatusFilter(s)}
                            className={`px-3 py-1 text-xs rounded-md border font-medium transition-colors ${statusFilter === s
                                ? s === 'PENDING' ? 'bg-amber-500 text-white border-amber-500'
                                    : s === 'COMPLETED' ? 'bg-emerald-600 text-white border-emerald-600'
                                        : 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900'
                                : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                }`}
                        >
                            {s === 'ALL' ? 'All Status' : s === 'PENDING' ? '⏳ Pending' : '✅ Completed'}
                        </button>
                    ))}
                </div>

                <button onClick={() => fetchPayments(page)} className="ml-auto text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors" title="Refresh">
                    <RefreshCcw className="w-4 h-4" />
                </button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto shadow-sm">
                <table className="w-full text-sm text-left min-w-[800px]">
                    <thead className="bg-zinc-50 dark:bg-zinc-900">
                        <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <th className="h-11 px-4 font-medium text-zinc-500 dark:text-zinc-400">Date</th>
                            <th className="h-11 px-4 font-medium text-zinc-500 dark:text-zinc-400">Company</th>
                            <th className="h-11 px-4 font-medium text-zinc-500 dark:text-zinc-400">Mode</th>
                            <th className="h-11 px-4 font-medium text-zinc-500 dark:text-zinc-400">Status</th>
                            <th className="h-11 px-4 font-medium text-zinc-500 dark:text-zinc-400">Cheque No./ Reference No.</th>
                            <th className="h-11 px-4 font-medium text-zinc-500 dark:text-zinc-400">Note</th>
                            <th className="h-11 px-4 font-medium text-zinc-500 dark:text-zinc-400 text-right">Amount</th>
                            <th className="h-11 px-4 font-medium text-zinc-500 dark:text-zinc-400 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-zinc-950 divide-y divide-zinc-100 dark:divide-zinc-800">
                        {loading ? (
                            <tr><td colSpan={8} className="p-8 text-center text-zinc-400">Loading...</td></tr>
                        ) : payments.length === 0 ? (
                            <tr><td colSpan={8} className="p-8 text-center text-zinc-400">No payment records found.</td></tr>
                        ) : (
                            payments.map(p => {
                                const modeStyle = MODE_STYLES[p.paymentMode] || MODE_STYLES.ONLINE;
                                const ModeIcon = modeStyle.icon;
                                const isPending = p.status === 'PENDING';
                                const isEditing = editRow?.id === p._id;

                                return (
                                    <tr key={p._id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors ${isPending ? 'bg-amber-50/40 dark:bg-amber-900/10' : ''}`}>
                                        <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                            {new Date(p.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">{p.companyName}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${modeStyle.bg}`}>
                                                <ModeIcon className="w-3 h-3" /> {p.paymentMode}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {isPending ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                                    <Clock className="w-3 h-3" /> Pending
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                    <Check className="w-3 h-3" /> Completed
                                                </span>
                                            )}
                                        </td>

                                        {/* Cheque / Ref — editable when editing */}
                                        <td className="px-4 py-3 text-zinc-500 font-mono text-xs">
                                            {isEditing ? (
                                                <input
                                                    className="border border-zinc-200 dark:border-zinc-700 rounded px-2 py-1 text-xs w-32 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                                    placeholder="Cheque / Ref No."
                                                    value={editRow.referenceNo}
                                                    onChange={e => setEditRow({ ...editRow, referenceNo: e.target.value })}
                                                />
                                            ) : (p.referenceNo || '—')}
                                        </td>

                                        <td className="px-4 py-3 text-zinc-500 max-w-[150px] truncate">{p.note || '—'}</td>

                                        {/* Amount — editable when editing */}
                                        <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    className="border border-amber-300 dark:border-amber-700 rounded px-2 py-1 text-xs w-28 text-right bg-white dark:bg-zinc-900 focus:outline-none focus:ring-1 focus:ring-amber-400"
                                                    placeholder="Enter amount"
                                                    value={editRow.amount}
                                                    onChange={e => setEditRow({ ...editRow, amount: e.target.value })}
                                                    autoFocus
                                                />
                                            ) : isPending ? (
                                                <span className="text-amber-500 italic text-xs">Blank</span>
                                            ) : (
                                                <span className="text-zinc-900 dark:text-zinc-100">₹{p.amount.toLocaleString('en-IN')}</span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                {isEditing ? (
                                                    <>
                                                        <button
                                                            onClick={saveEdit}
                                                            disabled={savingEdit}
                                                            className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100 disabled:opacity-40"
                                                            title="Save"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditRow(null)}
                                                            className="p-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200"
                                                            title="Cancel"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => startEdit(p)}
                                                            className={`p-1.5 rounded-md transition-colors ${isPending
                                                                ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-200 dark:hover:bg-amber-900/40'
                                                                : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'}`}
                                                            title={isPending ? 'Fill in amount' : 'Edit'}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(p._id)}
                                                            disabled={deletingId === p._id}
                                                            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-600 transition-colors disabled:opacity-40"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>
                    {total === 0 ? 'No records' : `Showing ${(page - 1) * LIMIT + 1}–${Math.min(page * LIMIT, total)} of ${total} entries`}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" /> Prev
                    </button>
                    <span className="px-3 py-1.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-medium text-zinc-700 dark:text-zinc-300">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || loading}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Next <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
