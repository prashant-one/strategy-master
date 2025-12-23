import { Outlet, NavLink } from 'react-router';
import { TrendingUp, Layers, List, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function MainLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // @ts-ignore
    const NavLinkItem = ({ to, icon: Icon, children }: any) => (
        <NavLink
            to={to}
            onClick={() => setIsMobileMenuOpen(false)}
            className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
            }
        >
            <Icon className="w-4 h-4" />
            {children}
        </NavLink>
    );

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="bg-white border-b border-slate-400 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <div className="flex-shrink-0" style={{ width: '40px', height: '40px' }}>
                                    <img
                                        src="/icons/app-icon.png"
                                        alt="AssetMaster Logo"
                                        className="object-contain rounded"
                                        style={{ width: '100%', height: '100%' }}
                                    />
                                </div>
                                <div>
                                    <h1 className="text-slate-900 font-bold text-xl">ASSETMASTER</h1>
                                    {/* <p className="text-xs text-slate-500">Strategy Builder</p> */}
                                </div>
                            </div>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex items-center gap-1">
                                <NavLinkItem to="/" icon={Layers}>Builder</NavLinkItem>
                                <NavLinkItem to="/strategies" icon={List}>Strategies</NavLinkItem>
                                <NavLinkItem to="/history" icon={TrendingUp}>History</NavLinkItem>
                            </nav>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-400 bg-white px-4 py-2 space-y-1">
                        <NavLinkItem to="/" icon={Layers}>Builder</NavLinkItem>
                        <NavLinkItem to="/strategies" icon={List}>Strategies</NavLinkItem>
                        <NavLinkItem to="/history" icon={TrendingUp}>History</NavLinkItem>
                    </div>
                )}
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    );
}
