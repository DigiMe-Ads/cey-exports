// Mock catalogue for the design preview. Product lines, brands, facilities and contact details
// come from the Cey Exports company profile; prices are placeholders.
const img = (name) => `/images/${name}.jpg`
const cey = (name, ext = 'jpg') => `/cey/${name}.${ext}`
const logo = (name) => `/cey/brands/${name}.png`

export const company = {
  name: 'Cey Exports',
  legal: 'Ceylon International Exports (Pvt) Ltd',
  parent: 'Lanka Foods Middle East LLC',
  tagline: "Sri Lanka's finest, sourced for the world.",
  site: 'www.ceyexports.com',
  offices: [
    {
      region: 'Sri Lanka',
      name: 'Ceylon International Exports (Pvt) Ltd',
      kind: 'Office & Warehouse',
      address: 'No. 71 D, Puttalam Road, Mahakeliya, Kurunegala, Sri Lanka',
      phone: '+94 76 104 0713',
      email: 'bandu@ceyexports.com',
      web: 'www.ceyexports.com',
      logo: cey('logo-round', 'png'),
    },
    {
      region: 'United Arab Emirates · Parent',
      name: 'Lanka Foods Middle East LLC',
      kind: 'Office & Warehouse',
      address: 'A 22, Al Neyli Building, Maliha Road, Industrial Area 13, United Arab Emirates',
      phone: '+971 50 163 9820',
      email: 'malik@lankafoods.ae',
      web: 'www.lankafoods.ae',
      logo: cey('lankafoods-logo', 'png'),
    },
  ],
  stats: [
    { value: '31', label: 'acres of company farmland in Kandy' },
    { value: '25,000', label: 'sq ft poly tunnel complex for protected cultivation' },
    { value: '5+', label: 'containers of secure storage at Kurunegala' },
    { value: '30+', label: 'leading Sri Lankan brands consolidated' },
  ],
  pillars: [
    { no: '01', title: 'Dry Foods & Spices', body: 'Cinnamon, cloves, black pepper, cardamom, nutmeg and rice, sourced through long-standing grower relationships.', image: cey('pepper'), to: '/shop?category=spices' },
    { no: '02', title: 'Branded & Private Label', body: 'Consolidation and export of leading Sri Lankan brands, plus private-label packing for overseas buyers.', image: cey('own-poster'), to: '/brands' },
    { no: '03', title: 'Fresh Fruits & Vegetables', body: 'Year-round poly tunnel production in Kandy and fresh produce processed at our Meegoda unit.', image: cey('fruits'), to: '/shop?category=fresh' },
  ],
  values: [
    { no: '01', title: 'Authenticity', body: 'Promoting true Sri Lankan heritage and quality in every product we carry.' },
    { no: '02', title: 'Sustainability', body: 'Supporting local farmers and ethical sourcing across our grower network.' },
    { no: '03', title: 'Reliability', body: 'Ensuring on-time delivery and consistent standards, order after order.' },
    { no: '04', title: 'Innovation', body: 'Expanding our product portfolio to meet global consumer needs.' },
  ],
  facilities: [
    { place: 'Kurunegala', title: 'Main Warehouse', body: 'Our collection and storage hub, with secure capacity for more than five containers and full loading for large trucks and containers.', image: cey('warehouse') },
    { place: 'Kandy', title: 'Farm & Poly Tunnels', body: 'A 31-acre landholding plus a 25,000 sq ft poly tunnel complex for protected cultivation of export-grade vegetables.', image: cey('polytunnel') },
    { place: 'Meegoda', title: 'Processing Unit', body: 'Collection and processing capabilities for fresh fruits and vegetables.', image: cey('bananas') },
    { place: 'Island-wide', title: 'Logistics Fleet', body: 'Company vehicles for local collection, with Scanwell Logistics engaged for export freight and customs handling.', image: cey('van') },
  ],
  process: [
    { step: 'Source', body: 'Direct from our grower network and own farms' },
    { step: 'Collect', body: 'Company vehicles bring stock to our hubs' },
    { step: 'Inspect', body: 'Quality inspection before every shipment' },
    { step: 'Pack & store', body: 'Packing, consolidation and secure storage' },
    { step: 'Ship', body: 'Freight and customs coordinated to destination' },
  ],
  gallery: [
    { image: cey('greenhouse'), caption: 'Poly tunnels · Kandy', tall: true },
    { image: cey('container'), caption: 'Container loading · Kurunegala' },
    { image: cey('fruits'), caption: 'Fresh produce · Meegoda' },
    { image: cey('rice-sacks'), caption: 'Rice consolidation' },
    { image: cey('farmers'), caption: 'Our grower network' },
    { image: cey('uae-van'), caption: 'Lanka Foods · UAE' },
    { image: cey('boxes'), caption: 'Ready for dispatch' },
    { image: cey('expo'), caption: 'Meeting buyers in the Gulf' },
    { image: cey('packing'), caption: 'Private-label packing' },
  ],
}

