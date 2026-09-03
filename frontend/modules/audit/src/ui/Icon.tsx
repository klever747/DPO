export type IconName =
  | 'dashboard'
  | 'building'
  | 'users'
  | 'shield'
  | 'clipboard'
  | 'user-check'
  | 'alert-triangle'
  | 'clock'
  | 'message'
  | 'bar-chart'
  | 'book'
  | 'file-text'
  | 'search'
  | 'archive'
  | 'close'
  | 'plus'
  | 'trash'
  | 'chevron-down'
  | 'check-circle'
  | 'x-circle'
  | 'menu'
  | 'logout'
  | 'inbox';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function Icon({ name, size = 18, className }: IconProps) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', className };

  switch (name) {
    case 'dashboard':
      return (
        <svg {...common} {...strokeProps}>
          <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
          <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.5" />
          <rect x="13" y="10.5" width="7.5" height="10" rx="1.5" />
          <rect x="3.5" y="13.5" width="7.5" height="7" rx="1.5" />
        </svg>
      );
    case 'building':
      return (
        <svg {...common} {...strokeProps}>
          <rect x="4" y="3" width="12" height="18" rx="1" />
          <line x1="7" y1="7" x2="7" y2="7.01" />
          <line x1="10" y1="7" x2="10" y2="7.01" />
          <line x1="13" y1="7" x2="13" y2="7.01" />
          <line x1="7" y1="11" x2="7" y2="11.01" />
          <line x1="10" y1="11" x2="10" y2="11.01" />
          <line x1="13" y1="11" x2="13" y2="11.01" />
          <path d="M16 21V9h4v12" />
        </svg>
      );
    case 'users':
      return (
        <svg {...common} {...strokeProps}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
          <circle cx="17" cy="8.5" r="2.4" />
          <path d="M15.5 14.7c2.5.2 4.7 2.2 4.7 5.3" />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common} {...strokeProps}>
          <path d="M12 3l7 3v5.5c0 4.6-3 8-7 9.5-4-1.5-7-4.9-7-9.5V6l7-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'clipboard':
      return (
        <svg {...common} {...strokeProps}>
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <rect x="9" y="2.5" width="6" height="3" rx="1" />
          <line x1="8" y1="10" x2="16" y2="10" />
          <line x1="8" y1="14" x2="16" y2="14" />
          <line x1="8" y1="18" x2="13" y2="18" />
        </svg>
      );
    case 'user-check':
      return (
        <svg {...common} {...strokeProps}>
          <circle cx="9" cy="8" r="3.5" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <path d="M16 11l1.8 1.8L21 9" />
        </svg>
      );
    case 'alert-triangle':
      return (
        <svg {...common} {...strokeProps}>
          <path d="M12 3.5L2.5 20h19L12 3.5z" />
          <line x1="12" y1="10" x2="12" y2="14.5" />
          <line x1="12" y1="17" x2="12" y2="17.01" />
        </svg>
      );
    case 'clock':
      return (
        <svg {...common} {...strokeProps}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        </svg>
      );
    case 'message':
      return (
        <svg {...common} {...strokeProps}>
          <path d="M4 5h16v11H9l-4 3.5V16H4V5z" />
        </svg>
      );
    case 'bar-chart':
      return (
        <svg {...common} {...strokeProps}>
          <line x1="5" y1="20" x2="5" y2="12" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="19" y1="20" x2="19" y2="9" />
        </svg>
      );
    case 'book':
      return (
        <svg {...common} {...strokeProps}>
          <path d="M4 5.5c2-1 5-1.3 8 0v13c-3-1.3-6-1-8 0v-13z" />
          <path d="M20 5.5c-2-1-5-1.3-8 0v13c3-1.3 6-1 8 0v-13z" />
        </svg>
      );
    case 'file-text':
      return (
        <svg {...common} {...strokeProps}>
          <path d="M6 3h9l4 4v14H6V3z" />
          <path d="M15 3v4h4" />
          <line x1="9" y1="12" x2="15" y2="12" />
          <line x1="9" y1="16" x2="15" y2="16" />
        </svg>
      );
    case 'search':
      return (
        <svg {...common} {...strokeProps}>
          <circle cx="10.5" cy="10.5" r="6.5" />
          <line x1="19.5" y1="19.5" x2="15.2" y2="15.2" />
        </svg>
      );
    case 'archive':
      return (
        <svg {...common} {...strokeProps}>
          <rect x="3.5" y="4" width="17" height="4.5" rx="1" />
          <path d="M5 8.5v10a1.5 1.5 0 001.5 1.5h11a1.5 1.5 0 001.5-1.5v-10" />
          <line x1="10" y1="12.5" x2="14" y2="12.5" />
        </svg>
      );
    case 'close':
      return (
        <svg {...common} {...strokeProps}>
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      );
    case 'plus':
      return (
        <svg {...common} {...strokeProps}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case 'trash':
      return (
        <svg {...common} {...strokeProps}>
          <line x1="4" y1="7" x2="20" y2="7" />
          <path d="M6 7l1 13a1.5 1.5 0 001.5 1.4h7a1.5 1.5 0 001.5-1.4l1-13" />
          <path d="M9.5 7V4.8A1 1 0 0110.5 4h3a1 1 0 011 .8V7" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      );
    case 'chevron-down':
      return (
        <svg {...common} {...strokeProps}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    case 'check-circle':
      return (
        <svg {...common} {...strokeProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5l2.5 2.5L16 9.5" />
        </svg>
      );
    case 'x-circle':
      return (
        <svg {...common} {...strokeProps}>
          <circle cx="12" cy="12" r="9" />
          <line x1="9.5" y1="9.5" x2="14.5" y2="14.5" />
          <line x1="14.5" y1="9.5" x2="9.5" y2="14.5" />
        </svg>
      );
    case 'menu':
      return (
        <svg {...common} {...strokeProps}>
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      );
    case 'logout':
      return (
        <svg {...common} {...strokeProps}>
          <path d="M9 4H5.5A1.5 1.5 0 004 5.5v13A1.5 1.5 0 005.5 20H9" />
          <line x1="20" y1="12" x2="10" y2="12" />
          <polyline points="16 8 20 12 16 16" />
        </svg>
      );
    case 'inbox':
      return (
        <svg {...common} {...strokeProps}>
          <path d="M4 12h4l2 3h4l2-3h4" />
          <path d="M4 12l1.5-6.5A1.5 1.5 0 016.95 4.3h10.1a1.5 1.5 0 011.45 1.2L20 12v6.5A1.5 1.5 0 0118.5 20h-13A1.5 1.5 0 014 18.5V12z" />
        </svg>
      );
    default:
      return null;
  }
}
