"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // Check if a token exists (indicating the user is logged in)
    const token = localStorage.getItem("token")
    if (token) {
      // Redirect to dashboard
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <LoginForm />
    </div>
  )
}
