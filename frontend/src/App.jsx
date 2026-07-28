import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from './lib/queryClient'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import { AuthProvider } from './context/AuthContext'
import { AddressProvider } from './context/AddressContext'
import { OrdersProvider } from './context/OrdersContext'
import { pageTransition } from './utils/motion'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import BottomNav from './components/layout/BottomNav'

import HomePage from './pages/HomePage'

/* Everything below the landing page loads on demand, which keeps the
   initial bundle small. The assistant is split out for the same reason. */
const ShopAssistant = lazy(() => import('./components/assistant/ShopAssistant'))
const QuickPage = lazy(() => import('./pages/QuickPage'))
const ProductListPage = lazy(() => import('./pages/ProductListPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const WishlistPage = lazy(() => import('./pages/WishlistPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'))
const OrdersPage = lazy(() => import('./pages/OrdersPage'))
const AiTestPage = lazy(() => import('./pages/AiTestPage'))

/* The entire multi-tenant SaaS portal loads on demand — none of its code
   (auth, tables, forms) touches the public storefront bundle. */
const PortalApp = lazy(() => import('./portal/PortalApp'))

/* Query Devtools are dev-only — the import is dropped from production builds. */
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import('@tanstack/react-query-devtools').then(m => ({ default: m.ReactQueryDevtools })))
  : () => null

/** Scroll to top on every route change (mirrors real e-comm behaviour). */
function ScrollToTop () {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, search])
  return null
}

/** Wraps each page in a shared enter/exit transition. */
function Page ({ children }) {
  return (
    <motion.main
      variants={pageTransition}
      initial='initial'
      animate='animate'
      exit='exit'
      className='min-h-[60vh]'
    >
      {/* scoped per route so a lazy page never blanks the whole shell */}
      <Suspense fallback={<div className='min-h-[60vh]' />}>{children}</Suspense>
    </motion.main>
  )
}

function AnimatedRoutes () {
  const location = useLocation()
  return (
    <AnimatePresence mode='wait' initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path='/' element={<Page><HomePage /></Page>} />
        <Route path='/quick' element={<Page><QuickPage /></Page>} />
        <Route path='/products' element={<Page><ProductListPage /></Page>} />
        <Route path='/product/:id' element={<Page><ProductDetailPage /></Page>} />
        <Route path='/cart' element={<Page><CartPage /></Page>} />
        <Route path='/wishlist' element={<Page><WishlistPage /></Page>} />
        <Route path='/checkout' element={<Page><CheckoutPage /></Page>} />
        <Route path='/order-success' element={<Page><OrderSuccessPage /></Page>} />
        <Route path='/orders' element={<Page><OrdersPage /></Page>} />
        <Route path='/ai-test' element={<Page><AiTestPage /></Page>} />
        <Route path='*' element={<Page><HomePage /></Page>} />
      </Routes>
    </AnimatePresence>
  )
}

/** The public storefront shell — navbar, footer, assistant, and its routes. */
function StorefrontShell () {
  return (
    <div className='flex min-h-dvh flex-col'>
      <Navbar />
      <div className='flex-1'>
        <AnimatedRoutes />
      </div>
      <Footer />
      <BottomNav />
      <Suspense fallback={null}>
        <ShopAssistant />
      </Suspense>
    </div>
  )
}

export default function App () {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AddressProvider>
            <OrdersProvider>
              <CartProvider>
                <WishlistProvider>
                  <ScrollToTop />

                  {/* The SaaS portal owns its own full-screen chrome, so it is a
                      sibling of the storefront rather than nested inside it. */}
                  <Routes>
                    <Route
                      path='/portal/*'
                      element={
                        <Suspense fallback={<div className='grid min-h-dvh place-items-center bg-slate-50 text-sm text-slate-400'>Loading portal…</div>}>
                          <PortalApp />
                        </Suspense>
                      }
                    />
                    <Route path='/*' element={<StorefrontShell />} />
                  </Routes>

                  {/* Sits above BottomNav on mobile so it never covers the tab bar. */}
                  <Toaster
                    position='bottom-center'
                    offset={80}
                    mobileOffset={88}
                    duration={2600}
                    richColors
                    closeButton
                    toastOptions={{
                      classNames: {
                        toast: 'rounded-full! border-none! bg-royal-950/95! text-white! shadow-2xl! backdrop-blur',
                        description: 'text-white/70!'
                      }
                    }}
                  />
                </WishlistProvider>
              </CartProvider>
            </OrdersProvider>
          </AddressProvider>
        </AuthProvider>
      </BrowserRouter>
      <Suspense fallback={null}>
        <ReactQueryDevtools initialIsOpen={false} buttonPosition='bottom-left' />
      </Suspense>
    </QueryClientProvider>
  )
}
