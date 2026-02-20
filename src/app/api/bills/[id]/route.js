import dbConnect from '@/lib/db';
import Bill from '@/models/Bill';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request, context) {
    await dbConnect();
    const { id } = await context.params;
    try {
        const bill = await Bill.findById(id);
        if (!bill) return NextResponse.json({ success: false, error: 'Bill not found' }, { status: 404 });
        return NextResponse.json({ success: true, data: bill });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function PATCH(request, context) {
    await dbConnect();
    const { id } = await context.params;

    try {
        const body = await request.json();
        const { amount } = body;

        if (!amount || isNaN(amount) || amount <= 0) {
            return NextResponse.json({ success: false, error: 'Invalid payment amount' }, { status: 400 });
        }

        const bill = await Bill.findById(id);
        if (!bill) {
            return NextResponse.json({ success: false, error: 'Bill not found' }, { status: 404 });
        }

        const newPaidAmount = (bill.paidAmount || 0) + Number(amount);
        const newDueAmount = bill.totalAmount - newPaidAmount;

        if (newDueAmount < 0) {
            return NextResponse.json({ success: false, error: 'Payment exceeds due amount' }, { status: 400 });
        }

        bill.paidAmount = newPaidAmount;
        bill.dueAmount = newDueAmount;
        await bill.save();

        return NextResponse.json({ success: true, data: bill });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
}
