
'use client';

import { redirect } from 'next/navigation';

export default function AdminLayout() {
  // Redirect all attempts to access admin pages to the user dashboard.
  redirect('/dashboard');
}
