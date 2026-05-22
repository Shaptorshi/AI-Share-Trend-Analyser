import Navbar from '@/app/components/Navbar'
import CTA from '@/app/components/CTA'
import Features from './components/features'
import Working from './components/working'
import Insights from './components/Insights'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'

export default function Home() {
  return (
    <div id=''>
      <Navbar />
      <CTA />
      <Features />
      <Working />
      <Insights />
      <FinalCTA />
      <Footer />
    </div>
  );
}
