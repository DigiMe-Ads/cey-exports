// Static company content from the Cey Exports profile. Products, brands, categories,
// containers, blogs and promotions live in Supabase (see CatalogContext).
const cey = (name, ext = 'jpg') => `/cey/${name}.${ext}`

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

export const formatAED = (n) => `AED ${Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const discountPct = (p) => (p.compareAt && p.price ? Math.round((1 - p.price / p.compareAt) * 100) : 0)
