import EtchedAccretion from '../ui/etched-accretion';

interface Props {
  height?: string;
  children?: React.ReactNode;
  preset?: 'crimson' | 'ember' | 'glacier' | 'ash' | 'orchid';
}

/**
 * Hero background used on Login, Founder Command, and Executive Dashboard.
 * Renders the etched-accretion WebGL2 shader. Falls back to a static
 * gradient inside EtchedAccretion if WebGL2 is unavailable, and honours
 * prefers-reduced-motion automatically (component renders one frame).
 */
export default function HeroBackground({ height = '100%', children, preset = 'crimson' }: Props) {
  return (
    <EtchedAccretion
      height={height}
      preset={preset}
      interactive
      renderScale={0.9}
      aria-label="Animated black hole background"
    >
      {children}
    </EtchedAccretion>
  );
}
