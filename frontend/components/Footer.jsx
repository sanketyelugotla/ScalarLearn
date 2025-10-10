"use client";
import React from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaGithub,
} from "react-icons/fa";
import { SiLeetcode } from "react-icons/si";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@/context/userContext";

const Footer = () => {
  const { dark } = useUser();
  return (
    <footer className="bg-secondaryBackground text-center text-muted-foreground py-10 px-4">
      <div className="max-w-screen-xl mx-auto space-y-4">
        {/* Logo and Title */}
        <Link href="/" className="flex items-center justify-center space-x-1">
          <div className="h-9 w-9 md:h-11 md:w-11  flex items-center justify-center">
            <Image
              src={dark ? "/logo_light.png" : "/logo_dark.png"}
              alt="Logo"
              width={30}
              height={30}
              priority
            />
          </div>
          <span className="font-semibold text-lg ">ScalarLearn</span>
        </Link>

        {/* Tagline */}
        <p>Empowering Your Journey of Learning and Career Advancement.</p>

        {/* Social Icons */}
        <div className="flex justify-center space-x-6 text-xl">
          <a href="https://leetcode.com/u/sanketyelugotla/" target="_blank">
            <SiLeetcode />
          </a>
          <a href="https://www.linkedin.com/in/sanketyelugotla/" target="_blank">
            <FaLinkedinIn />
          </a>
          <a href="https://github.com/sanketyelugotla" target="_blank">
            <FaGithub />
          </a>
        </div>

        {/* Divider */}
        <hr className="my-4 border-muted-foreground w-11/12 mx-auto" />

        {/* Footer Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-sm pt-5 ">
          <p>© 2025 ScalarLearn. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            Built with <span>❤️</span> to empower the next generation of learners!
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
