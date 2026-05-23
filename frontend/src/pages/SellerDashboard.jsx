import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Star, Eye, ShieldCheck, Home, 
  PlusCircle, Loader2, Clock 
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useSellerProfile } from '@/hooks/useSeller'
import { useProperties, useUpdateProperty } from '@/hooks/useProperties'
import { getPropertyThumbnail } from '@/lib/propertyUtils'

function isBitTruthy(value) {
  return value === true || value === 1 || value === '1'
}

export default function SellerDashboard({ isSeller = true }) {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const { data: sellerRes, isLoading: isSellerLoading } = useSellerProfile(user?.id, {
    enabled: !!user?.id && isSeller,
  })
  const seller = sellerRes?.data

  const { data: propertiesRes, isLoading: isPropertiesLoading } = useProperties(
    { seller_id: user?.id, is_verified: 'all' },
    { enabled: !!user?.id },
  )
  const myProperties = propertiesRes?.data || []

  const { mutateAsync: updateProperty, isPending: isUpdating } = useUpdateProperty()
  const [togglingId, setTogglingId] = React.useState(null)

  const handleVisibilityToggle = async (prop, nextVisible) => {
    setTogglingId(prop.id)
    try {
      await updateProperty({ id: prop.id, is_visible: nextVisible })
      toast.success(
        nextVisible
          ? 'Listing is now visible in the public catalog.'
          : 'Listing hidden from the public catalog.',
      )
    } catch (err) {
      toast.error(err.message || 'Failed to update visibility')
    } finally {
      setTogglingId(null)
    }
  }

  const displayProperties = myProperties.map((prop) => ({
    id: prop.id,
    title: prop.title,
    price: new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(prop.asking_price),
    views: Math.max(5, Math.floor(prop.asking_price / 30000)) || 0,
    inquiries: Math.max(1, Math.floor(prop.asking_price / 1200000)) || 0,
    isVerified: isBitTruthy(prop.is_verified),
    isVisible: isBitTruthy(prop.is_visible),
    image: getPropertyThumbnail(prop),
  }))

  const displayReviews = seller?.recent_reviews?.length > 0
    ? seller.recent_reviews.map((rev) => ({
        id: rev.id,
        buyer: `${rev.first_name || ''} ${rev.last_name || ''}`.trim() || 'Prestige Client',
        rating: rev.rating,
        comment: rev.comment,
        date: new Date(rev.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      }))
    : []

  const verifiedListingsCount = myProperties.filter((p) => isBitTruthy(p.is_verified)).length
  const pendingListingsCount = myProperties.filter((p) => !isBitTruthy(p.is_verified)).length
  const totalViews = displayProperties.reduce((sum, p) => sum + p.views, 0)
  const averageRating = seller?.average_rating
    ? `${parseFloat(seller.average_rating).toFixed(1)} / 5`
    : 'N/A'

  const stats = [
    { label: 'Verified Listings', value: String(verifiedListingsCount), icon: Home, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Pending Approval', value: String(pendingListingsCount), icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Total Views', value: new Intl.NumberFormat('en-US').format(totalViews), icon: Eye, color: 'text-purple-500 bg-purple-500/10' },
    { label: 'Seller Rating', value: averageRating, icon: Star, color: 'text-yellow-500 bg-yellow-500/10' },
  ]

  if ((isSeller && isSellerLoading) || isPropertiesLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10 pt-10 pb-16 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {isSeller && (
            <div className="flex items-center gap-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Professional Seller Access
            </div>
          )}
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            My Properties
          </h1>
          <p className="text-sm text-muted-foreground">
            {isSeller
              ? 'Manage your listings, visibility, and portfolio.'
              : 'View your listings and control what appears in the public catalog.'}
          </p>
        </div>
        <Button 
          onClick={() => navigate('/properties/create')} 
          className="gap-1.5 shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-transform"
        >
          <PlusCircle className="h-4 w-4" /> Add Listing
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-5 rounded-2xl border border-border/40 bg-card flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
                  {stat.label}
                </span>
                <span className="text-lg sm:text-xl font-black text-foreground truncate">
                  {stat.value}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-5">
          <h2 className="text-xl font-bold text-foreground">My Portfolio</h2>
          
          {displayProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border/60 rounded-3xl bg-card gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Home className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-bold text-base text-foreground">No Listings Yet</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Create your first listing to present it in the catalog after admin approval.
                </p>
              </div>
              <Button onClick={() => navigate('/properties/create')} variant="outline" size="sm" className="mt-2">
                Create First Listing
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {displayProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="p-4 rounded-2xl border border-border/40 bg-card flex flex-col sm:flex-row gap-4 sm:items-center hover:shadow-md transition-all duration-300"
                >
                  <div className="flex gap-4 items-center flex-grow min-w-0">
                    <div className="h-20 w-20 rounded-xl overflow-hidden bg-muted shrink-0">
                      <img src={prop.image} alt={prop.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="font-bold text-sm sm:text-base text-foreground truncate">{prop.title}</h3>
                      <p className="text-xs sm:text-sm font-semibold text-primary">{prop.price}</p>
                      <div className="flex items-center gap-4 mt-2 text-[10px] sm:text-xs text-muted-foreground font-medium">
                        <span>{prop.views} views</span>
                        <span>•</span>
                        <span>{prop.inquiries} inquiries</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-3 shrink-0 sm:min-w-[180px]">
                    <div className="flex items-center gap-2">
                      {prop.isVerified ? (
                        <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                          Pending
                        </span>
                      )}
                      {prop.isVerified && prop.isVisible && (
                        <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                          Public
                        </span>
                      )}
                    </div>

                    <label
                      className={`flex items-center justify-between gap-3 w-full sm:w-auto ${
                        !prop.isVerified ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <span className="text-xs font-medium text-foreground">Visible to public</span>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={prop.isVisible}
                        disabled={!prop.isVerified || (isUpdating && togglingId === prop.id)}
                        onClick={() => {
                          if (!prop.isVerified) return
                          handleVisibilityToggle(prop, !prop.isVisible)
                        }}
                        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          prop.isVisible ? 'bg-primary' : 'bg-muted'
                        } ${!prop.isVerified ? 'pointer-events-none' : ''}`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                            prop.isVisible ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </label>
                    {!prop.isVerified && (
                      <p className="text-[10px] text-muted-foreground text-right">
                        Available after admin approval
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <h2 className="text-xl font-bold text-foreground">{isSeller ? 'Recent Reviews' : 'Quick actions'}</h2>
          {!isSeller && (
            <div className="p-6 rounded-2xl border border-border/40 bg-card flex flex-col gap-3">
              <p className="text-sm text-muted-foreground">
                Any registered user can list a property. Toggle visibility after your listing is verified.
              </p>
              <Button onClick={() => navigate('/properties/create')} className="w-fit gap-2">
                <PlusCircle className="h-4 w-4" /> Create a listing
              </Button>
            </div>
          )}
          {isSeller && (
          <>
          {displayReviews.length === 0 ? (
            <div className="p-6 rounded-2xl border border-border/40 bg-card text-center flex flex-col items-center justify-center gap-2">
              <Star className="h-8 w-8 text-muted-foreground/45" />
              <p className="text-xs text-muted-foreground">No client feedback has been submitted yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {displayReviews.map((rev) => (
                <div key={rev.id} className="p-5 rounded-2xl border border-border/40 bg-card flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-xs sm:text-sm text-foreground">{rev.buyer}</span>
                      <span className="text-[10px] text-muted-foreground">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-yellow-500 shrink-0">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed italic">
                    &quot;{rev.comment}&quot;
                  </p>
                </div>
              ))}
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  )
}
