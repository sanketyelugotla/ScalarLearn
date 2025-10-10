'use client'

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Cookies from "js-cookie"
import { AlertCircle, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { useUser } from "@/context/userContext"
import { signin } from '@/services/auth'
import { TfiReload } from "react-icons/tfi"
import { toast } from "sonner"

import { useSearchParams } from 'next/navigation'

export default function LoginForm({ toggleAuthMode }) {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [captchaText, setCaptchaText] = useState("")
    const [captchaInput, setCaptchaInput] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const { refreshUser, dark } = useUser();

    const searchParams = useSearchParams(); // App Router
    const redirectPath = searchParams?.get('redirect') || '/';
    const router = useRouter()

    useEffect(() => {
        setCaptchaText(generateCaptcha())
    }, [])

    useEffect(() => {
        const canvas = /** @type {HTMLCanvasElement | null} */ (document.getElementById("captchaCanvas"))

        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.font = "bold 20px monospace"
        ctx.fillStyle = "#888888"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(captchaText, canvas.width / 2, canvas.height / 2)
    }, [captchaText])

    function generateCaptcha() {
        return Math.random().toString(36).substring(2, 6).toUpperCase()
    }

    function refreshCaptcha() {
        setCaptchaText(generateCaptcha())
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (captchaInput.trim().toUpperCase() !== captchaText.trim().toUpperCase()) {
            const captchaError = "Captcha doesn't match. Try again.";
            toast.error(captchaError );
            setError(captchaError);
            setIsLoading(false);
            refreshCaptcha();
            return;
        }

        try {
            const response = await signin(email, password);
            const { token, role, success } = response?.data || {};

            if (success && token) {
                Cookies.set("token", token, {
                    expires: rememberMe ? 3 : undefined,
                    secure: true,
                    sameSite: "Lax",
                });

                refreshUser();
                toast.success("Login successful!" );

                const redirectTo = searchParams.get("redirect") || "/";
                router.push(redirectTo);
            } else {
                const errMsg = "Invalid response. Please try again.";
                toast.error(errMsg );
                setError(errMsg);
            }
        } catch (err) {
            toast.error(err.message );
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="py-10 shadow-lg rounded-2xl bg-container-background border border-border hover:border-[#4AC9D6] transition-all duration-300">
            <CardHeader className="text-center pt-6 mb-8">
                <CardTitle className="text-3xl font-extrabold ">Time to Plug In!</CardTitle>
                <CardDescription className="text-sm text-muted-foreground font-medium">ScalarLearn: Powering Minds Everywhere.</CardDescription>
            </CardHeader>

            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm text-muted-foreground font-medium">Your Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Type your mail here"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-md bg-background border-2 border-border placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#4AC9D6] transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-sm text-muted-foreground font-medium">Password</Label>
                            <Link href="/auth/Forgetpassword" className="text-sm text-[#4AC9D6] hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={passwordVisible ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="Shh… It's a secret!"
                                className="w-full rounded-md bg-background border-2 border-border placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4AC9D6] transition-all"
                            />
                            <div
                                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                                onClick={() => setPasswordVisible(!passwordVisible)}
                            >
                                {passwordVisible ? (
                                    <EyeOff className="h-4 w-5 text-gray-500" />
                                ) : (
                                    <Eye className="h-4 w-5 text-gray-500" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="captcha" className="text-sm text-muted-foreground font-medium">Captcha:</Label>
                        <div className="flex items-center gap-4">
                            <Button type="button" variant="ghost" size="icon" onClick={refreshCaptcha}>
                                <TfiReload />
                            </Button>
                            <canvas
                                id="captchaCanvas"
                                className="h-10 w-24 rounded-md bg-background border-2 border-border"
                                width={96}
                                height={40}
                            />
                            <Input
                                id="captcha"
                                type="text"
                                value={captchaInput}
                                onChange={(e) => setCaptchaInput(e.target.value)}
                                placeholder="Enter captcha"
                                required
                                className="w-full max-w-[200px] ml-3 rounded-md bg-background border-2 border-border focus:outline-none focus:ring-2 focus:ring-[#4AC9D6] transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                            className="h-4 w-4"
                        />
                        <Label htmlFor="rememberMe" className="text-sm text-muted-foreground font-medium">Remember me</Label>
                    </div>

                    <Button
                        type="submit"
                        className="w-full rounded-md bg-[#307179] text-white hover:bg-[#374d50]"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging you in..." : "Login (Let's dive into ScalarLearn!)"}
                    </Button>
                </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
                <div className="text-center text-sm text-muted-foreground font-medium">
                    Don't have an account?{" "}
                    <button
                        onClick={toggleAuthMode}
                        className="text-[#374d50] hover:underline font-semibold"
                    >
                        Sign up (We won't bite!)
                    </button>
                </div>
            </CardFooter>
        </Card>
    )
}
