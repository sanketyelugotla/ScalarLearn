'use client'

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"
import { signup } from "@/services/auth"
import { useUser } from "@/context/userContext"
import { toast } from "sonner"

export default function SignupForm({ toggleAuthMode }) {
    const router = useRouter()
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [education, setEducation] = useState("")
    const [institution, setInstitution] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [passwordValidations, setPasswordValidations] = useState({
        minLength: false,
        hasUppercase: false,
        hasSpecialChar: false,
    })
    const [passwordTouched, setPasswordTouched] = useState(false)
    const [agreeToTerms, setAgreeToTerms] = useState(false)
    const [role, setRole] = useState("student")
    const { refreshUser, dark } = useUser();

    const validatePassword = (password) => {
        const minLength = 8
        const hasUppercase = /[A-Z]/.test(password)
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

        setPasswordValidations({
            minLength: password.length >= minLength,
            hasUppercase,
            hasSpecialChar,
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!agreeToTerms) {
            const errMsg = "You must agree to the terms and conditions."
            setError(errMsg)
            toast.error(errMsg )
            return
        }

        if (password !== confirmPassword) {
            const errMsg = "Passwords do not match."
            setError(errMsg)
            toast.error(errMsg )
            return
        }

        const isPasswordStrong = Object.values(passwordValidations).every(Boolean)
        if (!isPasswordStrong) {
            const errMsg = "Password does not meet strength requirements."
            setError(errMsg)
            toast.error(errMsg )
            return
        }

        setIsLoading(true)
        try {
            const response = await signup(name, email, education, institution, password, role)
            const { token, success } = response?.data || {}

            if (success && token) {
                Cookies.set("token", token, {
                    expires: 7,
                    secure: true,
                    sameSite: "Lax",
                })
                toast.success("Signup successful!" )
                refreshUser()
                router.push("/")
            } else {
                const errMsg = "Signup failed. Please try again."
                toast.error(errMsg )
                setError(errMsg)
            }
        } catch (err) {
            toast.error(err.message )
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className=" py-8 shadow-lg rounded-2xl bg-container-background border border-border hover:border-[#4AC9D6] transition-all duration-300">

            <CardHeader className="text-center pt-6 mb-8">
                <CardTitle className="text-3xl font-extrabold">Join the ScalarLearn!</CardTitle>
                <CardDescription className="text-sm text-muted-foreground font-medium">Give us your info, and we'll roll out the red carpet!</CardDescription>
            </CardHeader>

            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="name">Your Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Type your name here" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="email">Your Email</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Type your mail here" />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="education">Education Level</Label>
                            <Input id="education" value={education} onChange={(e) => setEducation(e.target.value)} required placeholder="Your education level" />
                        </div>
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="institution">Institution</Label>
                            <Input id="institution" value={institution} onChange={(e) => setInstitution(e.target.value)} required placeholder="Your institution name" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">I am a</Label>
                        <div className="flex gap-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={role === "student"}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="h-4 w-4"
                                />
                                <span>Student</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="role"
                                    value="instructor"
                                    checked={role === "instructor"}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="h-4 w-4"
                                />
                                <span>Instructor</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    setPasswordTouched(true)
                                    validatePassword(e.target.value)
                                }}
                                placeholder="Set your key here"
                                required
                            />
                            <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="h-4 w-5 text-gray-500" /> : <Eye className="h-4 w-5 text-gray-500" />}
                            </div>
                        </div>
                        {passwordTouched && (
                            <div className="mt-2 text-xs text-gray-600">
                                <div className={`${passwordValidations.minLength ? "text-green-500" : "text-red-500"}`}>• 8+ characters</div>
                                <div className={`${passwordValidations.hasUppercase ? "text-green-500" : "text-red-500"}`}>• One uppercase letter</div>
                                <div className={`${passwordValidations.hasSpecialChar ? "text-green-500" : "text-red-500"}`}>• One special character</div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <div className="relative">
                            <Input
                                id="confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                required
                            />
                            <div className="absolute inset-y-0 right-3 flex items-center cursor-pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? <EyeOff className="h-4 w-5 text-gray-500" /> : <Eye className="h-4 w-5 text-gray-500" />}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="agreeToTerms"
                            checked={agreeToTerms}
                            onChange={() => setAgreeToTerms(!agreeToTerms)}
                            className="h-4 w-4"
                        />
                        <Label htmlFor="agreeToTerms" className="text-sm">
                            I agree to the{" "}
                            <Link href="/terms" className="text-[#4AC9D6] hover:underline">
                                terms and conditions
                            </Link>
                        </Label>
                    </div>

                    <Button type="submit" className="w-full rounded-md bg-[#307179] text-white hover:bg-[#374d50]" disabled={isLoading}>
                        {isLoading ? "Creating your account..." : "Create Account (Welcome to ScalarLearn!)"}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
                <div className="text-center text-sm text-muted-foreground font-medium">
                    Been here before?{" "}
                    <button onClick={toggleAuthMode} className="text-[#374d50] hover:underline font-semibold">
                        Login (Welcome back!)
                    </button>
                </div>
            </CardFooter>
        </Card>
    )
}
