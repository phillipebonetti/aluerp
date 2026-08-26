import type { Metadata } from 'next'
import { AleedsLanding } from '@/components/aleeds-landing'

export const metadata: Metadata = {
  title: 'Aleeds Alumínio e Vidro Temperado | Esquadrias em Santa Catarina',
  description: 'Esquadrias de alumínio e vidro temperado com fabricação própria em Urussanga - SC. Atendemos de Passo de Torres a Itapema. Solicite seu orçamento.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Aleeds Alumínio e Vidro Temperado | Esquadrias em Santa Catarina',
    description: 'Fabricação própria, projetos sob medida e instalação de esquadrias em Santa Catarina.',
    type: 'website',
    locale: 'pt_BR',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Aleeds Alumínio e Vidro Temperado',
  description: 'Esquadrias de alumínio e vidro temperado com fabricação própria em Urussanga.',
  foundingDate: '2011',
  telephone: '+55 48 99949-1115',
  url: 'https://aleeds.com.br',
  address: { '@type': 'PostalAddress', streetAddress: 'Rodovia Genézio Mazon, 2297', addressLocality: 'Urussanga', addressRegion: 'SC', addressCountry: 'BR' },
  areaServed: 'Santa Catarina, entre Passo de Torres e Itapema',
  sameAs: ['https://instagram.com/aleedsaluminio'],
}

export default function Home() {
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> <AleedsLanding /></>
}
