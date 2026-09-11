import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import MenuItem from '@/lib/models/MenuItem';
import { verifyToken, requireStaff } from '@/lib/auth';

export async function GET(req, { params }) {
  try {
    await connectDB();
    const item = await MenuItem.findById(params.id);
    if (!item) return NextResponse.json({ message: 'Item not found.' }, { status: 404 });
    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to fetch item.' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const authResult = await verifyToken(req);
    if (authResult.error) return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    
    const staffCheck = requireStaff(authResult.user);
    if (staffCheck) return NextResponse.json({ message: staffCheck.error }, { status: staffCheck.status });

    const body = await req.json();
    const item = await MenuItem.findByIdAndUpdate(params.id, body, { new: true });
    if (!item) return NextResponse.json({ message: 'Item not found.' }, { status: 404 });
    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update item.' }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();
    const authResult = await verifyToken(req);
    if (authResult.error) return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    
    const staffCheck = requireStaff(authResult.user);
    if (staffCheck) return NextResponse.json({ message: staffCheck.error }, { status: staffCheck.status });

    const item = await MenuItem.findByIdAndDelete(params.id);
    if (!item) return NextResponse.json({ message: 'Item not found.' }, { status: 404 });
    return NextResponse.json({ message: 'Item deleted successfully.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to delete item.' }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    await connectDB();
    const authResult = await verifyToken(req);
    if (authResult.error) return NextResponse.json({ message: authResult.error }, { status: authResult.status });
    
    const staffCheck = requireStaff(authResult.user);
    if (staffCheck) return NextResponse.json({ message: staffCheck.error }, { status: staffCheck.status });

    const body = await req.json();
    const item = await MenuItem.findByIdAndUpdate(
      params.id,
      { available: body.available },
      { new: true }
    );
    return NextResponse.json({ item }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to update availability.' }, { status: 500 });
  }
}
