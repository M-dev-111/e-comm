import PortalLoginCard from '../components/PortalLoginCard'

export default function VendorLogin () {
  return (
    <PortalLoginCard
      title='Vendor'
      subtitle='Sign in with the credentials your admin emailed you'
      expectedRole='vendor'
      redirectTo='/vendor'
    />
  )
}
