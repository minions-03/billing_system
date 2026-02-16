import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Bill from '@/models/Bill';
import { LayoutDashboard, Package, AlertTriangle, TrendingUp, FileText } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getStats() {
    await dbConnect();

    const productCount = await Product.countDocuments();
    const lowStockCount = await Product.countDocuments({ stock: { $lt: 5 } });
    const billCount = await Bill.countDocuments();

    // Calculate total available stock (Bags & MT) and breakdown
    const products = await Product.find({});
    let totalStockBags = 0;
    let totalStockMT = 0;
    const availableStockBreakdown = [];

    products.forEach(product => {
        totalStockBags += product.stock;
        const weight = product.bagWeight || 50;
        const mt = (product.stock * weight) / 1000;
        totalStockMT += mt;
        if (product.stock > 0) {
            availableStockBreakdown.push({
                name: product.name,
                bags: product.stock,
                mt: mt.toFixed(2)
            });
        }
    });

    // Calculate sold stock today and breakdown
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayBills = await Bill.find({
        createdAt: { $gte: startOfDay }
    }).populate('items.productId');

    let soldTodayBags = 0;
    let soldTodayMT = 0;
    const soldMap = {};

    todayBills.forEach(bill => {
        bill.items.forEach(item => {
            soldTodayBags += item.quantity;
            const weight = item.productId?.bagWeight || 50;
            const mt = (item.quantity * weight) / 1000;
            soldTodayMT += mt;

            const prodName = item.productName || item.productId?.name || 'Unknown';
            if (!soldMap[prodName]) {
                soldMap[prodName] = { bags: 0, mt: 0 };
            }
            soldMap[prodName].bags += item.quantity;
            soldMap[prodName].mt += mt;
        });
    });

    const soldTodayBreakdown = Object.entries(soldMap).map(([name, data]) => ({
        name,
        bags: data.bags,
        mt: data.mt.toFixed(2)
    }));


    // Calculate total sold stock (All Time)
    const totalSoldAgg = await Bill.aggregate([
        { $unwind: "$items" },
        {
            $lookup: {
                from: "products",
                localField: "items.productId",
                foreignField: "_id",
                as: "product"
            }
        },
        {
            $project: {
                name: { $ifNull: ["$items.productName", "Unknown"] },
                quantity: "$items.quantity",
                weight: { $ifNull: [{ $arrayElemAt: ["$product.bagWeight", 0] }, 50] }
            }
        },
        {
            $group: {
                _id: "$name",
                totalBags: { $sum: "$quantity" },
                totalMT: {
                    $sum: { $divide: [{ $multiply: ["$quantity", "$weight"] }, 1000] }
                }
            }
        }
    ]);

    let totalSoldBagsAllTime = 0;
    let totalSoldMTAllTime = 0;
    const totalSoldBreakdown = totalSoldAgg.map(item => {
        totalSoldBagsAllTime += item.totalBags;
        totalSoldMTAllTime += item.totalMT;
        return {
            name: item._id,
            bags: item.totalBags,
            mt: item.totalMT.toFixed(2)
        };
    });

    // Calculate total revenue
    const revenueData = await Bill.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: "$totalAmount" }
            }
        }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Get recent bills
    const recentBills = await Bill.find({})
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('items.productId', 'name');

    return {
        productCount,
        lowStockCount,
        billCount,
        totalRevenue,
        totalStockBags,
        totalStockMT,
        availableStockBreakdown,
        soldTodayBags,
        soldTodayMT,
        soldTodayBreakdown,
        totalSoldBagsAllTime,
        totalSoldMTAllTime,
        totalSoldBreakdown,
        recentBills: JSON.parse(JSON.stringify(recentBills)),
    };
}

