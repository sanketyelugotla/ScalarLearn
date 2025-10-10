"use client"

import Cookies from "js-cookie"
import { LogOut, Menu, User } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { MdDarkMode, MdOutlineLightMode } from "react-icons/md"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { useUser } from "@/context/userContext"

const useAuth = () => {
  const { user, setUser } = useUser()

  const signOut = () => {
    Cookies.remove("token")
    setUser(null)
  }

  return { user, signOut }
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const { dark, setDark } = useUser()

  const [isScrolled, setIsScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Courses", href: "/courses" },
  ];

  if (user) {
    navLinks.push({ name: "Dashboard", href: `/${user.role}/dashboard` });
  }

  const handleLogout = async () => {
    signOut()
    router.push("/")
  }

  const handleNavClick = (href) => {
    router.push(href)
    setOpen(false) // This will close the mobile menu
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled
        ? "bg-background/80 backdrop-blur-md shadow-sm"
        : "bg-transparent"
        }`}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-2 lg:px-[4rem]">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-9 w-9 md:h-11 md:w-11 flex items-center justify-center">
              <Image
                src={dark ? "/logo_light.png" : "/logo_dark.png"}
                alt="Logo"
                width={42}
                height={42}
                priority
              />
            </div>
            <span className="font-bold text-xl">Scalar Learn</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              prefetch
              className={`text-[0.875rem] font-bold transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-muted-foreground"
                }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            className="cursor-pointer"
            variant="ghost"
            size="icon"
            onClick={() => setDark(!dark)}
            aria-label="Toggle Theme"
          >
            {dark ? (
              <MdOutlineLightMode className="h-5 w-5" />
            ) : (
              <MdDarkMode className="h-5 w-5" />
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full cursor-pointer hover:bg-accent/50 transition-colors"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="bg-background border-2 border-border shadow-lg rounded-lg overflow-hidden"
                align="end"
                asChild
              >
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                >
                  <div className="flex items-center justify-start gap-2 p-3">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-semibold text-foreground">
                        {user.name || "User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-border" />

                  <DropdownMenuItem
                    className="cursor-pointer px-3 py-2 hover:bg-accent focus:bg-accent transition-colors"
                    onClick={() => router.push(user.role === "instructor" ? "/instructor/dashboard" : "/student/dashboard")}
                  >
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center"
                    >
                      Dashboard
                    </motion.div>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-border" />

                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer px-3 py-2 hover:bg-red-500 focus:bg-red-500 transition-colors hover:text-white focus:text-white"
                    onClick={handleLogout}
                  >
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </motion.div>
                  </DropdownMenuItem>
                </motion.div>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hover:bg-accent/50"
              >
                <Link href="/auth?mode=login">Log in</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="hover:bg-primary/90 transition-colors"
              >
                <Link href="/auth?mode=signup">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-8 w-8"
                aria-label="Open Menu"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <AnimatePresence>
              {open && (
                <>
                  {/* Backdrop with blur */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setOpen(false)}
                  />

                  {/* Mobile menu content */}
                  <SheetContent
                    side="right"
                    className="w-full max-w-[55vw] p-0 border-l-0"
                  >
                    <motion.div
                      initial={{ x: '100%' }}
                      animate={{ x: 0 }}
                      exit={{ x: '100%' }}
                      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                      className="h-full bg-background"
                    >
                      <div className="flex flex-col h-full">
                        <SheetTitle className="px-4 pt-5 pb-3 border-b border-border">
                          <span className="text-lg font-semibold">Menu</span>
                        </SheetTitle>

                        <div className="flex-1 px-2 py-4 overflow-y-auto">
                          <nav className="grid gap-0.5">
                            {navLinks.map((link, index) => (
                              <motion.button
                                key={link.name}
                                initial={{ opacity: 0, x: 15 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.04 * index }}
                                onClick={() => handleNavClick(link.href)}
                                className={`w-full text-left px-3 py-2 rounded-md transition-all text-sm ${pathname === link.href
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-foreground hover:bg-accent"
                                  }`}
                              >
                                {link.name}
                              </motion.button>
                            ))}
                          </nav>
                        </div>

                        {!user && (
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="p-3 border-t border-border"
                          >
                            <div className="grid gap-2">
                              <Button
                                className="w-full h-8 text-sm"
                                onClick={() => handleNavClick("/auth?mode=signup")}
                              >
                                Sign up
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full h-8 text-sm"
                                onClick={() => handleNavClick("/auth?mode=login")}
                              >
                                Log in
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  </SheetContent>
                </>
              )}
            </AnimatePresence>
          </Sheet>
        </div>
      </div>
    </header>
  )
}