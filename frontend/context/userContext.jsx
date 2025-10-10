"use client"

import { userDetails } from "@/services/auth"
import Cookies from "js-cookie"
import { createContext, useContext, useEffect, useState } from "react"

const UserContext = createContext()

export const UserProvider = ({ children }) => {
    const [dark, setDark] = useState(false)
    const [user, setUser] = useState(null);

    const fetchUser = async () => {
        const token = Cookies.get("token");
        if (!token) return;

        const res = await userDetails(token);
        // console.log(res)
        if (res.data.success === true) {
            setUser(res.data.user);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);
    
     useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setDark(savedTheme === "dark")
    }
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light")
    localStorage.setItem("theme", dark ? "dark" : "light")
  }, [dark])


    const refreshUser = () => {
        fetchUser();
    }

    return (
        <UserContext.Provider value={{ user, refreshUser, setUser, dark, setDark }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext)