export default async function DashboardPage() {
    const stats = await getStats();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Dashboard</h1>
                <div className="flex space-x-2">
                    <Link href="/billing" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 h-10 px-4 py-2 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90">
                        Create New Bill
                    </Link>
                    <Link href="/products" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-zinc-200 bg-white hover:bg-zinc-100 h-10 px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:text-zinc-50">
                        Manage Products
                    </Link>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card title="Total Products" value={stats.productCount} icon={Package} description="Active products in inventory" />
                <Card
                    title="Available Stock"
                    value={`${stats.totalStockBags} Bags`}
                    subValue={`(${stats.totalStockMT.toFixed(2)} MT)`}
                    breakdown={stats.availableStockBreakdown}
                    icon={Package}
                    description="Total stock in hand"
                />
                <Card
                    title="Sold Today"
                    value={`${stats.soldTodayBags} Bags`}
                    subValue={`(${stats.soldTodayMT.toFixed(2)} MT)`}
                    breakdown={stats.soldTodayBreakdown}
                    icon={TrendingUp}
                    description="Sales for today"
                />
                <Card
                    title="Total Sold Stock"
                    value={`${stats.totalSoldBagsAllTime} Bags`}
                    subValue={`(${stats.totalSoldMTAllTime.toFixed(2)} MT)`}
                    breakdown={stats.totalSoldBreakdown}
                    icon={TrendingUp}
                    description="All-time sales"
                />
                <Card title="Total Bills" value={stats.billCount} icon={FileText} description="Total invoices generated" />
                <Card title="Total Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} icon={TrendingUp} description="Lifetime revenue" />
                <Card title="Low Stock Alerts" value={stats.lowStockCount} icon={AlertTriangle} description="Products with < 5 items" alert={stats.lowStockCount > 0} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 rounded-xl border border-zinc-200 bg-white text-zinc-950 shadow dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold leading-none tracking-tight">Recent Transactions</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">Latest bills generated by the system.</p>
                    </div>
                    <div className="p-6 pt-0">
                        <div className="relative w-full overflow-auto">
                            <table className="w-full caption-bottom text-sm text-left">
                                <thead className="[&_tr]:border-b">
                                    <tr className="border-b transition-colors hover:bg-zinc-100/50 data-[state=selected]:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:data-[state=selected]:bg-zinc-800">
                                        <th className="h-12 px-4 align-middle font-medium text-zinc-500 dark:text-zinc-400">Customer</th>
                                        <th className="h-12 px-4 align-middle font-medium text-zinc-500 dark:text-zinc-400">Date</th>
                                        <th className="h-12 px-4 align-middle font-medium text-zinc-500 dark:text-zinc-400 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="[&_tr:last-child]:border-0">
                                    {stats.recentBills.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="p-4 text-center text-zinc-500">No recent bills found.</td>
                                        </tr>
                                    ) : (
                                        stats.recentBills.map((bill) => (
                                            <tr key={bill._id} className="border-b transition-colors hover:bg-zinc-100/50 data-[state=selected]:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:data-[state=selected]:bg-zinc-800">
                                                <td className="p-4 align-middle font-medium">{bill.customerName}</td>
                                                <td className="p-4 align-middle">{new Date(bill.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4 align-middle text-right">₹{bill.totalAmount.toFixed(2)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


function Card({ title, value, subValue, breakdown, icon: Icon, description, alert }) {
    return (
        <div className={`rounded-xl border bg-white text-zinc-950 shadow dark:bg-zinc-950 dark:text-zinc-50 ${alert ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'}`}>
            <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">{title}</h3>
                <Icon className={`h-4 w-4 ${alert ? 'text-red-500' : 'text-zinc-500 dark:text-zinc-400'}`} />
            </div>
            <div className="p-6 pt-0">
                <div className={`text-2xl font-bold ${alert ? 'text-red-600' : ''}`}>
                    {value}
                    {subValue && <span className="ml-2 text-lg font-normal text-zinc-500 dark:text-zinc-400">{subValue}</span>}
                </div>

                {/* Breakdown List */}
                {breakdown && breakdown.length > 0 && (
                    <div className="mt-3 space-y-1">
                        {breakdown.map((item, index) => (
                            <div key={index} className="text-xs text-zinc-600 dark:text-zinc-300 flex justify-between">
                                <span className="font-medium">{item.name}:</span>
                                <span>{item.bags} Bags ({item.mt} MT)</span>
                            </div>
                        ))}
                    </div>
                )}

                <p className={`text-xs text-zinc-500 dark:text-zinc-400 ${breakdown ? 'mt-3' : 'mt-1'}`}>{description}</p>
            </div>
        </div>
    );
}
