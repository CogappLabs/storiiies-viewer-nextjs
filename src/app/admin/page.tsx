import Link from "next/link";
import { Header } from "@/components/ui";

const AdminDashboard = () => (
	<div className="min-h-screen bg-cogapp-cream">
		<Header title="Admin Dashboard" subtitle="Manage stories and settings" />
		<main className="max-w-4xl mx-auto p-8">
			<div className="grid gap-4">
				<Link
					href="/admin/storiiies"
					className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
				>
					<h2 className="text-lg font-semibold">Storiiies</h2>
					<p className="text-gray-600 mt-1">
						View and manage all stories in the database
					</p>
				</Link>
			</div>
		</main>
	</div>
);

export default AdminDashboard;
