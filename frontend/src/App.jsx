import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom'
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
import { PortalAuthProvider } from './portal/PortalAuthContext'
import RequireRole from './portal/RequireRole'

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

/* RBAC portals (super admin / admin / vendor / customer account) — a
   separate app-like surface with its own auth, no storefront chrome. */
const SuperAdminLogin = lazy(() => import('./portal/pages/SuperAdminLogin'))
const SuperAdminDashboard = lazy(() => import('./portal/pages/SuperAdminDashboard'))
const AdminLogin = lazy(() => import('./portal/pages/AdminLogin'))
const AdminDashboard = lazy(() => import('./portal/pages/AdminDashboard'))
const VendorLogin = lazy(() => import('./portal/pages/VendorLogin'))
const VendorDashboard = lazy(() => import('./portal/pages/VendorDashboard'))
const AccountLogin = lazy(() => import('./portal/pages/AccountLogin'))
const AccountRegister = lazy(() => import('./portal/pages/AccountRegister'))
const AccountDashboard = lazy(() => import('./portal/pages/AccountDashboard'))
const ChangePasswordPage = lazy(() => import('./portal/pages/ChangePasswordPage'))

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

/** Storefront chrome (Navbar/Footer/BottomNav/assistant) — everything that isn't a portal route. */
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

/** One shared portal auth session across super-admin/admin/vendor/account routes. */
function PortalRoot () {
  return (
    <PortalAuthProvider>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </PortalAuthProvider>
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
                  <Routes>
                    <Route element={<PortalRoot />}>
                      <Route path='/super-admin/login' element={<SuperAdminLogin />} />
                      <Route
                        path='/super-admin'
                        element={<RequireRole role='super_admin' loginPath='/super-admin/login'><SuperAdminDashboard /></RequireRole>}
                      />
                      <Route path='/admin/login' element={<AdminLogin />} />
                      <Route
                        path='/admin'
                        element={<RequireRole role='admin' loginPath='/admin/login'><AdminDashboard /></RequireRole>}
                      />
                      <Route path='/vendor/login' element={<VendorLogin />} />
                      <Route
                        path='/vendor'
                        element={<RequireRole role='vendor' loginPath='/vendor/login'><VendorDashboard /></RequireRole>}
                      />
                      <Route path='/account/login' element={<AccountLogin />} />
                      <Route path='/account/register' element={<AccountRegister />} />
                      <Route
                        path='/account'
                        element={<RequireRole role='customer' loginPath='/account/login'><AccountDashboard /></RequireRole>}
                      />
                      <Route path='/change-password' element={<ChangePasswordPage />} />
                    </Route>
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
