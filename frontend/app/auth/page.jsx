'use client'

import { AnimatePresence, motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import LoginForm from "./LoginForm"
import SignupForm from "./SignupForm"

export default function AuthPage() {
    const searchParams = useSearchParams()
    const mode = searchParams.get("mode") // 'login' or 'signup'

    const [isLogin, setIsLogin] = useState(mode !== 'signup') // default to login unless mode=signup

    useEffect(() => {
        setIsLogin(mode !== 'signup')
    }, [mode])

    const toggleAuthMode = () => {
        setIsLogin(prev => !prev)
    }

    return (
        <div className="min-h-[90vh] flex items-center justify-center px-4 py-12">
            <div className="flex justify-between items-center">
                {/* Forms Container */}
                <div className="w-full max-w-md relative flex justify-between items-center md:mr-10">
                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <motion.div
                                key="login"
                                initial={{ opacity: 0, x: 100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ duration: 0.2 }}
                            >
                                <LoginForm toggleAuthMode={toggleAuthMode} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="signup"
                                initial={{ opacity: 0, x: -100 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 100 }}
                                transition={{ duration: 0.2 }}
                            >
                                <SignupForm toggleAuthMode={toggleAuthMode} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
