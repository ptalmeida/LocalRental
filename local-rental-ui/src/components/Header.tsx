import { theme } from '../theme';
import NavLink from './NavLink';

interface HeaderProps {
  onShowStats: () => void;
  showStats?: boolean;
}

export default function Header({ onShowStats, showStats = false }: HeaderProps) {
  return (
    <>
      <style>{`
        .nav-link:hover .nav-link-underline {
          width: 90%;
          opacity: 1;
          left: 5%;
        }
        .icon-link:hover .icon-svg {
          transform: rotate(90deg);
        }
      `}</style>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: theme.layout.headerHeight,
          backgroundColor: theme.colors.navy,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: theme.layout.maxWidth,
            margin: '0 auto',
            padding: `0 ${theme.spacing.xl}`,
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'nowrap',
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              fontFamily: theme.typography.fontHeading,
              fontWeight: theme.typography.weightBold,
              color: theme.colors.textOnNavy,
            }}
          >
            LocalRental.
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center' }}>
            <NavLink onClick={() => showStats && onShowStats()} active={!showStats}>
              Map
            </NavLink>
            <div style={{ marginLeft: theme.spacing.md }}>
              <NavLink onClick={() => !showStats && onShowStats()} active={showStats}>
                Statistics
              </NavLink>
            </div>
            <div style={{ marginLeft: theme.spacing.md }}>
              <NavLink href="https://www.ptalmeida.com" external>
                ptalmeida.com
              </NavLink>
            </div>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '30px',
                width: '30px',
                margin: `0 ${theme.spacing.sm}`,
                padding: 0,
                color: theme.colors.textOnNavy,
                transition: theme.transitions.fast,
                background: 'transparent',
                border: 'none',
                outline: 'none',
              }}
              className="icon-link"
            >
              <svg
                style={{
                  width: '20px',
                  height: '20px',
                  transition: `transform ${theme.transitions.fast}`,
                }}
                fill="currentColor"
                viewBox="0 0 24 24"
                className="icon-svg"
              >
                <path d="M10.9,2.1c-4.6,0.5-8.3,4.2-8.8,8.7c-0.5,4.7,2.2,8.9,6.3,10.5C8.7,21.4,9,21.2,9,20.8v-1.6c0,0-0.4,0.1-0.9,0.1 c-1.4,0-2-1.2-2.1-1.9c-0.1-0.4-0.3-0.7-0.6-1C5.1,16.3,5,16.3,5,16.2C5,16,5.3,16,5.4,16c0.6,0,1.1,0.7,1.3,1c0.5,0.8,1.1,1,1.4,1 c0.4,0,0.7-0.1,0.9-0.2c0.1-0.7,0.4-1.4,1-1.8c-2.3-0.5-4-1.8-4-4c0-1.1,0.5-2.2,1.2-3C7.1,8.8,7,8.3,7,7.6C7,7.2,7,6.6,7.3,6 c0,0,1.4,0,2.8,1.3C10.6,7.1,11.3,7,12,7s1.4,0.1,2,0.3C15.3,6,16.8,6,16.8,6C17,6.6,17,7.2,17,7.6c0,0.8-0.1,1.2-0.2,1.4 c0.7,0.8,1.2,1.8,1.2,3c0,2.2-1.7,3.5-4,4c0.6,0.5,1,1.4,1,2.3v2.6c0,0.3,0.3,0.6,0.7,0.5c3.7-1.5,6.3-5.1,6.3-9.3 C22,6.1,16.9,1.4,10.9,2.1z"></path>
              </svg>
            </a>
          </nav>
        </div>
      </header>
      {/* Spacer to prevent content from going under fixed header */}
      <div style={{ height: theme.layout.headerHeight }} />
    </>
  );
}
