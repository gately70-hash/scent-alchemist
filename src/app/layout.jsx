export const metadata = {
  title: 'Scent Alchemist | Fragrance Layering & Clone Synthesis',
  description: 'AI-assisted fragrance layering and reverse-dupe creator.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
