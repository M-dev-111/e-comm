import PortalLoginCard from '../components/PortalLoginCard'

export default function SuperAdminLogin () {
  return (
    <PortalLoginCard
      title='Super Admin'
      subtitle='Platform owner sign-in'
      expectedRole='super_admin'
      redirectTo='/super-admin'
    />
  )
}
