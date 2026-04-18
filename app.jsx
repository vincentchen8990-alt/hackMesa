import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import Login from './app/login/page'
import Register from './app/register/page'

function App() {
  const [page, setPage] = useState('login')
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getCurrentSession() {
      const { data, error } = await supabase.auth.getSession()
      if (!error) {
        setSession(data.session)
      }
      setLoading(false)
    }

    getCurrentSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setSession(null)
    setPage('login')
  }

  if (loading) {
    return <div style={styles.center}>Loading...</div>
  }

  if (session) {
    return (
      <div style={styles.center}>
        <div style={styles.card}>
          <h2>You are logged in</h2>
          <p>Email: {session.user.email}</p>
          <button onClick={handleLogout} style={styles.button}>
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.center}>
      {page === 'login' ? (
        <Login
          onSwitchToRegister={() => setPage('register')}
          onSuccess={() => setSession(true)}
        />
      ) : (
        <Register
          onSwitchToLogin={() => setPage('login')}
          onSuccess={() => setSession(true)}
        />
      )}
    </div>
  )
}

const styles = {
  center: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f5f5',
  },
  card: {
    width: '360px',
    padding: '24px',
    border: '1px solid #ddd',
    borderRadius: '12px',
    background: '#fff',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },
  button: {
    marginTop: '12px',
    padding: '10px 16px',
    fontSize: '16px',
    cursor: 'pointer',
  },
}

export default App