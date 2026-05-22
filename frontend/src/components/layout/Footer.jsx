import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-neutral-100 dark:border-neutral-900 bg-neutral-50 dark:bg-neutral-950/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Brand section */}
          <div className="flex flex-col gap-4 md:col-span-5">
            <Link to="/" className="flex items-center gap-1 self-start">
              <span className="font-serif text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
                Rare<span className="text-brand-bronze">Nest</span>
              </span>
            </Link>
            <p className="text-neutral-500 dark:text-neutral-400 font-serif italic text-base">
              Homes that tell a story.
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed mt-1">
              Reach a global audience of buyers who specifically seek extraordinary alternative dwellings. We connect developers, builders, and enthusiasts of outstanding design.
            </p>
          </div>

          {/* Quick links & Details */}
          <div className="grid grid-cols-2 gap-8 md:col-span-7 md:justify-items-end">
            <div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-widest mb-4">
                Explore
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/" className="text-sm font-medium text-neutral-500 hover:text-brand-bronze transition-colors">
                    Find Dwellings
                  </Link>
                </li>
                <li>
                  <a href="/#builders" className="text-sm font-medium text-neutral-500 hover:text-brand-bronze transition-colors">
                    Verified Builders
                  </a>
                </li>
                <li>
                  <a href="/#how-it-works" className="text-sm font-medium text-neutral-500 hover:text-brand-bronze transition-colors">
                    How it works
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-widest mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                <li>
                  <span className="text-sm font-medium text-neutral-400 dark:text-neutral-600 cursor-not-allowed">About</span>
                </li>
                <li>
                  <span className="text-sm font-medium text-neutral-400 dark:text-neutral-600 cursor-not-allowed">Careers</span>
                </li>
                <li>
                  <span className="text-sm font-medium text-neutral-400 dark:text-neutral-600 cursor-not-allowed">Privacy</span>
                </li>
                <li>
                  <span className="text-sm font-medium text-neutral-400 dark:text-neutral-600 cursor-not-allowed">Terms</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-neutral-100 dark:border-neutral-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
            &copy; {currentYear} RareNest. All rights reserved.
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 font-medium">
            Discover extraordinary living.
          </p>
        </div>
      </div>
    </footer>
  )
}
