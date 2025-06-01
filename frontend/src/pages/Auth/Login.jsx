import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../Components/input/Input'
import { validateEmail } from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { UserContext } from '../../context/useContext'


const Login = ({ setCurrentPage }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)

  const { updateUser } = useContext(UserContext)

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      setError("Please enter a valid email")
      return
    }

    if (!password) {
      setError("Please enter the password")
      return
    }
    // If both are valid, clear error
    setError("")
    // login API call
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email,
        password
      })
      const { token } = response.data

      if (token) {
        localStorage.setItem('token', token)
        updateUser(response.data)
        navigate('/dashboard')
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h3>
        <p className="text-sm text-gray-500 mb-6">
          Please enter your details to log in.
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="abhishek@gmail.com"
            type="email"
          />
          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Password"
            placeholder="Min 8 characters"
            type="password"
          />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-semibold transition duration-300"
          >
            LOGIN
          </button>

          <div className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => setCurrentPage("signup")}
              className="text-orange-500 font-medium underline"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
