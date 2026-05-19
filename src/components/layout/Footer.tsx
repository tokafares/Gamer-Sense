const InstagramIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
  </svg>
)

const TwitterXIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const FacebookIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const socialLinks = [
  { Icon: InstagramIcon, label: 'Instagram' },
  { Icon: TwitterXIcon,  label: 'Twitter / X' },
  { Icon: FacebookIcon,  label: 'Facebook' },
]

export const Footer = () => (
  <footer className="bg-gs-footer w-full overflow-hidden" style={{ minHeight: '380px' }}>
    <div className="max-w-7xl mx-auto flex relative" style={{ minHeight: '380px' }}>

      {/* LEFT: woman+laptop illustration */}
      {/* TODO: replace with actual woman+laptop illustration asset (position absolute, bottom-0, left-0) */}
      <div className="relative w-1/2 flex-shrink-0">
        <div className="absolute bottom-0 left-0 w-full h-full bg-gs-card flex items-end justify-center pb-6">
          <span className="text-gs-textMuted text-xs">[ illustration: woman with laptop ]</span>
        </div>
      </div>

      {/* RIGHT: about / quick links / social */}
      <div className="w-1/2 flex flex-col justify-center py-10 pl-8">
        <h3 className="text-gs-teal font-bold text-xl">About Us</h3>
        <p className="text-gs-textMuted text-sm mt-2 max-w-xs leading-relaxed">
          Our mission is to enhance your League of Legends gameplay through strategic decision-making.
        </p>

        <h4 className="text-gs-teal font-semibold text-base mt-6 mb-2">Quick Link</h4>
        <div className="flex gap-6">
          <a href="#" className="text-gs-text text-sm hover:text-gs-teal transition-colors">Features</a>
          <a href="#" className="text-gs-text text-sm hover:text-gs-teal transition-colors">Community</a>
          <a href="#" className="text-gs-text text-sm hover:text-gs-teal transition-colors">Contact</a>
        </div>

        <div className="flex gap-3 mt-6">
          {socialLinks.map(({ Icon, label }) => (
            <a
              key={label}
              href="#"
              aria-label={label}
              className="w-8 h-8 border border-gs-border rounded flex items-center justify-center text-gs-textMuted hover:border-gs-teal hover:text-gs-teal transition-colors"
            >
              <Icon />
            </a>
          ))}
        </div>
      </div>

    </div>
  </footer>
)

export default Footer
