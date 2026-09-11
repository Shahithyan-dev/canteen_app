import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import { verifyToken, requireStaff } from '@/lib/auth';

async function generateOrderId() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `ORD-${dateStr}-`;

  const lastOrder = await Order.findOne(
    { orderId: { $regex: `^${prefix}` } },
    { orderId: 1 },
    { sort: { createdAt: -1 } }
  );

  let seq = 1;
  if (lastOrder) {
    const lastSeq = parseInt(lastOrder.orderId.split('-')[2]) || 0;
    seq = lastSeq + 1;
  }
  return `${prefix}${String(seq).padStart(5, '0')}`;
}

export async function POST(req) {
  try {
    await connectDB();
    const authResult = await verifyToken(req);
    if (authResult.error) return NextResponse.json({ message: authResult.error }, { status: authResult.status });

    const body = await req.json();
    const { items, totalAmount, specialInstructions } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'Cart is empty.' }, { status: 400 });
    }

    const orderId = await generateOrderId();

    const order = await Order.create({
      orderId,
      user: authResult.user._id,
      studentName: authResult.user.name,
      rollNo: authResult.user.rollNo,
      classSection: authResult.user.classSection,
      department: authResult.user.department,
      items,
      totalAmount,
      specialInstructions: specialInstructions || '',
    });

    // Socket.io removed for Vercel Serverless compatibility
    return NextResponse.json({ message: 'Order placed!', order }, { status: 201 });
  } catch (error) {
    console.error('Order error:', error);
    return NextResponse.json({ message: 'Failed to place order.' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const authResult = await verifyToken(req);
    if (authResult.error) return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    
    const staffCheck = requireStaff(authResult.user);
    if (staffCheck) return NextResponse.json({ message: staffCheck.error }, { status: staffCheck.status });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const date = searchParams.get('date');
    
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.createdAt = { $gte: start, $lte: end };
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ orders }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch orders.' }, { status: 500 });
  }
}
