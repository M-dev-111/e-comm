import PortalLoginCard from '../components/PortalLoginCard'

export default function AdminLogin () {
  return (
    <PortalLoginCard
      title='Admin'
      subtitle='Company sign-in'
      expectedRole='admin'
      redirectTo='/admin'
    />
  )
}
