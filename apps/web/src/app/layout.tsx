import ReduxProvider from '../providers/ReduxProvider';

export const metadata = {
  title: 'Draft-Layer',
  description: 'Email Builder',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
