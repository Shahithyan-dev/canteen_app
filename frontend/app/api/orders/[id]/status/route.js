import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Order from '@/lib/models/Order';
import { verifyToken, requireStaff } from '@/lib/auth';

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const authResult = await verifyToken(req);
    if (authResult.error) return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    
    const staffCheck = requireStaff(authResult.user);
    if (staffCheck) return NextResponse.json({ message: staffCheck.error }, { status: staffCheck.status });

    const body = await req.json();
    const { status } = body;
    const validStatuses = ['pending', 'preparing', 'ready', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: 'Invalid status.' }, { status: 400 });
    }

    const order = await Order.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!order) return NextResponse.json({ message: 'Order not found.' }, { status: 404 });

    // Socket.io removed for Vercel Serverless compatibility
    return NextResponse.json({ message: 'Status updated.', order }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update status.' }, { status: 500 });
  }
}