export const categories = [
  { slug: 'spices', name: 'Spices & Dry Foods', image: cey('own-spices') },
  { slug: 'rice-grains', name: 'Rice & Grains', image: img('keeri-samba') },
  { slug: 'beverages', name: 'Beverages', image: cey('own-gingerbev') },
  { slug: 'tea-coffee', name: 'Tea & Coffee', image: img('milk-tea') },
  { slug: 'snacks', name: 'Snacks & Soya', image: cey('own-lankasoy') },
  { slug: 'preserved', name: 'Canned & Preserved', image: cey('own-mackerel') },
  { slug: 'fresh', name: 'Fresh Fruits & Veg', image: cey('bananas') },
  { slug: 'wellness', name: 'Wellness & Home', image: img('siddhalepa-balm') },
]

// Brands consolidated by Cey Exports (logos from the company profile)
const B = (slug, name, extra = {}) => ({ slug, name, logo: logo(slug), ...extra })
export const brands = [
  { slug: 'cey', name: 'Cey Exports', logo: cey('globe', 'png'), own: true, tagline: 'Our own spices, produce and private label.' },
  { slug: 'lanka-foods', name: 'Lanka Foods', logo: cey('lankafoods-logo', 'png'), own: true, tagline: 'Our very own Sri Lankan products — now in the UAE.' },
  B('elephant-house', 'Elephant House', { featured: true, tagline: 'Iconic Sri Lankan soft drinks since 1866.' }),
  B('highland', 'Highland', { featured: true, tagline: 'Fresh dairy from the hills of Sri Lanka.' }),
  B('araliya', 'Araliya Rice', { featured: true, tagline: 'Premium Sri Lankan rice varieties.' }),
  B('kist', 'Cargills Kist', { featured: true, tagline: 'Jams, cordials and sauces loved island-wide.' }),
  B('wijaya', 'Wijaya Products', { featured: true, tagline: 'Spices and condiments since 1989.' }),
  B('amg', 'AMG Premium', { featured: true, tagline: 'Premium rice, flour and tea blends.' }),
  B('siddhalepa', 'Siddhalepa', { featured: true, tagline: 'Ayurvedic care trusted for generations.' }),
  B('maliban', 'Maliban', { featured: true, tagline: 'Inspiring goodness since 1954.' }),
  B('lankasoy', 'CBL Lankasoy', { tagline: 'All the goodness, all the joy.' }),
  B('munchee', 'CBL Munchee'),
  B('kotmale', 'Kotmale'),
  B('harischandra', 'Harischandra'),
  B('pussalla', 'Pussalla', { tagline: 'Natural Ceylon cinnamon home fragrance.' }),
  B('serendib', 'Serendib'),
  B('zara', 'Zara'),
  B('ariya', 'Ariya'),
  B('prima', 'Prima'),
  B('cream-soda', 'Cream Soda'),
  B('egb', 'EGB'),
  B('necto', 'Necto'),
  B('orange-crush', 'Orange Crush'),
  B('maggi', 'Maggi'),
  B('hemas', 'Hemas'),
  B('milo', 'Milo'),
  B('delta', 'Delta'),
  B('wawa', 'Wawa'),
  B('samahan', 'Samahan'),
  B('clogard', 'Clogard'),
  B('nestomalt', 'Nestomalt'),
  B('chandanalepa', 'Chandanalepa'),
]

const P = (id, name, brand, category, price, image, extra = {}) => ({
  id, slug: id, name, brand, category, price, image,
  rating: extra.rating ?? 4 + ((id.length * 7) % 10) / 10,
  reviews: extra.reviews ?? ((id.length * 13) % 90) + 4,
  stock: extra.stock ?? 24,
  ...extra,
})

