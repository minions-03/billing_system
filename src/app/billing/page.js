"use client";

import { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, Store, Building2, CheckCircle, Printer } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function BillingPage() {
    // Type selector modal
    const [billingType, setBillingType] = useState(null); // null | 'RETAILER' | 'WHOLESALER'

    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [customer, setCustomer] = useState({
        name: '', phone: '', address: '', type: 'RETAILER',
        gstin: '', cst: '', tin: '',
    });
    // Wholesaler-specific bill fields
    const [wsFields, setWsFields] = useState({ bookNo: '', vehicleNo: '', supplierRef: '', hsnCode: '', cgst: '', sgst: '', igst: '' });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [paidAmount, setPaidAmount] = useState('');
    const [success, setSuccess] = useState(false);
    const [lastBillId, setLastBillId] = useState(null);
    const [lastBillTotal, setLastBillTotal] = useState(0);
    const [activeTab, setActiveTab] = useState('products');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) setProducts(data.data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const selectType = (type) => {
        setBillingType(type);
        setCustomer(prev => ({ ...prev, type }));
    };

    const addToCart = (product) => {
        if (product.stock <= 0) return;
        setCart(prev => {
            const existing = prev.find(item => item.productId === product._id);
            if (existing) {
                if (existing.quantity >= product.stock) return prev;
                return prev.map(item =>
                    item.productId === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            const weight = product.bagWeight || parseInt(product.category) || 50;
            return [...prev, {
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: 1,
                maxStock: product.stock,
                bagWeight: weight
            }];
        });
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(item => item.productId !== id));

    const updateQuantity = (id, newQty) => {
        if (newQty < 1) return;
        setCart(prev => prev.map(item =>
            item.productId === id ? { ...item, quantity: Math.min(newQty, item.maxStock) } : item
        ));
    };

    const calculateTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const currentPaid = paidAmount === '' ? calculateTotal() : Number(paidAmount);
    const currentDue = calculateTotal() - currentPaid;
    const cgstAmt = Number(wsFields.cgst) || 0;
    const sgstAmt = Number(wsFields.sgst) || 0;
    const igstAmt = Number(wsFields.igst) || 0;
    const grandTotal = calculateTotal() + cgstAmt + sgstAmt + igstAmt;

    const handleCheckout = async () => {
        if (!customer.name) { toast.error('Please enter customer name'); return; }
        if (cart.length === 0) { toast.error('Cart is empty'); return; }

        setSubmitting(true);
        try {
            const payload = {
                customerName: customer.name,
                customerPhone: customer.phone,
                customerAddress: customer.address,
                customerType: customer.type,
                customerGstin: customer.gstin,
                customerCst: customer.cst,
                customerTin: customer.tin,
                ...(billingType === 'WHOLESALER' && {
                    bookNo: wsFields.bookNo,
                    vehicleNo: wsFields.vehicleNo,
                    supplierRef: wsFields.supplierRef,
                    hsnCode: wsFields.hsnCode,
                    cgst: cgstAmt,
                    sgst: sgstAmt,
                    igst: igstAmt,
                }),
                items: cart.map(item => ({
                    productId: item.productId,
                    productName: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    bagWeight: item.bagWeight || null,
                })),
                totalAmount: billingType === 'WHOLESALER' ? grandTotal : calculateTotal(),
                paidAmount: currentPaid,
                dueAmount: billingType === 'WHOLESALER' ? grandTotal - currentPaid : currentDue,
            };

            const res = await fetch('/api/bills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                setSuccess(true);
                setLastBillId(data.data._id);
                setLastBillTotal(data.data.totalAmount);
                toast.success('Bill Created Successfully!');
                setCart([]);
                setCustomer({ name: '', phone: '', address: '', type: billingType, gstin: '', cst: '', tin: '' });
                setWsFields({ bookNo: '', vehicleNo: '', supplierRef: '', hsnCode: '', cgst: '', sgst: '', igst: '' });
                fetchProducts();
            } else {
                toast.error(data.error);
            }
        } catch (error) {
            console.error('Checkout failed', error);
            toast.error('Checkout failed');
        } finally {
            setSubmitting(false);
        }
    };

    const startNewBill = () => {
        setSuccess(false);
        setLastBillId(null);
        setCart([]);
        setCustomer({ name: '', phone: '', address: '', type: billingType, gstin: '', cst: '', tin: '' });
        setWsFields({ bookNo: '', vehicleNo: '', supplierRef: '', hsnCode: '', cgst: '', sgst: '', igst: '' });
        setPaidAmount('');
        setBillingType(null);
    };

    const filteredProducts = products.filter(p =>
        p.stock > 0 && (
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // ─── Type selector modal ───────────────────────────────────────────────────
    if (!billingType) {
        return (
            <div className="flex items-center justify-center min-h-[70vh]">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-10 flex flex-col items-center gap-8 w-full max-w-md">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">New Bill</h1>
                        <p className="text-zinc-500 text-sm mt-1">Select the billing type to continue</p>
                    </div>
                    <div className="flex gap-6 w-full">
                        <button
                            onClick={() => selectType('RETAILER')}
                            className="flex-1 flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all group"
                        >
                            <Store className="w-10 h-10 text-blue-600 group-hover:scale-110 transition-transform" />
                            <div className="text-center">
                                <div className="font-bold text-blue-700 dark:text-blue-400 text-lg">Retailer</div>
                                <div className="text-xs text-zinc-500 mt-1">Purchase Bill</div>
                            </div>
                        </button>
                        <button
                            onClick={() => selectType('WHOLESALER')}
                            className="flex-1 flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-purple-500 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-all group"
                        >
                            <Building2 className="w-10 h-10 text-purple-600 group-hover:scale-110 transition-transform" />
                            <div className="text-center">
                                <div className="font-bold text-purple-700 dark:text-purple-400 text-lg">Wholesaler</div>
                                <div className="text-xs text-zinc-500 mt-1">Tax Invoice</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── Wholesaler invoice layout ─────────────────────────────────────────────
    if (billingType === 'WHOLESALER') {
        return (
            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] relative">
                {/* Left: Product picker */}
                <div className={`flex-1 flex flex-col gap-4 ${success ? 'hidden lg:flex' : ''} ${activeTab === 'products' ? 'flex' : 'hidden lg:flex'}`}>
                    <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                        <Search className="w-5 h-5 text-zinc-500" />
                        <input
                            placeholder="Search products..."
                            className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto overflow-x-hidden p-1 pb-20 lg:pb-1">
                        {filteredProducts.map(product => (
                            <div
                                key={product._id}
                                onClick={() => addToCart(product)}
                                className={`bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-pointer transition-all hover:border-purple-500 dark:hover:border-purple-500 ${product.stock === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-tight min-h-[2.8rem] mb-1">{product.name}</h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{product.category}</p>
                                <div className="mt-2 flex flex-wrap justify-between items-center gap-2">
                                    <span className="font-bold text-lg">₹{product.price.toFixed(2)}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${product.stock < 5 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                        {product.stock} left
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                    {cart.length > 0 && (
                        <div className="lg:hidden fixed bottom-4 left-4 right-4 bg-purple-700 text-white p-4 rounded-xl shadow-xl flex justify-between items-center z-50">
                            <div className="flex flex-col">
                                <span className="text-xs opacity-80">{cart.length} Items</span>
                                <span className="font-bold text-lg">₹{grandTotal.toFixed(2)}</span>
                            </div>
                            <button onClick={() => setActiveTab('invoice')} className="bg-white text-purple-700 px-4 py-2 rounded-lg font-bold text-sm">
                                View Invoice →
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Wholesaler TAX INVOICE */}
                <div className={`w-full lg:w-[820px] flex flex-col items-start lg:items-center overflow-y-auto overflow-x-hidden ${success ? 'block' : ''} ${activeTab === 'invoice' ? 'flex' : 'hidden lg:flex'}`}>
                    <div className="lg:hidden w-full mb-4 flex justify-start">
                        <button onClick={() => setActiveTab('products')} className="text-zinc-500 flex items-center gap-2 text-sm font-medium p-2 bg-white rounded-md shadow-sm border border-zinc-200">
                            ← Back to Products
                        </button>
                    </div>
                    {!success && activeTab === 'invoice' && cart.length > 0 && (
                        <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
                            <button onClick={handleCheckout} disabled={submitting} className="w-full bg-green-600 text-white p-4 rounded-xl shadow-xl font-bold text-lg flex justify-center items-center gap-2 disabled:opacity-50">
                                {submitting ? 'Saving...' : <><CheckCircle className="w-5 h-5" /> Finalize Bill (₹{grandTotal.toFixed(2)})</>}
                            </button>
                        </div>
                    )}

                    {success ? (
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 text-center w-full">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-gray-100">Bill Created Successfully!</h2>
                            <p className="text-zinc-500 mb-6">Grand Total: ₹{lastBillTotal.toFixed(2)}</p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                {lastBillId && (
                                    <Link href={`/bills/${lastBillId}`} target="_blank" className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-md hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors">
                                        <Printer className="w-4 h-4" /> Print Invoice
                                    </Link>
                                )}
                                <button onClick={startNewBill} className="px-6 py-3 border border-zinc-300 rounded-md hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">
                                    New Bill
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* ── Wholesaler TAX INVOICE paper ── */
                        <div className="bg-white shadow-lg p-0 w-full text-black print:shadow-none min-h-[1000px] min-w-[820px] flex flex-col border border-zinc-300">
                            <div className="border border-black m-4 flex-1 flex flex-col relative">
                                {/* Header */}
                                <div className="border-b-2 border-black text-center p-3 relative">
                                    <div className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider border border-black px-2 py-0.5">Tax Invoice</div>
                                    <h1 className="text-2xl font-black text-navy-900 tracking-tight uppercase" style={{ fontFamily: 'Times New Roman', color: '#1a237e' }}>MAGADH KRISHAK S.S.S LTD</h1>
                                    <p className="text-[11px] font-semibold mt-0.5">Sobh, Barachatti, Gaya (Bihar) 824201</p>
                                    <div className="flex justify-center gap-6 text-[10px] mt-1 font-medium">
                                        <span>GSTIN No. 10AABAM8791N1Z7</span>
                                        <span>Tin- 10204975017</span>
                                        <span>PAN No. BJPD0504L</span>
                                        <span>Mob. 9939408261</span>
                                    </div>
                                </div>

                                {/* Bill meta + Customer info */}
                                <div className="flex border-b border-black text-[11px]">
                                    {/* Left: Customer */}
                                    <div className="w-[55%] border-r border-black p-2 flex flex-col gap-1">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold w-28 shrink-0">Customer&apos;s Name</span>
                                            <input className="flex-1 border-b border-dotted border-black outline-none bg-transparent font-medium uppercase" style={{ fontFamily: 'Courier New' }}
                                                value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} placeholder="Name..." />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold w-28 shrink-0">Address</span>
                                            <input className="flex-1 border-b border-dotted border-black outline-none bg-transparent font-medium"
                                                value={customer.address} onChange={e => setCustomer({ ...customer, address: e.target.value })} placeholder="Address..." />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold w-28 shrink-0">Mobile</span>
                                            <input className="flex-1 border-b border-dotted border-black outline-none bg-transparent font-medium"
                                                value={customer.phone} onChange={e => setCustomer({ ...customer, phone: e.target.value })} placeholder="Phone..." />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold w-28 shrink-0">CST</span>
                                            <input className="flex-1 border-b border-dotted border-black outline-none bg-transparent font-medium"
                                                value={customer.cst} onChange={e => setCustomer({ ...customer, cst: e.target.value })} placeholder="CST No..." />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold w-28 shrink-0">TIN</span>
                                            <input className="flex-1 border-b border-dotted border-black outline-none bg-transparent font-medium"
                                                value={customer.tin} onChange={e => setCustomer({ ...customer, tin: e.target.value })} placeholder="TIN No..." />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold w-28 shrink-0">GSTIN ID</span>
                                            <input className="flex-1 border-b border-dotted border-black outline-none bg-transparent font-medium"
                                                value={customer.gstin} onChange={e => setCustomer({ ...customer, gstin: e.target.value })} placeholder="GSTIN..." />
                                        </div>
                                    </div>
                                    {/* Right: Bill meta */}
                                    <div className="w-[45%] p-2 flex flex-col gap-1">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold w-28 shrink-0">Book No.</span>
                                            <input className="flex-1 border-b border-dotted border-black outline-none bg-transparent font-medium"
                                                value={wsFields.bookNo} onChange={e => setWsFields({ ...wsFields, bookNo: e.target.value })} placeholder="Book No..." />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold w-28 shrink-0">Bill No. <span className="text-red-600">NEW</span></span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold w-28 shrink-0">Date</span>
                                            <span className="border-b border-dotted border-black flex-1">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold w-28 shrink-0">Vehicle No.</span>
                                            <input className="flex-1 border-b border-dotted border-black outline-none bg-transparent font-medium"
                                                value={wsFields.vehicleNo} onChange={e => setWsFields({ ...wsFields, vehicleNo: e.target.value })} placeholder="Vehicle No..." />
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold w-28 shrink-0">Supplier&apos;s ref</span>
                                            <input className="flex-1 border-b border-dotted border-black outline-none bg-transparent font-medium"
                                                value={wsFields.supplierRef} onChange={e => setWsFields({ ...wsFields, supplierRef: e.target.value })} placeholder="Ref..." />
                                        </div>
                                    </div>
                                </div>

                                {/* Table Header */}
                                <div className="flex border-b border-black text-[11px] font-bold bg-slate-100">
                                    <div className="w-[7%] p-1 border-r border-black text-center">S/N</div>
                                    <div className="w-[40%] p-1 border-r border-black text-center">Item Description</div>
                                    <div className="w-[15%] p-1 border-r border-black text-center">HSN Code</div>
                                    <div className="w-[10%] p-1 border-r border-black text-center">Qty(Bags)</div>
                                    <div className="w-[13%] p-1 border-r border-black text-center">Rate</div>
                                    <div className="w-[15%] p-1 text-center">Amount</div>
                                </div>

                                {/* Table Body */}
                                <div className="flex-1 flex flex-col relative text-[11px]">
                                    <div className="absolute inset-0 flex pointer-events-none z-0">
                                        <div className="w-[7%] border-r border-black h-full"></div>
                                        <div className="w-[40%] border-r border-black h-full"></div>
                                        <div className="w-[15%] border-r border-black h-full"></div>
                                        <div className="w-[10%] border-r border-black h-full"></div>
                                        <div className="w-[13%] border-r border-black h-full"></div>
                                        <div className="w-[15%] h-full"></div>
                                    </div>
                                    <div className="z-10 relative">
                                        {cart.map((item, index) => (
                                            <div key={item.productId} className="flex border-b border-black/10 hover:bg-yellow-50 group">
                                                <div className="w-[7%] p-1 text-center py-2">{index + 1}</div>
                                                <div className="w-[40%] p-1 pl-2 py-2 font-medium flex justify-between items-center">
                                                    <span className="truncate pr-2">{item.name}</span>
                                                    <button onClick={() => removeFromCart(item.productId)} className="text-red-500 opacity-0 group-hover:opacity-100 shrink-0">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <div className="w-[15%] p-1 text-center py-2">{wsFields.hsnCode || '—'}</div>
                                                <div className="w-[10%] p-1 text-center py-2 flex items-center justify-center gap-1">
                                                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="hover:text-red-500 text-gray-400 opacity-0 group-hover:opacity-100"><Minus className="w-3 h-3" /></button>
                                                    <span className="whitespace-nowrap text-[10px]">{item.bagWeight ? `${item.bagWeight}kg × ${item.quantity}` : item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="hover:text-green-500 text-gray-400 opacity-0 group-hover:opacity-100"><Plus className="w-3 h-3" /></button>
                                                </div>
                                                <div className="w-[13%] p-1 text-center py-2">₹{item.price}</div>
                                                <div className="w-[15%] p-1 text-right pr-2 py-2">₹{(item.price * item.quantity).toFixed(2)}</div>
                                            </div>
                                        ))}
                                        {Array.from({ length: Math.max(0, 12 - cart.length) }).map((_, i) => (
                                            <div key={`empty-${i}`} className="flex h-7">
                                                <div className="w-[7%]"></div><div className="w-[40%]"></div><div className="w-[15%]"></div>
                                                <div className="w-[10%]"></div><div className="w-[13%]"></div><div className="w-[15%]"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Footer totals */}
                                <div className="border-t border-black text-[11px]">
                                    {/* Subtotal */}
                                    <div className="flex border-b border-black">
                                        <div className="w-[72%] border-r border-black p-1 font-bold text-right">Total</div>
                                        <div className="w-[28%] p-1 text-right pr-2 font-bold">₹{calculateTotal().toFixed(2)}</div>
                                    </div>
                                    {/* CGST */}
                                    <div className="flex border-b border-black">
                                        <div className="w-[72%] border-r border-black p-1 text-right font-bold">CGST</div>
                                        <div className="w-[28%] p-1 flex items-center justify-end gap-1 pr-2">
                                            <input type="number" className="w-16 text-right border-b border-gray-300 focus:outline-none bg-transparent" placeholder="0" value={wsFields.cgst} onChange={e => setWsFields({ ...wsFields, cgst: e.target.value })} />
                                        </div>
                                    </div>
                                    {/* SGST */}
                                    <div className="flex border-b border-black">
                                        <div className="w-[72%] border-r border-black p-1 text-right font-bold">SGST</div>
                                        <div className="w-[28%] p-1 flex items-center justify-end gap-1 pr-2">
                                            <input type="number" className="w-16 text-right border-b border-gray-300 focus:outline-none bg-transparent" placeholder="0" value={wsFields.sgst} onChange={e => setWsFields({ ...wsFields, sgst: e.target.value })} />
                                        </div>
                                    </div>
                                    {/* IGST */}
                                    <div className="flex border-b border-black">
                                        <div className="w-[72%] border-r border-black p-1 text-right font-bold">IGST</div>
                                        <div className="w-[28%] p-1 flex items-center justify-end gap-1 pr-2">
                                            <input type="number" className="w-16 text-right border-b border-gray-300 focus:outline-none bg-transparent" placeholder="0" value={wsFields.igst} onChange={e => setWsFields({ ...wsFields, igst: e.target.value })} />
                                        </div>
                                    </div>
                                    {/* Due */}
                                    <div className="flex border-b border-black">
                                        <div className="w-[72%] border-r border-black p-1 text-right font-bold">
                                            Paid: <input type="number" className="w-20 text-right border-b border-gray-300 focus:outline-none bg-transparent ml-1" placeholder="Paid..." value={paidAmount} onChange={e => setPaidAmount(e.target.value)} />
                                        </div>
                                        <div className="w-[28%] p-1 text-right pr-2 font-bold text-red-600">Due: ₹{(grandTotal - currentPaid).toFixed(2)}</div>
                                    </div>
                                    {/* Grand Total */}
                                    <div className="flex border-b border-black bg-slate-100">
                                        <div className="w-[72%] border-r border-black p-1 text-right font-bold">Grand Total</div>
                                        <div className="w-[28%] p-1 text-right pr-2 font-bold">₹{grandTotal.toFixed(2)}</div>
                                    </div>
                                </div>

                                {/* Footer actions */}
                                <div className="h-20 p-2 flex justify-between items-end relative text-[11px] border-t border-black">
                                    <div>
                                        <div className="font-bold underline mb-1">E.&.O.E.</div>
                                        <div>Subject to Gaya jurisdiction only.</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="font-bold font-serif">For MAGADH KRISHAK S.S.S LTD</div>
                                        <button
                                            onClick={handleCheckout}
                                            disabled={submitting || cart.length === 0}
                                            className="bg-green-600 text-white px-6 py-2 rounded shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed print:hidden flex items-center gap-2"
                                        >
                                            {submitting ? 'Submitting...' : <><CheckCircle className="w-4 h-4" /> Finalize & Save Bill</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ─── Retailer invoice layout (original) ───────────────────────────────────
    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] relative">
            <div className={`flex-1 flex flex-col gap-4 ${success ? 'hidden lg:flex' : ''} ${activeTab === 'products' ? 'flex' : 'hidden lg:flex'}`}>
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <Search className="w-5 h-5 text-zinc-500" />
                    <input
                        placeholder="Search products..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 overflow-y-auto overflow-x-hidden p-1 pb-20 lg:pb-1">
                    {filteredProducts.map(product => (
                        <div
                            key={product._id}
                            onClick={() => addToCart(product)}
                            className={`bg-white dark:bg-zinc-950 p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-pointer transition-all hover:border-indigo-500 dark:hover:border-indigo-500 ${product.stock === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-tight min-h-[2.8rem] mb-1">{product.name}</h3>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">{product.category}</p>
                            <div className="mt-2 flex flex-wrap justify-between items-center gap-2">
                                <span className="font-bold text-lg">₹{product.price.toFixed(2)}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${product.stock < 5 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                    {product.stock} left
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                {cart.length > 0 && (
                    <div className="lg:hidden fixed bottom-4 left-4 right-4 bg-zinc-900 text-white p-4 rounded-xl shadow-xl flex justify-between items-center z-50 dark:bg-zinc-100 dark:text-zinc-900">
                        <div className="flex flex-col">
                            <span className="text-xs opacity-80">{cart.length} Items</span>
                            <span className="font-bold text-lg">₹{calculateTotal().toFixed(2)}</span>
                        </div>
                        <button onClick={() => setActiveTab('invoice')} className="bg-white text-zinc-900 px-4 py-2 rounded-lg font-bold text-sm dark:bg-zinc-900 dark:text-white">
                            View Bill →
                        </button>
                    </div>
                )}
            </div>

            <div className={`w-full lg:w-[800px] flex flex-col items-start lg:items-center overflow-y-auto overflow-x-hidden ${success ? 'block' : ''} ${activeTab === 'invoice' ? 'flex' : 'hidden lg:flex'}`}>
                <div className="lg:hidden w-full mb-4 flex justify-start">
                    <button onClick={() => setActiveTab('products')} className="text-zinc-500 flex items-center gap-2 text-sm font-medium p-2 bg-white rounded-md shadow-sm border border-zinc-200">
                        ← Back to Products
                    </button>
                </div>
                {!success && activeTab === 'invoice' && cart.length > 0 && (
                    <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
                        <button onClick={handleCheckout} disabled={submitting} className="w-full bg-green-600 text-white p-4 rounded-xl shadow-xl font-bold text-lg flex justify-center items-center gap-2 disabled:opacity-50">
                            {submitting ? 'Saving...' : <><CheckCircle className="w-5 h-5" /> Finalize Bill (₹{calculateTotal().toFixed(2)})</>}
                        </button>
                    </div>
                )}

                {success ? (
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 text-center w-full">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-gray-100">Bill Created Successfully!</h2>
                        <p className="text-zinc-500 mb-6">Total Amount: ₹{lastBillTotal.toFixed(2)}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {lastBillId && (
                                <Link href={`/bills/${lastBillId}`} target="_blank" className="flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-md hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors">
                                    <Printer className="w-4 h-4" /> Print Invoice
                                </Link>
                            )}
                            <button onClick={startNewBill} className="px-6 py-3 border border-zinc-300 rounded-md hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">
                                New Bill
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white shadow-lg p-0 w-full text-black print:shadow-none min-h-[900px] min-w-[800px] flex flex-col border border-zinc-300">
                        <div className="border border-black m-4 flex-1 flex flex-col relative">
                            <div className="border-b border-black text-center p-2 relative h-32 select-none">
                                <div className="absolute top-2 left-2 text-[10px] font-bold">GST No. - 10BKAPP5036Q1Z2</div>
                                <div className="absolute top-2 right-2 text-[10px] font-bold">Mob. 9939408261</div>
                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-[10px] font-bold underline">Purchase Bill</div>
                                <h1 className="text-3xl font-black text-slate-900 mt-6 tracking-tight uppercase scale-y-110" style={{ fontFamily: 'Times New Roman' }}>MAGADH KRISHI KENDRA</h1>
                                <p className="font-bold text-slate-800 text-xs mt-1">Near River Side, Sobh</p>
                            </div>
                            <div className="flex border-b border-black text-xs relative">
                                <div className="w-1/2 p-2 relative border-r border-black">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold w-10">No.</span>
                                            <span className="text-red-600 font-bold text-lg">NEW</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-[10px]">Mob.</span>
                                            <input type="text" className="w-24 border-b border-dotted border-black outline-none px-1 bg-transparent font-medium"
                                                value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="Phone..." />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold w-10 shrink-0">Name:</span>
                                        <input type="text" className="flex-1 border-b border-dotted border-black outline-none px-1 bg-transparent font-medium uppercase"
                                            style={{ fontFamily: 'Courier New' }}
                                            value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Customer Name..." />
                                    </div>
                                </div>
                                <div className="w-1/2 p-2 relative">
                                    <div className="flex gap-2 mb-1">
                                        <span className="font-bold w-12">Date :</span>
                                        <span className="border-b border-dotted border-black flex-1">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold w-12 shrink-0">Address:</span>
                                        <input type="text" className="flex-1 border-b border-dotted border-black outline-none px-1 bg-transparent font-medium"
                                            value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} placeholder="Address..." />
                                    </div>
                                </div>
                            </div>
                            <div className="flex border-b border-black text-xs font-bold bg-slate-100">
                                <div className="w-[8%] p-1 border-r border-black text-center">S.No.</div>
                                <div className="w-[52%] p-1 border-r border-black text-center">Particulars</div>
                                <div className="w-[12%] p-1 border-r border-black text-center">Qty(Bags)</div>
                                <div className="w-[13%] p-1 border-r border-black text-center">Rate</div>
                                <div className="w-[15%] p-1 text-center">Amount</div>
                            </div>
                            <div className="flex-1 flex flex-col relative text-xs">
                                <div className="absolute inset-0 flex pointer-events-none z-0">
                                    <div className="w-[8%] border-r border-black h-full"></div>
                                    <div className="w-[52%] border-r border-black h-full"></div>
                                    <div className="w-[12%] border-r border-black h-full"></div>
                                    <div className="w-[13%] border-r border-black h-full"></div>
                                    <div className="w-[15%] h-full"></div>
                                </div>
                                <div className="z-10 relative">
                                    {cart.map((item, index) => (
                                        <div key={item.productId} className="flex border-b border-black/10 hover:bg-yellow-50 group">
                                            <div className="w-[8%] p-1 text-center py-2">{index + 1}</div>
                                            <div className="w-[52%] p-1 pl-2 py-2 font-medium flex justify-between items-center">
                                                <span className="truncate pr-2">{item.name}</span>
                                                <button onClick={() => removeFromCart(item.productId)} className="text-red-500 opacity-0 group-hover:opacity-100 px-2 lg:opacity-0 opacity-100 shrink-0">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="w-[12%] p-1 text-center py-2 flex items-center justify-center gap-1">
                                                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="hover:text-red-500 text-gray-400 opacity-0 group-hover:opacity-100 lg:opacity-0 opacity-100"><Minus className="w-3 h-3" /></button>
                                                <span>{item.bagWeight}kg × {item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="hover:text-green-500 text-gray-400 opacity-0 group-hover:opacity-100 lg:opacity-0 opacity-100"><Plus className="w-3 h-3" /></button>
                                            </div>
                                            <div className="w-[13%] p-1 text-center py-2">₹{item.price}</div>
                                            <div className="w-[15%] p-1 text-right pr-2 py-2">₹{(item.price * item.quantity).toFixed(2)}</div>
                                        </div>
                                    ))}
                                    {cart.length < 10 && Array.from({ length: 15 - cart.length }).map((_, i) => (
                                        <div key={`empty-${i}`} className="flex h-8">
                                            <div className="w-[8%]"></div><div className="w-[52%]"></div><div className="w-[12%]"></div>
                                            <div className="w-[13%]"></div><div className="w-[15%]"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="border-t border-black text-xs bg-white z-10 relative">
                                <div className="flex border-b border-black">
                                    <div className="w-[72%] border-r border-black"></div>
                                    <div className="w-[13%] p-1 font-bold border-r border-black text-center bg-slate-50">Total</div>
                                    <div className="w-[15%] p-1 font-bold text-right pr-2">₹{calculateTotal().toFixed(2)}</div>
                                </div>
                                <div className="flex border-b border-black">
                                    <div className="w-[72%] border-r border-black text-right pr-2 font-bold">Paid</div>
                                    <div className="w-[13%] p-1 font-bold border-r border-black text-center bg-slate-50">Due</div>
                                    <div className="w-[15%] p-1 text-right pr-2 font-bold text-red-600">₹{currentDue.toFixed(2)}</div>
                                </div>
                                <div className="flex border-b border-black">
                                    <div className="w-[72%] border-r border-black text-right pr-1">
                                        <input type="number" className="w-20 text-right border-b border-gray-300 focus:outline-none focus:border-black bg-transparent"
                                            placeholder="Paid..." value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
                                    </div>
                                    <div className="w-[13%] p-1 font-bold border-r border-black text-center bg-slate-100">G.Total</div>
                                    <div className="w-[15%] p-1 font-bold text-right pr-2 bg-slate-100">₹{calculateTotal().toFixed(2)}</div>
                                </div>
                            </div>
                            <div className="h-28 p-2 flex justify-between items-end relative text-xs border-t border-black">
                                <div className="flex flex-col justify-between h-full w-2/3">
                                    <div>
                                        <div className="font-bold underline mb-1">E.&.O.E.</div>
                                        <div className="text-[10px]">Goods once sold will not taken back.</div>
                                        <div className="font-bold mt-1 text-[10px]">नोट - बीज बोने से पहले बीज का अंकुरण चेक कर लें।</div>
                                    </div>
                                    <button onClick={handleCheckout} disabled={submitting || cart.length === 0}
                                        className="mt-4 bg-green-600 text-white w-fit px-6 py-2 rounded shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed print:hidden flex items-center gap-2">
                                        {submitting ? 'Submitting...' : <><CheckCircle className="w-4 h-4" /> Finalize & Save Bill</>}
                                    </button>
                                </div>
                                <div className="text-center mb-4 mr-4">
                                    <div className="font-bold font-serif text-lg">Signature</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
