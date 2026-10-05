import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Compass, ArrowRight, Search } from 'lucide-react'
import NotFoundImage from '@/assets/404.png'

export default function NotFound() {
  return (
    <div className="w-full flex flex-col items-center justify-start relative overflow-hidden pt-0 pb-6 px-4 sm:px-6 bg-gradient-to-b from-brand-terracotta/5 via-transparent to-transparent dark:from-brand-terracotta/10">
      
      {/* Ambient Background Lighting Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-terracotta/10 dark:bg-brand-terracotta/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-4 left-1/3 w-[400px] h-[250px] bg-brand-terracotta/5 dark:bg-brand-terracotta/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Center Content Container */}
      <div className="-mt-4 sm:-mt-8 max-w-2xl w-full flex flex-col items-center text-center relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* 404 PNG Image */}
        <div className="relative select-none flex justify-center w-full">
          <img
            src={NotFoundImage}
            alt="404 Page Not Found"
            className="w-full max-w-sm sm:max-w-md md:max-w-lg h-auto object-contain drop-shadow-xl animate-in zoom-in-95 duration-500"
          />
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center -mt-16 sm:-mt-24 md:-mt-28 z-20">
          <Link
            to="/"
            className="flex items-center justify-center gap-2.5 bg-brand-terracotta hover:bg-brand-terracotta-light text-white font-bold py-3.5 px-8 rounded-2xl text-sm shadow-xl shadow-brand-terracotta/20 hover:shadow-2xl transition-all duration-300 cursor-pointer active:scale-95 group"
          >
            <Home className="h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            to="/properties"
            className="flex items-center justify-center gap-2.5 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 font-bold py-3.5 px-8 rounded-2xl text-sm shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-95 group"
          >
            <Search className="h-4 w-4 text-brand-terracotta" />
            <span>Browse Catalog</span>
            <ArrowRight className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

      </div>
    </div>
  )
}