export const products = [
  P('ceylon-cinnamon', 'Ceylon Cinnamon Quills – Alba Grade 500g', 'cey', 'spices', 38, cey('own-spices'), { compareAt: 45, isNew: true, pack: '500 g · case of 20', tags: ['featured', 'best'] }),
  P('black-pepper', 'Black Pepper Whole – Export Grade 1kg', 'cey', 'spices', 32, cey('pepper'), { pack: '1 kg · case of 12', tags: ['featured', 'best'] }),
  P('chilli-pieces', 'Wijaya Chilli Pieces | Quality Dried Chilli', 'wijaya', 'spices', 6.75, img('chilli-pieces'), { pack: '100 g · case of 48', tags: ['featured'] }),
  P('goraka-cream', 'Wijaya Goraka Cream – 250g', 'wijaya', 'spices', 8.5, img('goraka-cream'), { pack: '250 g · case of 24', tags: ['best'] }),
  P('keeri-samba', 'AMG Keeri Samba Rice 5kg', 'amg', 'rice-grains', 10.5, img('keeri-samba'), { compareAt: 11.5, pack: '5 kg · bale of 4', tags: ['featured', 'best'] }),
  P('white-raw-rice', 'AMG White Raw Rice 5kg', 'amg', 'rice-grains', 8.5, img('white-raw-rice'), { compareAt: 9, pack: '5 kg · bale of 4', tags: ['featured'] }),
  P('red-raw-rice', 'AMG Red Raw Rice 5kg', 'amg', 'rice-grains', 8.5, img('red-raw-rice'), { pack: '5 kg · bale of 4', tags: ['best'] }),
  P('string-hopper-flour', 'AMG White String Hopper Flour 700g', 'amg', 'rice-grains', 8.5, img('string-hopper-flour'), { pack: '700 g · case of 20' }),
  P('amg-milk-tea', 'AMG Ceylon Milk Tea 1kg', 'amg', 'tea-coffee', 75, img('milk-tea'), { isNew: true, pack: '1 kg · case of 10', tags: ['featured'] }),
  P('amg-milk-coffee', 'AMG Milk Coffee 1kg', 'amg', 'tea-coffee', 75, img('milk-coffee'), { isNew: true, pack: '1 kg · case of 10' }),
  P('ginger-bev', 'Elephant House Ginger Bev Can – 8 Pack', 'elephant-house', 'beverages', 60, cey('own-gingerbev'), { compareAt: 72, pack: '8 × 330 ml', tags: ['featured', 'best'] }),
  P('kal-kiri', 'Highland Kal Kiri – 6 Pack', 'highland', 'beverages', 75, img('kal-kiri'), { pack: '6 × 1 L', tags: ['featured'] }),
  P('orange-crush', 'Elephant House Orange Crush – 500ml', 'elephant-house', 'beverages', 5, img('orange-crush'), { pack: '500 ml · case of 24', tags: ['best'] }),
  P('mackerel', 'Lanka Foods Mackerel Tin Fish 425g', 'lanka-foods', 'preserved', 9.5, cey('own-mackerel'), { isNew: true, pack: '425 g · case of 24', tags: ['featured', 'best'] }),
  P('md-jams', 'MD Jams & Cordials – Assorted Case', 'lanka-foods', 'preserved', 64, cey('own-jams'), { compareAt: 70, pack: 'Mixed case of 12', tags: ['featured'] }),
  P('lankasoy-curry', 'CBL Lankasoy Soya Meat – Devilled', 'lankasoy', 'snacks', 3.75, cey('own-lankasoy'), { pack: '90 g · case of 48', tags: ['best'] }),
  P('kiri-malu', 'Lankasoy Kiri Malu Flavour – 50g', 'lankasoy', 'snacks', 3.5, img('kiri-malu'), { pack: '50 g · case of 60' }),
  P('soy-polos', 'Lankasoy Vege Soy Polos Flavour – 90g', 'lankasoy', 'snacks', 3.5, img('soy-polos'), { pack: '90 g · case of 48' }),
  P('ambul-bananas', 'Fresh Ambul Bananas – Export Box', 'cey', 'fresh', 42, cey('bananas'), { isNew: true, pack: '13 kg carton', tags: ['featured', 'best'] }),
  P('tropical-box', 'Tropical Fruit Mix Box – Meegoda Selection', 'cey', 'fresh', 85, cey('fruits'), { compareAt: 95, pack: '10 kg mixed carton', tags: ['best'] }),
  P('cucumbers', 'Poly Tunnel Cucumbers – Kandy Farm', 'cey', 'fresh', 28, cey('cucumber'), { pack: '5 kg crate', stock: 0 }),
  P('siddhalepa-balm', 'Siddhalepa Herbal Ayurvedic Balm', 'siddhalepa', 'wellness', 5, img('siddhalepa-balm'), { pack: '50 g · case of 36', tags: ['featured'] }),
  P('cinnamon-mist', 'Pussalla Cinnamon Mist Air Freshener', 'pussalla', 'wellness', 20.5, img('cinnamon-mist'), { compareAt: 24, pack: '200 ml · case of 12' }),
  P('clay-plate', 'Traditional Sri Lankan Clay Plate', 'cey', 'wellness', 10.99, img('clay-plate'), { pack: 'Set of 6' }),
  P('coconut-spoon', 'Coconut Shell Spoon – 5pcs Set', 'cey', 'wellness', 7, img('coconut-spoon'), { compareAt: 9, pack: 'Set of 5' }),
]

