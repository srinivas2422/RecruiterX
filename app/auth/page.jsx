"use client"
import Image from 'next/image';
import { useEffect } from 'react';
import React from 'react'
import { Button } from "@/components/ui/button"
import { supabase } from '@/services/supabaseClient';
function Login() {

  /* SignIn Function */ 
  const signInWithGoogle = async() => {
    const {error} = await supabase.auth.signInWithOAuth({
      provider:'google'
    })

    if (error) {
      console.error('Error : ', error.message)
    }
  }



  return (
    <div className='flex flex-col items-center justify-center h-screen'>
      <div className='flex flex-col items-center border rounded-2xl p-8'>
        <Image src={'/logo.png'} alt='logo'
            width = {400}
            height = {100}
            className = 'w-45'
        />
        <div className='flex flex-col items-center'>
          <Image src={'/login.png'} alt='logo'
              width = {600}
              height = {400}
              className = 'w-100 h-62.5 rounded-2xl'
          />
          <h2 className='text 2xl font-bold text-center mt-5'>Welcome to RecruiterX</h2>
          <p className='text-gray-500 text-center'>Sign In With Google Authentication</p>
          <Button className='mt-7 w-full'
          onClick = {signInWithGoogle}> 
            Login With Google 
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Login;
