// Add dynamic CSS variable for sidebar width
document.documentElement.style.setProperty('--sidebar-width', '16rem'); // Default expanded width

// Listen for sidebar collapse state changes
const updateSidebarWidth = (collapsed: boolean) => {
  document.documentElement.style.setProperty('--sidebar-width', collapsed ? '4rem' : '16rem');
};

// Export for use in components
(window as any).updateSidebarWidth = updateSidebarWidth;