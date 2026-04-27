"use client"

import Navbar from '../components/LoggedNavbar'
import AIPredictionCard from './components/AIPredictionCard'
import News from './components/News'
import PriceChart from './components/PriceChart'
import StatCards from './components/StatCards'
import StockDetails from './components/StockDetails'
import WatchList from './components/WatchList'


const page = () => {
  return (
    <div className='border h-screen p-5 m-5 rounded-xl bg-muted/30'>
      <div className=''>
        <StatCards />
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <div className='lg:col-span-2'>
            <PriceChart />
          </div>
          <div>
            <StockDetails />
            <AIPredictionCard />
          </div>
        </div>
        <WatchList />
        <News />
      </div>
    </div>
  )
}

export default page