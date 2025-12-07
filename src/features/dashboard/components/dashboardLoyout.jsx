import { useEffect } from "react"
import { Sidebar } from "./sidebar"

import { Outlet, useNavigate } from "react-router-dom"
import axios from "axios"

export function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:3000/auth/dashboard', {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (response.status === 201) {
        navigate('/login')
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        console.error("Error inesperado:", error);
      }
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>

      </div>
    </div>
  )
}
