import { useContext, useEffect } from "react"
import { Can } from "../components/Can"
import { AuthContext } from "../context/AuthContext"
import { withSSRAuth } from "../helpers/withSSRAuth"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"


export default function Dashboard() {

  const { user, signOut } = useContext(AuthContext)


  useEffect(() => {
    api.get('/me')
      .then(response => console.warn('mada', response.data))
      .catch(err => console.warn(err))
  }, [])

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
      <button onClick={signOut}>SignOut</button>

      <Can permissions={['metrics.list']}><div>Hello</div></Can>
    </>

  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  await apiClient.get('/me')

  return { props: {} }
})