import { Suspense, lazy, useEffect } from 'react'
import { HashRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { CatalogProvider, useCatalog } from './context/CatalogContext'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import Header from './components/Header'
import Footer from './components/Footer'
import CartDrawer from './components/CartDrawer'
import Toast from './components/Toast'
import Home from './pages/Home'
import Shop from './pages/Shop'
import ProductDetail from './pages/ProductDetail'
import Offers from './pages/Offers'
import Brands from './pages/Brands'
import About from './pages/About'
import Blogs from './pages/Blogs'
import Contact from './pages/Contact'
import ContainerPlan from './pages/ContainerPlan'
import { Login, Register } from './pages/Login'
import { Account, AccountInquiry, RequireAuth } from './pages/Account'
// Admin panel is split into its own chunk so shoppers never download it
const pick = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })))
const AdminLayout = lazy(() => import('./admin/AdminLayout'))
const Dashboard = pick(() => import('./admin/Dashboard'), 'Dashboard')
const CustomersAdmin = pick(() => import('./admin/Dashboard'), 'CustomersAdmin')
const InquiriesAdmin = pick(() => import('./admin/Inquiries'), 'InquiriesAdmin')
const InquiryAdmin = pick(() => import('./admin/Inquiries'), 'InquiryAdmin')
const MessagesAdmin = pick(() => import('./admin/Messages'), 'MessagesAdmin')
const ProductsAdmin = pick(() => import('./admin/Resources'), 'ProductsAdmin')
const ContainersAdmin = pick(() => import('./admin/Resources'), 'ContainersAdmin')
const CategoriesAdmin = pick(() => import('./admin/Resources'), 'CategoriesAdmin')
const BrandsAdmin = pick(() => import('./admin/Resources'), 'BrandsAdmin')
const PromotionsAdmin = pick(() => import('./admin/Resources'), 'PromotionsAdmin')
const BlogsAdmin = pick(() => import('./admin/Resources'), 'BlogsAdmin')

// Scroll to top on page change, or to a section anchor such as /about#facilities
function ScrollToTop() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    // Wait a frame for the page (and lazy content) to render before looking up the anchor
    // (instant: a smooth scroll gets cancelled while the new page is still settling)
    const t = setTimeout(() => {
      const el = document.getElementById(hash.slice(1))
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 150, behavior: 'instant' })
    }, 150)
    return () => clearTimeout(t)
  }, [pathname, hash])
  return null
}

function StoreLayout() {
  const { loading, error } = useCatalog()
  return (
    <>
      <div className="page-aura" />
      <Header />
      <main className="min-h-[60vh]">
        {error ? (
          <p className="mx-auto max-w-xl px-4 py-24 text-center text-rust">Couldn't load the catalogue: {error}</p>
        ) : loading ? (
          <div className="grid place-items-center py-32"><Loader2 className="h-8 w-8 animate-spin text-forest-700" /></div>
        ) : (
          <Outlet />
        )}
      </main>
      <Footer />
      <CartDrawer />
      <Toast />
    </>
  )
}

export default function App() {
  return (
    // HashRouter so the site works on any static host without rewrite rules
    <HashRouter>
      <CatalogProvider>
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            <Suspense fallback={<div className="grid min-h-screen place-items-center"><Loader2 className="h-8 w-8 animate-spin text-forest-700" /></div>}>
            <Routes>
              <Route element={<StoreLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/offers" element={<Offers />} />
                <Route path="/brands" element={<Brands />} />
                <Route path="/about" element={<About />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/container" element={<ContainerPlan />} />
                <Route path="/cart" element={<Navigate to="/container" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
                <Route path="/account/inquiries/:id" element={<RequireAuth><AccountInquiry /></RequireAuth>} />
                <Route path="*" element={<Home />} />
              </Route>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="inquiries" element={<InquiriesAdmin />} />
                <Route path="inquiries/:id" element={<InquiryAdmin />} />
                <Route path="messages" element={<MessagesAdmin />} />
                <Route path="products" element={<ProductsAdmin />} />
                <Route path="containers" element={<ContainersAdmin />} />
                <Route path="categories" element={<CategoriesAdmin />} />
                <Route path="brands" element={<BrandsAdmin />} />
                <Route path="promotions" element={<PromotionsAdmin />} />
                <Route path="blogs" element={<BlogsAdmin />} />
                <Route path="customers" element={<CustomersAdmin />} />
              </Route>
            </Routes>
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </CatalogProvider>
    </HashRouter>
  )
}
