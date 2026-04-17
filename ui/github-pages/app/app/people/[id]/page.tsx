import EmployeeProfileClient from './EmployeeProfileClient';

export async function generateStaticParams() {
  return [] as { id: string }[];
}

export default function EmployeeProfilePage() {
  return <EmployeeProfileClient />;
}
