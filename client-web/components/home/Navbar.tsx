'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, LogOut, User } from 'lucide-react';
import Image from 'next/image';
import { LoginModal } from '@/components/auth/LoginModal';
import { RegisterModal } from '@/components/auth/RegisterModal';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Navbar = () => {
  const { user, isLoading, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About us' },
    { href: '/support', label: 'Support' },
    { href: '/hotels/search', label: 'Hotels' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm mb-7">
      {/* Top Announcement Banner */}
      <div className="bg-[#E72858] text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-3 py-1 text-sm sm:text-base">
            <span className="text-center">
              Join 10,000+ creators building websites with us!
            </span>
            <Link
              href="#get-started"
              className="rounded px-3 py-1 font-semibold underline transition hover:bg-white/20"
            >
              [ Get Started Free ]
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            {/* Logo - Stylized A with gradient */}
            <Link href="/" className="text-xl font-bold text-[#212529] hover:text-[#E72858] transition">
                <Image src="/Logo/Logo-03 1.png" alt="Ajiw.ma" width={100} height={100} />
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#212529] transition hover:text-[#E72858]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex md:items-center md:gap-4">
            {!isLoading && (
              user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-[#212529]">
                    {user.firstName} {user.lastName}
                  </span>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="border-2 border-[#E72858] text-[#E72858] hover:bg-[#E72858] hover:text-white"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setLoginModalOpen(true)}
                    className="rounded-lg border-2 border-[#E72858] bg-white px-4 py-2 text-sm font-semibold text-[#E72858] transition hover:bg-[#E72858] hover:text-white"
                  >
                    Login
                  </button>
                  <Link
                    href="/communities"
                    className="rounded-lg border-2 border-[#E72858] px-4 py-2 text-sm font-semibold text-white bg-[#E72858] hover:text-white"
                  >
                    Join a Community
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-[#212529] hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white py-4">
            <div className="flex flex-col gap-4 px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium text-[#212529] transition hover:text-[#E72858]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-2">
                {!isLoading && (
                  user ? (
                    <div className="flex flex-col gap-3">
                      <div className="text-sm font-medium text-[#212529] px-4">
                        {user.firstName} {user.lastName}
                      </div>
                      <Button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                        variant="outline"
                        className="border-2 border-[#E72858] text-[#E72858] hover:bg-[#E72858] hover:text-white"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setLoginModalOpen(true);
                        }}
                        className="rounded-lg border-2 border-[#E72858] bg-white px-4 py-2 text-center text-sm font-semibold text-[#E72858] transition hover:bg-[#E72858] hover:text-white"
                      >
                        Login
                      </button>
                      <Link
                        href="/communities"
                        className="rounded-lg bg-[#E72858] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-[#C2185B]"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Join a Community
                      </Link>
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modals */}
      <LoginModal 
        open={loginModalOpen} 
        onOpenChange={setLoginModalOpen}
        onSwitchToRegister={() => setRegisterModalOpen(true)}
      />
      <RegisterModal 
        open={registerModalOpen} 
        onOpenChange={setRegisterModalOpen}
        onSwitchToLogin={() => setLoginModalOpen(true)}
      />
    </header>
  );
};

export default Navbar;

