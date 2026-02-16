"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, Plus, Minus, Trash2, Printer, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'sonner';

export default function BillingPage() {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [paidAmount, setPaidAmount] = useState('');

    const [success, setSuccess] = useState(false);
    const [lastBillId, setLastBillId] = useState(null);
    const [lastBillTotal, setLastBillTotal] = useState(0);
    const componentRef = useRef();

    const quickFilters = ["UREA", "DAP", "MOP", "ATS"];

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = (product) => {
        if (product.stock <= 0) return;

        setCart(prev => {
            const existing = prev.find(item => item.productId === product._id);
            if (existing) {
                if (existing.quantity >= product.stock) return prev; // Don't exceed stock
                return prev.map(item =>
                    item.productId === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, {
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity: 1,
                maxStock: product.stock
            }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => item.productId !== id));
    };

    const updateQuantity = (id, newQty) => {
        if (newQty < 1) return;
        setCart(prev => prev.map(item => {
            if (item.productId === id) {
                return { ...item, quantity: Math.min(newQty, item.maxStock) };
            }
            return item;
        }));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleCheckout = async () => {
        if (!customer.name) {
            alert('Please enter customer name');
            return;
        }
        if (cart.length === 0) {
            alert('Cart is empty');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                customerName: customer.name,
                customerPhone: customer.phone,
                customerAddress: customer.address,
                items: cart.map(item => ({
                    productId: item.productId,
                    productName: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                totalAmount: calculateTotal(),
                paidAmount: currentPaid,
                dueAmount: currentDue
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
                toast.success('Submitted Successfully');
                // Don't clear cart immediately if printing? Usually clear after success.
                // Keeping it populated might be confusing. Let's clear and show success message.
                setCart([]);
                setCustomer({ name: '', phone: '', address: '' });
                fetchProducts(); // Refresh stock
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Checkout failed', error);
            alert('Checkout failed');
        } finally {
            setSubmitting(false);
        }
    };

    const startNewBill = () => {
        setSuccess(false);
        setLastBillId(null);
        setCart([]);
        setCustomer({ name: '', phone: '', address: '' });
        setPaidAmount('');
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Default paid amount to total if empty
    const currentPaid = paidAmount === '' ? calculateTotal() : Number(paidAmount);
    const currentDue = calculateTotal() - currentPaid;

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)]">
            {/* Left Side: Product Selection (Dark/Light mode native) */}
            <div className={`flex-1 flex flex-col gap-4 ${success ? 'hidden lg:flex' : ''}`}>
                <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
                    <Search className="w-5 h-5 text-zinc-500" />
                    <input
                        placeholder="Search products..."
                        className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    {quickFilters.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setSearchTerm(searchTerm === filter ? '' : filter)}
                            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${searchTerm === filter
                                ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100'
                                : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-700 dark:hover:bg-zinc-800'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto p-1">
                    {filteredProducts.map(product => (
                        <div
                            key={product._id}
                            onClick={() => addToCart(product)}
                            className={`bg-white dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-pointer transition-all hover:border-indigo-500 dark:hover:border-indigo-500 ${product.stock === 0 ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{product.name}</h3>
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
            </div>

            {/* Right Side: Invoice (Paper Style) */}
            <div className={`w-full lg:w-[800px] flex flex-col items-center overflow-y-auto ${success ? 'block' : ''}`}>
                {success ? (
                    <div className="bg-white dark:bg-zinc-950 p-8 rounded-xl shadow border border-zinc-200 dark:border-zinc-800 text-center w-full">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Bill Created Successfully!</h2>
                        <p className="text-zinc-500 mb-6">Total Amount: ₹{lastBillTotal.toFixed(2)}</p>
                        <div className="flex gap-4 justify-center">
                            {lastBillId && (
                                <Link href={`/bills/${lastBillId}`} target="_blank" className="flex items-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-md hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                                    <Printer className="w-4 h-4" /> Print Invoice
                                </Link>
                            )}
                            <button onClick={startNewBill} className="px-6 py-3 border border-zinc-300 rounded-md hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
                                New Bill
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white shadow-lg p-0 w-full text-black print:shadow-none min-h-[900px] flex flex-col border border-zinc-300">
                        <div className="border border-black m-4 flex-1 flex flex-col relative">
                            {/* Header */}
                            <div className="border-b border-black text-center p-2 relative h-32 select-none">
                                <div className="absolute top-2 left-2 text-[10px] font-bold">GST No. - 10BKAPP5036Q1Z2</div>
                                <div className="absolute top-2 right-2 text-[10px] font-bold">Mob. 9939408261</div>
                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-[10px] font-bold underline">Purchase Bill</div>

                                <h1 className="text-3xl font-black text-slate-900 mt-6 tracking-tight uppercase scale-y-110" style={{ fontFamily: 'Times New Roman' }}>MAGADH KRISHI KENDRA</h1>
                                <p className="font-bold text-slate-800 text-xs mt-1">Near River Side, Sobh</p>
                            </div>

                            {/* Bill Details Inputs */}
                            <div className="flex border-b border-black text-xs relative h-16">
                                <div className="w-1/2 p-2 relative border-r border-black">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold w-10">No.</span>
                                            <span className="text-red-600 font-bold text-lg">NEW</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold text-[10px]">Mob.</span>
                                            <input
                                                type="text"
                                                className="w-24 border-b border-dotted border-black outline-none px-1 bg-transparent font-medium"
                                                value={customer.phone}
                                                onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                                                placeholder="Phone..."
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold w-10">Name :</span>
                                        <input
                                            type="text"
                                            className="flex-1 border-b border-dotted border-black outline-none px-1 bg-transparent font-medium uppercase"
                                            style={{ fontFamily: 'Courier New' }}
                                            value={customer.name}
                                            onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="w-1/2 p-2 relative">
                                    <div className="flex gap-2 mb-1">
                                        <span className="font-bold w-12">Date :</span>
                                        <span className="border-b border-dotted border-black flex-1">{new Date().toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-bold w-12">Address :</span>
                                        <input
                                            type="text"
                                            className="flex-1 border-b border-dotted border-black outline-none px-1 bg-transparent font-medium"
                                            value={customer.address}
                                            onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Table Header */}
                            <div className="flex border-b border-black text-xs font-bold bg-slate-100">
                                <div className="w-[8%] p-1 border-r border-black text-center">S.No.</div>
                                <div className="w-[52%] p-1 border-r border-black text-center">Particulars</div>
                                <div className="w-[12%] p-1 border-r border-black text-center">Qty.</div>
                                <div className="w-[13%] p-1 border-r border-black text-center">Rate</div>
                                <div className="w-[15%] p-1 text-center">Amount</div>
                            </div>

                            {/* Table Body */}
                            <div className="flex-1 flex flex-col relative text-xs">
                                {/* Vertical Grid Lines */}
                                <div className="absolute inset-0 flex pointer-events-none z-0">
                                    <div className="w-[8%] border-r border-black h-full"></div>
                                    <div className="w-[52%] border-r border-black h-full"></div>
                                    <div className="w-[12%] border-r border-black h-full"></div>
                                    <div className="w-[13%] border-r border-black h-full"></div>
                                    <div className="w-[15%] h-full"></div>
                                </div>

                                {/* Cart Items */}
                                <div className="z-10 relative">
                                    {cart.map((item, index) => (
                                        <div key={item.productId} className="flex border-b border-black/10 hover:bg-yellow-50 group">
                                            <div className="w-[8%] p-1 text-center py-2">{index + 1}</div>
                                            <div className="w-[52%] p-1 pl-2 py-2 font-medium flex justify-between items-center">
                                                {item.name}
                                                <button onClick={() => removeFromCart(item.productId)} className="text-red-500 opacity-0 group-hover:opacity-100 px-2">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <div className="w-[12%] p-1 text-center py-2 flex items-center justify-center gap-1">
                                                <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="hover:text-red-500 text-gray-400 opacity-0 group-hover:opacity-100"><Minus className="w-3 h-3" /></button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="hover:text-green-500 text-gray-400 opacity-0 group-hover:opacity-100"><Plus className="w-3 h-3" /></button>
                                            </div>
                                            <div className="w-[13%] p-1 text-center py-2">₹{item.price}</div>
                                            <div className="w-[15%] p-1 text-right pr-2 py-2">₹{(item.price * item.quantity).toFixed(2)}</div>
                                        </div>
                                    ))}
                                    {/* Empty Rows Filler */}
                                    {cart.length < 10 && Array.from({ length: 15 - cart.length }).map((_, i) => (
                                        <div key={`empty-${i}`} className="flex h-8">
                                            <div className="w-[8%]"></div>
                                            <div className="w-[52%]"></div>
                                            <div className="w-[12%]"></div>
                                            <div className="w-[13%]"></div>
                                            <div className="w-[15%]"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Footer Totals */}
                            <div className="border-t border-black text-xs bg-white z-10 relative">
                                <div className="flex border-b border-black">
                                    <div className="w-[72%] border-r border-black"></div> {/* Spacing to align with Rate column roughly */}
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
                                        <input
                                            type="number"
                                            className="w-20 text-right border-b border-gray-300 focus:outline-none focus:border-black bg-transparent"
                                            placeholder="Paid..."
                                            value={paidAmount}
                                            onChange={(e) => setPaidAmount(e.target.value)}
                                        />
                                    </div>
                                    <div className="w-[13%] p-1 font-bold border-r border-black text-center bg-slate-100">G.Total</div>
                                    <div className="w-[15%] p-1 font-bold text-right pr-2 bg-slate-100">₹{calculateTotal().toFixed(2)}</div>
                                </div>
                            </div>

                            {/* Footer Terms & Checkout Button */}
                            <div className="h-28 p-2 flex justify-between items-end relative text-xs border-t border-black">
                                <div className="flex flex-col justify-between h-full w-2/3">
                                    <div>
                                        <div className="font-bold underline mb-1">E.&.O.E.</div>
                                        <div className="text-[10px]">Goods once sold will not taken back.</div>
                                        <div className="font-bold mt-1 text-[10px]">नोट - बीज बोने से पहले बीज का अंकुरण चेक कर लें।</div>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        disabled={submitting || cart.length === 0}
                                        className="mt-4 bg-green-600 text-white w-fit px-6 py-2 rounded shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed print:hidden flex items-center gap-2"
                                    >
                                        {submitting ? 'Submitting...' : (
                                            <>
                                                <CheckCircle className="w-4 h-4" /> Finalize & Save Bill
                                            </>
                                        )}
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
