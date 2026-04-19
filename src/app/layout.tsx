/** @format */

import { AuthProvider } from '@/components/providers/AuthProvider';
import './globals.css';
export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html>
			<body>
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
