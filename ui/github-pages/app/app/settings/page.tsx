'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function SystemSettingsPage() { const r = useRouter(); useEffect(() => { r.replace('/app/admin'); }, [r]); return null; }
