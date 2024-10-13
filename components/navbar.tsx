'use client';

import {
    Navbar as NextUINavbar,
    NavbarBrand,
    NavbarContent,
    NavbarItem,
    NavbarMenu,
    NavbarMenuItem,
    NavbarMenuToggle,
} from "@nextui-org/navbar";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem
} from "@nextui-org/dropdown"
import NextLink from "next/link";
import clsx from "clsx";
import { FaUserCircle } from "react-icons/fa";
import { Kbd } from "@nextui-org/kbd";
import { Image } from "@nextui-org/image";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import { SearchIcon, Logo } from "@/components/icons";
import { usePathname, useRouter } from "next/navigation";

// Define the type for dropdown items to ensure type safety
type UserDropdownItem = {
    key: string;
    label: string;
    color?: "danger" | "default" | "primary" | "secondary" | "success" | "warning";
    className?: string;
};

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();

    // Define the menu items for desktop and mobile
    const desktopMenuItems = siteConfig.navItems;
    const mobileMenuItems = siteConfig.navMenuItems;

    // Define Dropdown menu items with strict typing
    const userDropdownItems: UserDropdownItem[] = [
        { key: "profile", label: "Profile" },
        { key: "settings", label: "Settings" },
        { key: "logout", label: "Logout", color: "danger", className: "text-danger" },
    ];

    // Search input component
    const searchInput = (
        <Input
            aria-label="Search"
            classNames={{
                inputWrapper: "bg-default-100",
                input: "text-sm",
            }}
            endContent={
                <Kbd className="hidden lg:inline-block" keys={["command"]}>
                    + K
                </Kbd>
            }
            labelPlacement="outside"
            placeholder="Search..."
            startContent={
                <SearchIcon className="text-base text-default-400 pointer-events-none flex-shrink-0" />
            }
            type="search"
        />
    );

    const handleProfileDropdownAction = (key: string) => {
        if (key === "logout") {
            console.log("Logout clicked");
            // Example:
            // logoutUser();
            // router.push("/login");
        } else {
            // Implement navigation or other actions
            console.log(`${key} clicked`);
            router.push(`/${key}`);
        }
    };

    return (
        <NextUINavbar maxWidth="xl" position="sticky" isBordered>
            {/* Left Section */}
            <NavbarContent className="flex-1" justify="start">
                <NavbarBrand as="li" className="gap-3 max-w-fit">
                    <NextLink href="/" className="flex justify-start items-center gap-1">
                        <Image src="/icon.png" width={40} height={40} alt="VIBE Logo" radius="none" />
                        {/* Uncomment below if you want to display text next to the logo */}
                        {/* <p className="font-bold text-inherit">VIBE</p> */}
                    </NextLink>
                </NavbarBrand>

                {/* Desktop Navigation Links */}
                <ul className="hidden lg:flex gap-4 ml-6">
                    {desktopMenuItems.map((item) => (
                        <NavbarItem key={item.href}>
                            <NextLink
                                href={item.href}
                                className={clsx(
                                    "text-white hover:text-gray-300 transition-colors duration-200",
                                    pathname === item.href ? "text-primary font-medium" : ""
                                )}
                            >
                                {item.label}
                            </NextLink>
                        </NavbarItem>
                    ))}
                </ul>
            </NavbarContent>

            {/* Right Section (Desktop) */}
            <NavbarContent className="hidden lg:flex" justify="end">
                {/* Search Input */}
                <NavbarItem className="mr-4">{searchInput}</NavbarItem>

                {/* Theme Switch */}
                <NavbarItem className="mr-4">
                    <ThemeSwitch />
                </NavbarItem>

                {/* User Profile Dropdown */}
                <NavbarItem>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                variant="light" // Correctly using 'light' variant
                                isIconOnly
                                aria-label="User Profile"
                            >
                                <FaUserCircle className="text-xl" />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="User Actions"
                            onAction={(key) => handleProfileDropdownAction(key as string)}
                        >
                            {userDropdownItems.map((item) => (
                                <DropdownItem key={item.key} className={item.className} color={item.color}>
                                    {item.label}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                </NavbarItem>
            </NavbarContent>

            {/* Right Section (Mobile) */}
            <NavbarContent className="lg:hidden flex items-center justify-end space-x-2">
                {/* Theme Switch */}
                <NavbarItem>
                    <ThemeSwitch />
                </NavbarItem>

                {/* User Profile Dropdown */}
                <NavbarItem>
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                variant="light" // Correctly using 'light' variant
                                isIconOnly
                                aria-label="User Profile"
                            >
                                <FaUserCircle className="text-xl" />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            aria-label="User Actions"
                            onAction={(key) => handleProfileDropdownAction(key as string)}
                        >
                            {userDropdownItems.map((item) => (
                                <DropdownItem key={item.key} className={item.className} color={item.color}>
                                    {item.label}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                </NavbarItem>

                {/* Hamburger Menu Toggle */}
                <NavbarMenuToggle />
            </NavbarContent>

            {/* Mobile Menu */}
            <NavbarMenu>
                {/* Search Input */}
                <NavbarMenuItem>{searchInput}</NavbarMenuItem>

                {/* Mobile Navigation Links */}
                <div className="flex flex-col gap-2 mt-4">
                    {mobileMenuItems.map((item, index) => (
                        <NavbarMenuItem key={`${item.href}-${index}`}>
                            <NextLink
                                href={item.href}
                                className={clsx(
                                    "text-white hover:text-gray-300 transition-colors duration-200",
                                    pathname === item.href ? "text-primary font-medium" : ""
                                )}
                            >
                                {item.label}
                            </NextLink>
                        </NavbarMenuItem>
                    ))}
                </div>
            </NavbarMenu>
        </NextUINavbar>
    );
};

export default Navbar;
