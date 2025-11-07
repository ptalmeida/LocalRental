import { theme } from '../theme';

interface NavLinkProps {
  onClick?: () => void;
  href?: string;
  external?: boolean;
  children: React.ReactNode;
  active?: boolean;
}

export default function NavLink({ onClick, href, external, children, active }: NavLinkProps) {
  const baseStyles: React.CSSProperties = {
    fontFamily: theme.typography.fontHeading,
    fontWeight: active ? theme.typography.weightBold : theme.typography.weightRegular,
    color: theme.colors.textOnNavy,
    textDecoration: 'none',
    position: 'relative',
    cursor: 'pointer',
    transition: theme.transitions.fast,
  };

  const content = (
    <>
      {children}
      <span
        className="nav-link-underline"
        style={{
          position: 'absolute',
          top: '65%',
          left: active ? '5%' : '0%',
          width: active ? '90%' : '0%',
          height: '2px',
          backgroundColor: theme.colors.textOnNavy,
          opacity: active ? 1 : 0,
          transition: theme.transitions.fast,
          transitionDelay: '0.2s',
        }}
      />
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        style={baseStyles}
        className="nav-link"
      >
        {content}
      </a>
    );
  }

  return (
    <button
      onClick={onClick}
      style={{
        ...baseStyles,
        border: 'none',
        background: 'transparent',
        padding: 0
      }}
      className="nav-link"
    >
      {content}
    </button>
  );
}
