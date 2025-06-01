import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../Components/input/Input'

import { validateEmail } from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { UserContext } from '../../context/useContext'

import uploadImage from '../../utils/uploadimage'
import ProfilePhotoSelector from '../../Components/input/ProfilePhotoSelector'
function Signup({ setCurrentPage }) {
  const [profilePic, setProfilePic] = useState(null)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const { updateUser } = useContext(UserContext)

  const navigate = useNavigate()

  //handle signup Form Submit
  const handleSignUp = async (e) => {
    e.preventDefault()
    let profileImageUrl = ""


    if (!fullName) {
      setError("Please enter full name")
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email")
      return;
    }
    if (!password) {
      setError("Please enter valid password")
    }
    // signup api call//


    try {
      // uplaod image if present 


      if (profilePic) {
        const imgUplaodRes = await uploadImage(profilePic)
        profileImageUrl = imgUplaodRes.ImageUrl || "";
      }
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl,
      })
      const { token } = response.data

      if (token) {
        localStorage.setItem('token', token)
        updateUser(response.data)
        navigate('./dashboard')
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Create an Account</h3>
        <p className="text-sm text-gray-500 mb-6">
          Join us today by entering your details below.
        </p>

        <form className="space-y-4" onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <Input
            value={fullName}
            onChange={({ target }) => setFullName(target.value)}
            label="Full Name"
            placeholder="Abhishek"
            type="text"
          />
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
            placeholder="Min 8 Characters"
            type="password"
          />

          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-xl font-semibold transition duration-300"
          >
            Sign Up
          </button>

          <div className="text-center text-sm text-gray-600 mt-4">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => setCurrentPage("login")}
              className="text-orange-500 font-medium underline"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Signup