export const blogs = [
  { slug: 'ceylon-cinnamon', title: 'True Ceylon cinnamon: why the grade on the bale matters', excerpt: 'Alba, Continental, Mexican — a buyer’s guide to cinnamon quill grades and what each one is for.', image: cey('own-spices'), category: 'Spices', date: 'Oct 22, 2026', read: '6 min' },
  { slug: 'poly-tunnels', title: 'Inside our 25,000 sq ft poly tunnels in Kandy', excerpt: 'How protected cultivation lets us ship export-grade cucumbers and vegetables all year round.', image: cey('greenhouse'), category: 'Farming', date: 'Oct 12, 2026', read: '5 min' },
  { slug: 'kurunegala-hub', title: 'From Kurunegala to the world: a day at our main warehouse', excerpt: 'Collection, inspection and container loading — the steps behind every shipment.', image: cey('container'), category: 'Operations', date: 'Sep 30, 2026', read: '4 min' },
  { slug: 'goraka', title: 'Goraka: the souring secret behind fish ambul thiyal', excerpt: 'Meet the sun-dried fruit that gives southern Sri Lankan curries their unforgettable tang.', image: img('goraka-cream'), category: 'Recipes', date: 'Sep 18, 2026', read: '4 min' },
  { slug: 'private-label', title: 'Private label, made simple', excerpt: 'How overseas buyers launch their own Sri Lankan range with our packing and processing team.', image: cey('packing'), category: 'Business', date: 'Sep 4, 2026', read: '5 min' },
  { slug: 'gulf-expo', title: 'Meeting buyers across the Gulf', excerpt: 'Highlights from our latest trade show with Lanka Foods Middle East in the UAE.', image: cey('expo'), category: 'News', date: 'Aug 20, 2026', read: '3 min' },
]

export const coupons = [
  { code: 'CEY10', title: '10% off', type: 'percent', value: 10, min: 100, by: 'Cey Exports', valid: 'First wholesale order' },
  { code: 'BULK15', title: '15% off', type: 'percent', value: 15, min: 300, by: 'Cey Exports', valid: 'Orders over AED 300' },
  { code: 'FREESHIP', title: 'Free delivery', type: 'shipping', value: 0, min: 40, by: 'Lanka Foods UAE', valid: 'Ends Nov 30, 2026' },
]

export const promotions = [
  { title: 'Ginger Bev 8 Pack', label: 'Limited time offer', ends: 'Ends 11/05/2026', image: cey('own-gingerbev'), to: '/product/ginger-bev' },
  { title: 'Spice Garden Week', label: 'Cinnamon · Pepper · Cloves', ends: 'Ends 11/20/2026', image: cey('own-spices'), to: '/shop?category=spices' },
  { title: 'Fresh from Kandy', label: 'Poly tunnel harvest', ends: 'Every Thursday', image: cey('cucumber'), to: '/shop?category=fresh' },
]

export const getBrand = (slug) => brands.find((b) => b.slug === slug)
export const getCategory = (slug) => categories.find((c) => c.slug === slug)
export const getProduct = (slug) => products.find((p) => p.slug === slug)
export const countIn = (slug) => products.filter((p) => p.category === slug).length
export const brandCount = (slug) => products.filter((p) => p.brand === slug).length
export const formatAED = (n) => `AED ${n.toFixed(2)}`
export const discountPct = (p) => (p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0)
