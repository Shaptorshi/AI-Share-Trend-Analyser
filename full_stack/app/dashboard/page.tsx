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
    <div className='border h-screen p-5 m-5 rounded-2xl bg-background/50 backdrop-blur-xl shadow-sm overflow-y-auto space-y-6'>
      <div className=''>
        <StatCards />
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6'>
          <div className='lg:col-span-2 flex flex-col h-full'>
            <PriceChart />
          </div>
          <div className='flex flex-col gap-6 h-full'>
            <StockDetails />
            <AIPredictionCard />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2"><WatchList /></div>
            <div><News /></div>
        </div>
      </div>
    </div>
  )
}

export default page