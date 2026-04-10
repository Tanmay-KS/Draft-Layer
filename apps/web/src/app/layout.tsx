import ReduxProvider from '../providers/ReduxProvider';
import { Toaster } from 'react-hot-toast';

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
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              borderRadius: '8px',
              background: '#1e293b',
              color: '#f1f5f9',
              fontSize: '14px',
              padding: '12px 16px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#f1f5f9' },
              duration: 3000,
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' },
              duration: 4000,
            },
          }}
        />
      </body>
    </html>
  );
}
