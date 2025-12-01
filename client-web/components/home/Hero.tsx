import Image from 'next/image'
import React from 'react'
import SearchComponent from '../search/search'

const Hero = () => {
  return (
    <div className='w-full h-auto sm:h-screen bg-white px-4 sm:px-0'>
        <div className='w-full h-[660px] max-w-7xl mx-auto bg-[#1A2038] max-h-[660px] rounded-3xl overflow-hidden flex flex-col items-center justify-center relative sm:py-0 xl:py-0'>
            <Image 
              src='/home/avion.png' 
              className='object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-[400px] h-auto sm:w-[800px] sm:h-[800px] xl:w-[1000px] xl:h-[1000px]' 
                alt='hero' 
                width={1000} 
                height={1000} 
            />
            <div className='w-full h-full max-w-7xl mx-auto max-h-[360px] flex flex-col items-center justify-center px-4 sm:px-0'>
                <h1 className='text-white text-2xl sm:text-3xl md:text-4xl xl:text-[41px] font-semibold mb-3 sm:mb-4 xl:mb-4 text-center px-2 sm:px-0'>Find, Explore, and Book Your Perfect Trip</h1>
                <p className='text-white text-sm sm:text-base md:text-lg xl:text-lg text-center max-w-2xl mb-6 sm:mb-8 md:mb-10 xl:mb-12 px-4 sm:px-0'>Follow top creators, join travel communities, explore curated routes, and book authentic experiences.</p>
                <div className='w-full max-w-full sm:max-w-none xl:max-w-none px-2 sm:px-0'>
                  <SearchComponent />
                </div>
            </div>
            <div className='w-full h-full max-w-7xl mx-auto max-h-[300px] overflow-hidden relative sm:mt-0 xl:mt-0'>
                <Image 
                  src='/home/home-page.png' 
                  className='object-cover absolute -bottom-5 left-1/2 -translate-x-1/2 ' 
                  alt='hero' 
                  width={750} 
                  height={750} 
                />
            </div>
            <div className='absolute h-12 sm:h-16 xl:h-20 bottom-0 left-0 w-full bg-gradient-to-t from-[#1A2038]/90 to-transparent z-10'></div>
        </div>
    </div>
  )
}

export default Hero