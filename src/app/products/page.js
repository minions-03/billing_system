"use client";

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save } from 'lucide-react';

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        stock: '',
        bagWeight: ''
    });
    const [editingId, setEditingId] = useState(null);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            const url = editingId ? `/api/products/${editingId}` : '/api/products';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, stock: Number(formData.stock), price: Number(formData.price), bagWeight: Number(formData.bagWeight), category: String(formData.bagWeight) + 'KG' }),
            });
            const data = await res.json();

            if (data.success) {
                fetchProducts();
                setShowForm(false);
                setFormData({ name: '', price: '', stock: '', bagWeight: '' });
                setEditingId(null);
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Failed to save product', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (product) => {
        const weight = product.bagWeight || parseInt(product.category) || 50;
        setFormData({
            name: product.name,
            price: product.price,
            stock: product.stock,
            bagWeight: weight,
        });
        setEditingId(product._id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                fetchProducts();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Failed to delete product', error);
        }
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', price: '', stock: '', bagWeight: '' });
    };

    if (loading) return <div className="p-8 text-center">Loading products...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Products</h1>
                <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 h-10 px-4 py-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90"
                >
                    <Plus className="mr-2 h-4 w-4" /> Add Product
                </button>
            </div>

            {showForm && (
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">{editingId ? 'Edit Product' : 'New Product'}</h2>
                        <button onClick={cancelForm}><X className="h-5 w-5 text-zinc-500" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <input
                            name="name"
                            placeholder="Product Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                        />
                        <input
                            name="bagWeight"
                            type="number"
                            placeholder="Quantity(in kg)"
                            value={formData.bagWeight}
                            onChange={handleChange}
                            required
                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                        />
                        <input
                            name="price"
                            type="number"
                            placeholder="Price"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                        />
                        <input
                            name="stock"
                            type="number"
                            placeholder="Stock (Bags)"
                            value={formData.stock}
                            onChange={handleChange}
                            required
                            className="flex h-10 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:ring-offset-zinc-950 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                        />
                        <div className="col-span-full flex justify-end space-x-2">
                            <button type="button" onClick={cancelForm} className="px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 rounded-md hover:bg-zinc-50 dark:bg-zinc-950 dark:text-zinc-300 dark:border-zinc-800 dark:hover:bg-zinc-800">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save</>}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                <table className="w-full caption-bottom text-sm text-left min-w-[600px]">
                    <thead className="[&_tr]:border-b bg-zinc-50 dark:bg-zinc-900">
                        <tr className="border-b transition-colors data-[state=selected]:bg-zinc-100 dark:data-[state=selected]:bg-zinc-800">
                            <th className="h-12 px-4 align-middle font-medium text-zinc-500 dark:text-zinc-400">Name</th>
                            <th className="h-12 px-4 align-middle font-medium text-zinc-500 dark:text-zinc-400">Category</th>
                            <th className="h-12 px-4 align-middle font-medium text-zinc-500 dark:text-zinc-400 text-right">Price</th>
                            <th className="h-12 px-4 align-middle font-medium text-zinc-500 dark:text-zinc-400 text-right">Stock</th>
                            <th className="h-12 px-4 align-middle font-medium text-zinc-500 dark:text-zinc-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0 bg-white dark:bg-zinc-950">
                        {products.filter(p => p.stock > 0).length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-4 text-center text-zinc-500">No in-stock products found. Add stock or create a new product.</td>
                            </tr>
                        ) : (
                            products.filter(p => p.stock > 0).map((product) => (
                                <tr key={product._id} className="border-b transition-colors hover:bg-zinc-100/50 data-[state=selected]:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:data-[state=selected]:bg-zinc-800">
                                    <td className="p-4 align-middle font-medium">{product.name}</td>
                                    <td className="p-4 align-middle text-zinc-500">{product.category}</td>
                                    <td className="p-4 align-middle text-right">₹{product.price.toFixed(2)}</td>
                                    <td className={`p-4 align-middle text-right font-medium ${product.stock < 5 ? 'text-red-500' : 'text-zinc-500'}`}>
                                        <div>{product.stock} Bags</div>
                                        <div className="text-xs opacity-70">
                                            {((product.stock * (product.bagWeight || 50)) / 1000).toFixed(2)} MT
                                        </div>
                                    </td>
                                    <td className="p-4 align-middle text-right">
                                        <button onClick={() => handleEdit(product)} className="mr-2 p-2 hover:bg-zinc-100 rounded-md dark:hover:bg-zinc-800 text-zinc-500"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(product._id)} className="p-2 hover:bg-red-100 rounded-md dark:hover:bg-red-900/30 text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
