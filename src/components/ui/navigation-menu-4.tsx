import { BookOpenIcon, InfoIcon, LifeBuoyIcon } from "lucide-react"

import { cn } from "../../lib/utils"
import { Button } from "./button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./navigation-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

// Navigation links array to be used in both desktop and mobile menus
const navigationLinks = [
  { href: "/", label: "Home" },
  {
    label: "Explore",
    submenu: true,
    type: "description",
    items: [
      {
        href: "/",
        label: "All Events",
        description: "Browse thousands of incredible experiences.",
      },
      {
        href: "/",
        label: "Categories",
        description: "Filter by music, tech, art and more.",
      },
    ],
  },
  {
    label: "Pricing",
    submenu: true,
    type: "simple",
    items: [
      { href: "#", label: "Standard" },
      { href: "#", label: "Premium" },
      { href: "#", label: "Enterprise" },
    ],
  },
  {
    label: "About",
    submenu: true,
    type: "icon",
    items: [
      { href: "#", label: "Getting Started", icon: "BookOpenIcon" },
      { href: "#", label: "Support", icon: "LifeBuoyIcon" },
      { href: "#", label: "About Us", icon: "InfoIcon" },
    ],
  },
]

export default function NavigationMenu4() {
  return (
    <header className="border-b border-[#26272B] bg-[#0B0B0F]/90 backdrop-blur-md px-4 md:px-6 sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between gap-4 max-w-[1200px] mx-auto">
        {/* Left side */}
        <div className="flex items-center gap-2">
          {/* Mobile menu trigger */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
              >
                <svg
                  className="pointer-events-none"
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 12L20 12"
                    className="origin-center -translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-x-0 group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[315deg]"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.8)] group-aria-expanded:rotate-45"
                  />
                  <path
                    d="M4 12H20"
                    className="origin-center translate-y-[7px] transition-all duration-300 ease-[cubic-bezier(.5,.85,.25,1.1)] group-aria-expanded:translate-y-0 group-aria-expanded:rotate-[135deg]"
                  />
                </svg>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0 md:gap-2">
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index} className="w-full">
                      {link.submenu ? (
                        <>
                          <div className="text-[#A1A1AA] px-2 py-1.5 text-xs font-medium">
                            {link.label}
                          </div>
                          <ul>
                            {link.items.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                <NavigationMenuLink
                                  href={item.href}
                                  className="py-1.5 block text-[#E4E4E7] hover:text-white"
                                >
                                  {item.label}
                                </NavigationMenuLink>
                              </li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <NavigationMenuLink href={link.href} className="py-1.5 block text-[#E4E4E7] hover:text-white">
                          {link.label}
                        </NavigationMenuLink>
                      )}
                      
                      {index < navigationLinks.length - 1 &&
                        ((!link.submenu &&
                          navigationLinks[index + 1].submenu) ||
                          (link.submenu &&
                            !navigationLinks[index + 1].submenu) ||
                          (link.submenu &&
                            navigationLinks[index + 1].submenu &&
                            link.type !== navigationLinks[index + 1].type)) && (
                          <div
                            role="separator"
                            aria-orientation="horizontal"
                            className="bg-[#26272B] -mx-1 my-1 h-px w-full"
                          />
                        )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>
          {/* Main nav */}
          <div className="flex items-center gap-6">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-8 h-8 bg-[#7C5CFF] text-[#FFFFFF] rounded-lg flex items-center justify-center font-bold text-lg">
                 P
              </div>
              <span className="text-xl font-bold tracking-tight text-[#FFFFFF]">PULSE</span>
            </a>
            {/* Navigation menu */}
            <div className="max-md:hidden">
              <NavigationMenu>
                <NavigationMenuList>
                  {navigationLinks.map((link, index) => (
                    <NavigationMenuItem key={index}>
                      {link.submenu ? (
                        <>
                          <NavigationMenuTrigger className="text-[#A1A1AA] hover:text-white bg-transparent px-2 py-1.5 font-medium border-0 focus:border-0 hover:bg-transparent">
                            {link.label}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul className={cn(
                              "grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]",
                              link.type === "description" && "md:grid-cols-1"
                            )}>
                              {link.items.map((item, itemIndex) => (
                                <li key={itemIndex}>
                                  <NavigationMenuLink asChild>
                                    <a
                                      href={item.href}
                                      className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-[#151821] hover:text-white focus:bg-[#151821] focus:text-white"
                                    >
                                      {/* Display icon if present */}
                                      {link.type === "icon" && "icon" in item && (
                                        <div className="flex items-center gap-2">
                                          {item.icon === "BookOpenIcon" && (
                                            <BookOpenIcon
                                              size={16}
                                              className="text-[#A1A1AA]"
                                              aria-hidden="true"
                                            />
                                          )}
                                          {item.icon === "LifeBuoyIcon" && (
                                            <LifeBuoyIcon
                                              size={16}
                                              className="text-[#A1A1AA]"
                                              aria-hidden="true"
                                            />
                                          )}
                                          {item.icon === "InfoIcon" && (
                                            <InfoIcon
                                              size={16}
                                              className="text-[#A1A1AA]"
                                              aria-hidden="true"
                                            />
                                          )}
                                          <div className="text-sm font-medium leading-none text-[#FFFFFF]">
                                            {item.label}
                                          </div>
                                        </div>
                                      )}

                                      {/* Display label with description if present */}
                                      {link.type === "description" && "description" in item && (
                                        <>
                                          <div className="text-sm font-medium leading-none text-[#FFFFFF]">
                                            {item.label}
                                          </div>
                                          <p className="line-clamp-2 text-sm leading-snug text-[#A1A1AA] pt-1.5">
                                            {item.description}
                                          </p>
                                        </>
                                      )}

                                      {/* Display simple label if simple type */}
                                      {link.type === "simple" && (
                                        <div className="text-sm font-medium leading-none text-[#FFFFFF]">
                                          {item.label}
                                        </div>
                                      )}
                                    </a>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </NavigationMenuContent>
                        </>
                      ) : (
                        <NavigationMenuLink asChild>
                          <a
                            href={link.href}
                            className="text-[#A1A1AA] hover:text-white py-1.5 px-2 font-medium"
                          >
                            {link.label}
                          </a>
                        </NavigationMenuLink>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
        </div>
        {/* Right side */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="text-sm text-[#A1A1AA] hover:text-[#FFFFFF] hidden sm:inline-flex px-0 hover:bg-transparent">
            <a href="/login">Sign In</a>
          </Button>
          <Button asChild className="text-sm bg-[#7C5CFF] text-[#FFFFFF] hover:bg-[#6D4EFF] hidden sm:inline-flex">
            <a href="/register">Get Started</a>
          </Button>
        </div>
      </div>
    </header>
  )
}
