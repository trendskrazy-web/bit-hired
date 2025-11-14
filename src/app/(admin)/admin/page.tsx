'use client';
import { redirect } from 'next/navigation';

export default function AdminRootPage() {
  // Redirect to the main admin dashboard page
  redirect('/admin/transactions');
}
