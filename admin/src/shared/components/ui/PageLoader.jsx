import WifiLoader from './WifiLoader'

export default function PageLoader({ minHeight = 'min-h-[60vh]' }) {
  return (
    <div className={`flex ${minHeight} items-center justify-center`}>
      <WifiLoader />
    </div>
  )
}
