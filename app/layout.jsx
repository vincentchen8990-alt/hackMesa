export const metadata = {
  title: 'HackMesa Project',
  description: 'Created for the hackathon',
}

export default function RootLayout({ children }) {
  return (
    <html lang="zh">
      <body>
        {children}
      </body>
    </html>
  )
}