'use client'
import { Inter } from 'next/font/google'
import { Provider } from 'react-redux'
import { store } from './store'
import Header from './components/Header'
import Footer from './components/Footer'
import Toast from './components/Toast'
import CartHydration from './store/CartHydration'
import './globals.css'

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800', '900'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>DAX — Premium Men&apos;s Fashion | Lebanon</title>
        <meta name="description" content="DAX - Premium men's clothing store in Lebanon. Shop jeans, t-shirts, hoodies, jackets and more. Fast delivery all over Lebanon." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Provider store={store}>
          <CartHydration>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <Toast />
          </CartHydration>
        </Provider>
      </body>
    </html>
  )
}
