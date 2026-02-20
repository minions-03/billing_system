import dbConnect from '@/lib/db';
import Bill from '@/models/Bill';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    await dbConnect();

    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const search = searchParams.get('search') || '';
        const filter = searchParams.get('filter') || 'ALL';       // ALL | PAID | DUE
        const typeFilter = searchParams.get('typeFilter') || 'ALL'; // ALL | RETAILER | WHOLESALER

        // Build query
        const query = {};

        if (search) {
            const orConditions = [
                { customerName: { $regex: search, $options: 'i' } },
            ];
            const numericSearch = Number(search);
            if (!isNaN(numericSearch) && search.trim() !== '') {
                orConditions.push({ billNumber: numericSearch });
            }
            query.$or = orConditions;
        }

        if (typeFilter === 'WHOLESALER') {
            query.customerType = 'WHOLESALER';
        } else if (typeFilter === 'RETAILER') {
            // Match explicit RETAILER docs OR docs with no customerType (default is RETAILER)
            query.$and = [...(query.$and || []), {
                $or: [{ customerType: 'RETAILER' }, { customerType: { $exists: false } }, { customerType: null }]
            }];
        }

        if (filter === 'PAID') {
            query.$and = [...(query.$and || []), { $or: [{ dueAmount: { $lte: 0 } }, { dueAmount: { $exists: false } }] }];
        } else if (filter === 'DUE') {
            query.$and = [...(query.$and || []), { dueAmount: { $gt: 0 } }];
        }

        const total = await Bill.countDocuments(query);
        const totalPages = Math.ceil(total / limit) || 1;
        const skip = (page - 1) * limit;

        const bills = await Bill.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return NextResponse.json({ success: true, data: bills, totalPages, currentPage: page, total });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request) {
    await dbConnect();

    try {
        const body = await request.json();
        const { items } = body;

        // Validate stock and calculate total
        let calculatedTotal = 0;

        // We need to check stock for each item
        for (const item of items) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return NextResponse.json({ success: false, error: `Product not found: ${item.productName}` }, { status: 404 });
            }
            if (product.stock < item.quantity) {
                return NextResponse.json({ success: false, error: `Insufficient stock for ${product.name}` }, { status: 400 });
            }
            calculatedTotal += product.price * item.quantity;
        }

        // Attempt to create bill and update stocks
        // Ideally this should be a transaction, but for simplicity with standalone/single-node MongoDB, we'll do it sequentially
        // If using a replica set (Atlas), transactions are supported.

        // Update stocks
        for (const item of items) {
            await Product.findByIdAndUpdate(item.productId, {
                $inc: { stock: -item.quantity }
            });
        }

        // Generate sequential bill number
        const lastBill = await Bill.findOne().sort({ billNumber: -1 });
        const nextBillNumber = lastBill && lastBill.billNumber ? lastBill.billNumber + 1 : 1;

        const paidAmount = Number(body.paidAmount) || 0;
        const dueAmount = calculatedTotal - paidAmount;

        const bill = await Bill.create({
            ...body,
            totalAmount: calculatedTotal,
            paidAmount,
            dueAmount,
            billNumber: nextBillNumber
        });

        return NextResponse.json({ success: true, data: bill }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
