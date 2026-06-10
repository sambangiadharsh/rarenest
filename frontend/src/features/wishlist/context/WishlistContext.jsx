import React from 'react'
import { useSelector } from 'react-redux'
import { useWishlistIds } from '../hooks/useWishlist'

const WishlistContext = React.createContext({
  wishlistedIds: new Set(),
  isWishlisted: () => false,
})

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { data: idsData } = useWishlistIds({ enabled: isAuthenticated })

  const value = React.useMemo(() => {
    const wishlistedIds = new Set(
      (idsData?.data ?? []).map((id) => String(id).toLowerCase()),
    )
    return {
      wishlistedIds,
      isWishlisted: (propertyId) =>
        wishlistedIds.has(String(propertyId).toLowerCase()),
    }
  }, [idsData])

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  )
}

export function useWishlistContext() {
  return React.useContext(WishlistContext)
}
