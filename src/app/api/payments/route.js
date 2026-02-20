import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const search = searchParams.get('search') || '';
        const modeFilter = searchParams.get('modeFilter') || 'ALL';
        const statusFilter = searchParams.get('statusFilter') || 'ALL';

        // Build query
        const query = {};
        if (search) {
            query.$or = [
                { companyName: { $regex: search, $options: 'i' } },
                { referenceNo: { $regex: search, $options: 'i' } },
                { note: { $regex: search, $options: 'i' } },
            ];
        }
        if (modeFilter !== 'ALL') query.paymentMode = modeFilter;
        if (statusFilter !== 'ALL') query.status = statusFilter;

        const total = await Payment.countDocuments(query);
        const totalPages = Math.ceil(total / limit) || 1;
        const skip = (page - 1) * limit;

        const payments = await Payment.find(query)
            .sort({ date: -1 })
            .skip(skip)
            .limit(limit);

        // Global stats (unfiltered) for summary cards
        const pendingCount = await Payment.countDocuments({ status: 'PENDING' });
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const allTimeTotalAgg = await Payment.aggregate([
            { $match: { status: 'COMPLETED' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const allTimeTotal = allTimeTotalAgg[0]?.total || 0;
        const thisMonthAgg = await Payment.aggregate([
            { $match: { status: 'COMPLETED', date: { $gte: monthStart } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const thisMonthTotal = thisMonthAgg[0]?.total || 0;

        return NextResponse.json({
            success: true,
            data: payments,
            totalPages,
            currentPage: page,
            total,
            pendingCount,
            allTimeTotal,
            thisMonthTotal,
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function POST(request) {
    await dbConnect();
    try {
        const body = await request.json();
        // If amount is 0 or empty and mode is CHEQUE, mark as PENDING automatically
        const amount = Number(body.amount) || 0;
        const status = (amount === 0 && body.paymentMode === 'CHEQUE') ? 'PENDING' : (body.status || 'COMPLETED');
        const payment = await Payment.create({ ...body, amount, status });
        return NextResponse.json({ success: true, data: payment }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

// Update amount (and optionally other fields) for a payment — used for filling blank cheques
export async function PATCH(request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });

        const body = await request.json();
        const update = { ...body };

        // If a non-zero amount is provided, mark as COMPLETED
        if (update.amount !== undefined) {
            update.amount = Number(update.amount);
            if (update.amount > 0) update.status = 'COMPLETED';
        }

        const payment = await Payment.findByIdAndUpdate(id, update, { new: true });
        if (!payment) return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 });

        return NextResponse.json({ success: true, data: payment });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function DELETE(request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ success: false, error: 'ID required' }, { status: 400 });
        await Payment.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
