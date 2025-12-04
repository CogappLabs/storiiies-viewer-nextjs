import Link from "next/link";
import { Header } from "@/components/ui";
import { getStrings } from "@/lib/i18n/strings";

const AdminDashboard = () => {
	const strings = getStrings();
	return (
		<div className="min-h-screen bg-cogapp-cream">
			<Header
				title={strings.app.adminTitle}
				subtitle={strings.app.adminSubtitle}
			/>
			<main className="max-w-4xl mx-auto p-8">
				<div className="grid gap-4">
					<Link
						href="/admin/storiiies"
						className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
					>
						<h2 className="text-lg font-semibold">
							{strings.viewers.storiiies}
						</h2>
						<p className="text-gray-600 mt-1">
							{strings.admin.cardDescription}
						</p>
					</Link>
				</div>
			</main>
		</div>
	);
};

export default AdminDashboard;
